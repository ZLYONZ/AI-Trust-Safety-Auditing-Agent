"""
main.py
-------
TrustGuard — FastAPI backend

Endpoints
  POST   /api/audits                   Upload files, create audit
  POST   /api/audits/{id}/execute      Run the 5-module pipeline
  GET    /api/audits/{id}              Poll audit status
  GET    /api/audits/{id}/results      Fetch full results
  GET    /api/audits                   List all audits
  DELETE /api/audits/{id}              Delete audit + results
  WS     /ws/audits/{id}              Stream live progress

Run:
  uvicorn main:app --reload --port 8000

Install deps:
  pip install fastapi uvicorn[standard] python-dotenv pdfplumber python-docx openpyxl
"""

import asyncio
import json
import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import (
    FastAPI, File, Form, HTTPException,
    UploadFile, WebSocket, WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Load .env before anything else ─────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv optional; set env vars manually if needed

# ── Add module paths (mirrors Colab sys.path.append calls) ─────────────────
BASE_DIR = Path(__file__).parent
for sub in ("governance", "fairness", "security", "transparency", "performance"):
    p = BASE_DIR / "five-modules" / sub
    if p.exists() and str(p) not in sys.path:
        sys.path.insert(0, str(p))

# Also support running with modules in the same directory
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# ── Orchestrator is imported lazily inside _run_pipeline ─────────────────────
# We cannot import it at startup because the five-module paths are dynamic.
# _ORCHESTRATOR_AVAILABLE is always True here; the real check is in _run_pipeline.
_ORCHESTRATOR_AVAILABLE = True
AuditOrchestrator = None  # placeholder — replaced by lazy import at runtime

# ── Internal imports ────────────────────────────────────────────────────────
import database as db
from file_parser import extract_text_from_files


# ── Lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="TrustGuard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA / other
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic response models ─────────────────────────────────────────────────

class AuditResponse(BaseModel):
    audit_id: str
    name: str
    status: str
    files: list[dict]
    created_at: str
    updated_at: str


class ExecuteResponse(BaseModel):
    audit_id: str
    status: str
    message: str


class DeleteResponse(BaseModel):
    deleted: bool


# ── WebSocket connection manager ─────────────────────────────────────────────

class ConnectionManager:
    """Track active WebSocket connections keyed by audit_id."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, audit_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.setdefault(audit_id, []).append(ws)

    def disconnect(self, audit_id: str, ws: WebSocket) -> None:
        conns = self._connections.get(audit_id, [])
        if ws in conns:
            conns.remove(ws)

    async def send(self, audit_id: str, payload: dict) -> None:
        """Broadcast a JSON frame to all connections for this audit."""
        dead: list[WebSocket] = []
        for ws in self._connections.get(audit_id, []):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(audit_id, ws)


manager = ConnectionManager()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── REST endpoints ────────────────────────────────────────────────────────────

@app.post("/api/audits", response_model=AuditResponse)
async def create_audit(
    name: str = Form(...),
    files: list[UploadFile] = File(...),
):
    """
    Accept uploaded documents and create a new audit session.
    Files are stored in memory for now; add disk/S3 persistence as needed.
    """
    file_meta = [
        {"name": f.filename or "unnamed", "size": f.size or 0}
        for f in files
    ]
    audit = db.create_audit(name=name, files=file_meta)

    # Store raw bytes on the audit record so /execute can read them.
    # In production, write to disk or object storage here instead.
    _file_store[audit["audit_id"]] = [
        (await f.read(), f.filename or "unnamed") for f in files
    ]

    return audit


@app.post("/api/audits/{audit_id}/execute", response_model=ExecuteResponse)
async def execute_audit(audit_id: str):
    """
    Kick off the 5-module orchestration pipeline in a background task.
    Returns immediately; progress streams over WebSocket /ws/audits/{id}.
    """
    audit = _require_audit(audit_id)

    if audit["status"] == "running":
        raise HTTPException(409, "Audit is already running.")
    if audit["status"] in ("completed", "escalate"):
        raise HTTPException(409, "Audit already completed. Create a new audit to re-run.")

    db.update_audit_status(audit_id, "running")
    asyncio.create_task(_run_pipeline(audit_id))

    return ExecuteResponse(
        audit_id=audit_id,
        status="running",
        message="Audit pipeline started. Connect to /ws/audits/{audit_id} for live progress.",
    )


@app.get("/api/audits/{audit_id}", response_model=AuditResponse)
def get_audit_status(audit_id: str):
    """Poll current status of an audit."""
    return _require_audit(audit_id)


@app.get("/api/audits/{audit_id}/results")
def get_audit_results(audit_id: str):
    """
    Return full AuditResults once status is 'completed' or 'escalate'.
    Raises 202 while still running, 404 if not found.
    """
    audit = _require_audit(audit_id)
    results = db.get_audit_results(audit_id)
    if results is None:
        if audit["status"] in ("pending", "running"):
            raise HTTPException(404, "Results not ready yet.")
        raise HTTPException(404, f"No results found for audit '{audit_id}'.")
    return results


@app.get("/api/audits", response_model=list[AuditResponse])
def list_audits():
    """List all audit sessions, most recent first."""
    return db.list_audits()


@app.delete("/api/audits/{audit_id}", response_model=DeleteResponse)
def delete_audit(audit_id: str):
    """Delete an audit and all associated results."""
    deleted = db.delete_audit(audit_id)
    if not deleted:
        raise HTTPException(404, f"Audit '{audit_id}' not found.")
    _file_store.pop(audit_id, None)
    return DeleteResponse(deleted=True)


# ── WebSocket endpoint ────────────────────────────────────────────────────────

@app.websocket("/ws/audits/{audit_id}")
async def ws_audit(audit_id: str, websocket: WebSocket):
    """
    Real-time progress stream for an audit.

    Strategy: do not block waiting for client messages at all.
    Just send a ping every 20s and stay open until the audit finishes
    or the client disconnects. The pipeline pushes frames via manager.send().
    """
    await manager.connect(audit_id, websocket)
    try:
        while True:
            await asyncio.sleep(20)
            # Check if client is still connected by sending a ping
            try:
                await websocket.send_json({"type": "ping", "audit_id": audit_id})
            except Exception:
                break  # client gone
            # If audit is done, stop looping
            audit = db.get_audit(audit_id)
            if audit and audit["status"] in ("completed", "failed", "escalate"):
                break
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(audit_id, websocket)


# ── In-memory file store (replace with disk/S3 in production) ────────────────

# { audit_id: [(bytes, filename), ...] }
_file_store: dict[str, list[tuple[bytes, str]]] = {}


# ── Pipeline background task ──────────────────────────────────────────────────

async def _run_pipeline(audit_id: str) -> None:
    """
    Execute all 5 modules + Council of Experts + Arbitrator.
    Streams WebSocket frames at each stage.
    All heavy work is run in a thread pool so the event loop stays free.
    """

    async def emit(payload: dict) -> None:
        payload["audit_id"] = audit_id
        payload["timestamp"] = _now()
        await manager.send(audit_id, payload)

    try:
        # ── 1. Parse uploaded documents ──────────────────────────────────
        await emit({"type": "progress", "stage": "uploading",
                    "message": "Parsing uploaded documents…"})

        files = _file_store.get(audit_id, [])
        if not files:
            raise RuntimeError("No files found for this audit. Upload files first.")

        document_text = await asyncio.get_event_loop().run_in_executor(
            None, extract_text_from_files, files
        )

        # ── 2. Lazy-import and instantiate orchestrator ─────────────────────
        # Import here (not at startup) so all sys.path additions are in effect.
        try:
            from orchestrator import AuditOrchestrator as _OC  # type: ignore[import]
        except Exception as import_err:
            raise RuntimeError(
                f"Failed to import AuditOrchestrator: {import_err}. "
                "Check that orchestrator.py is in backend/ and all "
                "five-modules subdirectories are present and correct."
            ) from import_err
        orchestrator = _OC()

        # ── 3. Run each module, streaming results ─────────────────────────
        MODULE_ORDER = [
            ("governance",    "M1_GOVERNANCE",     "Governance & Compliance"),
            ("fairness",      "M2_FAIRNESS",        "Fairness & Bias"),
            ("security",      "M3_SECURITY",        "Security & Privacy"),
            ("transparency",  "M4_EXPLAINABILITY",  "Explainability & Audit Trail"),
            ("performance",   "M5_ACCURACY",        "Accuracy & Performance"),
        ]

        module_results: dict[str, Any] = {}

        for attr, module_id, module_name in MODULE_ORDER:
            await emit({
                "type": "progress",
                "stage": "module_running",
                "module": module_id,
                "message": f"Running {module_name}…",
            })

            module_fn = getattr(orchestrator, attr)
            result = await asyncio.get_event_loop().run_in_executor(
                None, module_fn.run, document_text
            )

            result_dict = result.model_dump()
            module_results[module_id] = result_dict

            await emit({
                "type": "module_complete",
                "stage": "module_complete",
                "module_id": module_id,
                "module_name": module_name,
                "result": result_dict,
                "message": f"{module_name} complete — score: {result.module_score:.3f}",
            })

        # ── 4. Council of Experts peer review ─────────────────────────────
        await emit({"type": "progress", "stage": "peer_review",
                    "message": "Running Council of Experts peer review…"})

        peer_reviews = await asyncio.get_event_loop().run_in_executor(
            None, _run_peer_review, orchestrator, module_results, document_text
        )

        for review in peer_reviews:
            await emit({
                "type": "peer_review",
                "reviewer": review.get("reviewer_module", ""),
                "reviewed": review.get("reviewed_module", ""),
                "comment":  review.get("comment", ""),
                "flag":     review.get("flag", False),
                "message":  f"Peer review: {review.get('reviewer_module')} → {review.get('reviewed_module')}",
            })

        # ── 5. Arbitrator synthesis ────────────────────────────────────────
        await emit({"type": "progress", "stage": "arbitration",
                    "message": "Running arbitrator synthesis…"})

        scores = {k: v["module_score"] for k, v in module_results.items()}
        divergence, summary = await asyncio.get_event_loop().run_in_executor(
            None, _run_arbitration, orchestrator, scores, peer_reviews
        )

        await emit({
            "type": "arbitration",
            "stage": "arbitration",
            "summary": summary,
            "message": f"Arbitration complete — decision: {summary['decision']}",
        })

        # ── 6. Build and persist final results ────────────────────────────
        key_findings = _extract_key_findings(module_results)

        final_results = {
            "audit_id":        audit_id,
            "audit_name":      (db.get_audit(audit_id) or {}).get("name", audit_id),
            "status":          summary["decision"].lower(),
            "overall_summary": summary,
            "modules":         module_results,
            "peer_reviews":    peer_reviews,
            "key_findings":    key_findings,
        }

        db.save_audit_results(audit_id, final_results)

        terminal_status = (
            "escalate" if summary["decision"] == "ESCALATE"
            else "completed"  # PASS or FAIL both mean audit ran successfully
        )
        db.update_audit_status(audit_id, terminal_status)

        await emit({
            "type": "audit_complete",
            "stage": "complete",
            "final_score": summary["final_score"],
            "decision":    summary["decision"],
            "message":     f"Audit complete — {summary['decision']} ({summary['final_score']}/100)",
        })

    except Exception as exc:
        import traceback
        db.update_audit_status(audit_id, "failed")
        # Send the actual exception type + message so the frontend can display it
        error_text = f"{type(exc).__name__}: {exc}"
        await emit({
            "type": "error",
            "stage": "error",
            "message": error_text,
        })
        # Log full traceback to server terminal
        traceback.print_exc()


# ── Orchestrator helper functions ─────────────────────────────────────────────

def _run_peer_review(
    orchestrator: Any,
    module_results: dict,
    document_text: str,
) -> list[dict]:
    """
    Call the Council of Experts peer review stage.
    Falls back to an empty list if the method doesn't exist yet.
    """
    if hasattr(orchestrator, "run_peer_review"):
        reviews = orchestrator.run_peer_review(module_results, document_text)
        # Normalise to list of dicts
        if reviews and hasattr(reviews[0], "model_dump"):
            return [r.model_dump() for r in reviews]
        return reviews or []
    return []


def _run_arbitration(
    orchestrator: Any,
    scores: dict[str, float],
    peer_reviews: list[dict],
) -> tuple[str, dict]:
    """
    Call arbitrator_synthesis and normalise the output.
    Mirrors the notebook's arbitrator_synthesis(scores, divergence, peer_summary).
    """
    # Calculate divergence (max - min of module scores)
    vals = list(scores.values())
    spread = max(vals) - min(vals) if vals else 0
    divergence = (
        "critical" if spread > 0.3
        else "moderate" if spread > 0.15
        else "minor" if spread > 0.05
        else "none"
    )

    peer_summary = _summarise_peer_reviews(peer_reviews)

    if hasattr(orchestrator, "arbitrator_synthesis"):
        result = orchestrator.arbitrator_synthesis(scores, divergence, peer_summary)
        if hasattr(result, "model_dump"):
            result = result.model_dump()
    else:
        # Fallback calculation matching the notebook's logic
        avg = sum(vals) / len(vals) if vals else 0
        avg_100 = round(avg * 100, 1)
        confidence = round(1.0 - spread, 3)
        if divergence == "critical":
            decision = "ESCALATE"
            notes = "Critical divergence across modules → mandatory human review"
        elif avg >= 0.75:
            decision = "PASS"
            notes = "All modules meet minimum threshold"
        else:
            decision = "FAIL"
            notes = "One or more modules below pass threshold"
        result = {
            "final_score": avg_100,
            "confidence":  confidence,
            "decision":    decision,
            "divergence":  divergence,
            "notes":       notes,
        }

    return divergence, result


def _summarise_peer_reviews(reviews: list[dict]) -> str:
    if not reviews:
        return "No peer reviews available."
    flagged = [r for r in reviews if r.get("flag")]
    lines = [f"Total reviews: {len(reviews)}, flagged: {len(flagged)}"]
    for r in flagged[:5]:
        lines.append(f"  - {r.get('reviewer_module')} flagged {r.get('reviewed_module')}: {r.get('comment', '')[:120]}")
    return "\n".join(lines)


def _extract_key_findings(module_results: dict) -> list[str]:
    """Pull the worst-scoring criterion from each module as key findings."""
    findings: list[str] = []
    for module_id, result in module_results.items():
        worst = min(result.get("findings", []), key=lambda f: f["score"], default=None)
        if worst and worst["score"] < 0.75:
            findings.append(
                f"{worst['criterion_id']} scored {worst['score']:.2f} — {worst['description']}"
            )
    return findings


# ── Internal helpers ─────────────────────────────────────────────────────────

def _require_audit(audit_id: str) -> dict:
    """Return audit dict or raise 404."""
    audit = db.get_audit(audit_id)
    if audit is None:
        raise HTTPException(404, f"Audit '{audit_id}' not found.")
    return audit


# ── Dev entry point ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)