"""
orchestrator.py
---------------
Self-contained AuditOrchestrator that wraps the five module classes
and the Council of Experts / Arbitrator logic from the notebooks.

This file replaces the inline class defined in
Orchestration_Engine_and_Council_of_Experts.ipynb so the FastAPI
server can import it cleanly.

Module paths are added by main.py before this is imported.
"""

import json
import sys
from pathlib import Path
from typing import Any

from openai import OpenAI

# ── Module imports ────────────────────────────────────────────────────────────
# main.py prepends the five-module subdirectories to sys.path before
# importing this file, so these imports resolve correctly at runtime.

from governance_module    import GovernanceModule    # type: ignore[import]
from fairness_module      import FairnessModule      # type: ignore[import]
from security_module      import SecurityModule      # type: ignore[import]
from transparency_module  import TransparencyModule  # type: ignore[import]
from performance_module   import PerformanceModule   # type: ignore[import]

client = OpenAI()   # reads OPENAI_API_KEY from environment


# ── Normalisation helper (mirrors normalize_results from notebook) ────────────

def _to_dict(obj: Any) -> Any:
    """Recursively convert Pydantic models / dataclasses to plain dicts."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "__dict__"):
        return {k: _to_dict(v) for k, v in obj.__dict__.items() if not k.startswith("_")}
    if isinstance(obj, (list, tuple)):
        return [_to_dict(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _to_dict(v) for k, v in obj.items()}
    return obj


# ── Peer-review prompt helper ─────────────────────────────────────────────────

_PEER_REVIEW_SYSTEM = (
    "You are a senior AI auditor reviewing another module's findings. "
    "Respond ONLY in JSON with keys: reviewer_module, reviewed_module, comment, flag (bool)."
)

_PEER_REVIEW_PAIRS = [
    # (reviewer_module_id, reviewed_module_id, review_question)
    ("M1_GOVERNANCE",    "M2_FAIRNESS",
     "Does the governance framework assign fairness accountability owners?"),
    ("M2_FAIRNESS",      "M3_SECURITY",
     "Do access controls suggest differential data access across demographics?"),
    ("M3_SECURITY",      "M4_EXPLAINABILITY",
     "Are security incident responses explainable and documented to PCAOB AS 1105 standards?"),
    ("M4_EXPLAINABILITY","M5_ACCURACY",
     "Is performance degradation explainable and traceable to specific model components?"),
    ("M5_ACCURACY",      "M1_GOVERNANCE",
     "Is model performance monitoring mandated and are drift alert accountabilities clear?"),
]


# ── AuditOrchestrator ─────────────────────────────────────────────────────────

class AuditOrchestrator:
    """
    Runs the full 5-module audit pipeline:
      1. Five domain modules (governance → fairness → security → transparency → performance)
      2. Council of Experts cross-module peer review
      3. Arbitrator synthesis → final PASS / FAIL / ESCALATE decision
    """

    def __init__(self):
        self.governance    = GovernanceModule()
        self.fairness      = FairnessModule()
        self.security      = SecurityModule()
        self.transparency  = TransparencyModule()
        self.performance   = PerformanceModule()

    # ── Stage 1: Domain modules ───────────────────────────────────────────────

    def run(self, document_text: str) -> dict:
        """
        Run all five modules synchronously and return a summary dict.
        Used by the Colab notebooks and by the FastAPI background task
        (which calls each module's .run() individually for streaming).
        """
        print(" Running AI Audit Pipeline...\n")

        raw_results: dict[str, Any] = {}

        for attr, module_id, label in [
            ("governance",   "M1_GOVERNANCE",    "Governance & Compliance"),
            ("fairness",     "M2_FAIRNESS",       "Fairness & Bias"),
            ("security",     "M3_SECURITY",       "Security & Privacy"),
            ("transparency", "M4_EXPLAINABILITY", "Explainability & Audit Trail"),
            ("performance",  "M5_ACCURACY",       "Accuracy & Performance"),
        ]:
            print(f"Running {label} Module…")
            result = getattr(self, attr).run(document_text)
            raw_results[module_id] = result

        results = {k: _to_dict(v) for k, v in raw_results.items()}

        summary: dict[str, dict] = {}
        for mid, res in raw_results.items():
            score = res.module_score if hasattr(res, "module_score") else res["module_score"]
            risk  = res.risk_level   if hasattr(res, "risk_level")   else res["risk_level"]
            summary[mid] = {
                "score":    score,
                "risk":     risk,
                "severity": "PASS" if score >= 0.75 else "FAIL",
            }

        return {"results": results, "summary": summary}

    # ── Stage 2: Peer review ──────────────────────────────────────────────────

    def run_peer_review(
        self,
        module_results: dict[str, Any],
        document_text: str,
    ) -> list[dict]:
        """
        Each module reviews one neighbour's findings using the LLM.
        Returns a list of peer-review cards.
        """
        reviews: list[dict] = []

        for reviewer_id, reviewed_id, question in _PEER_REVIEW_PAIRS:
            reviewed = module_results.get(reviewed_id, {})
            score    = reviewed.get("module_score", "N/A")
            findings_summary = _summarise_findings(reviewed.get("findings", []))

            prompt = (
                f"You are reviewing module {reviewed_id} (score: {score}).\n"
                f"Findings summary:\n{findings_summary}\n\n"
                f"Review question: {question}\n\n"
                "Respond ONLY in JSON: "
                '{"reviewer_module": "...", "reviewed_module": "...", "comment": "...", "flag": true/false}'
            )

            try:
                resp = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": _PEER_REVIEW_SYSTEM},
                        {"role": "user",   "content": prompt},
                    ],
                    max_tokens=300,
                )
                raw = resp.choices[0].message.content or "{}"
                card = json.loads(raw)
                # Ensure required keys are present
                card.setdefault("reviewer_module", reviewer_id)
                card.setdefault("reviewed_module", reviewed_id)
                card.setdefault("flag", False)
                reviews.append(card)
            except Exception as exc:
                reviews.append({
                    "reviewer_module": reviewer_id,
                    "reviewed_module": reviewed_id,
                    "comment": f"Peer review failed: {exc}",
                    "flag": False,
                })

        return reviews

    # ── Stage 3: Arbitrator synthesis ─────────────────────────────────────────

    def arbitrator_synthesis(
        self,
        scores: dict[str, float],
        divergence: str,
        peer_summary: str,
    ) -> dict:
        """
        Mirrors arbitrator_synthesis() from the notebook.
        Accepts module scores, divergence label, and a peer-review summary string.
        Returns a dict: {final_score, confidence, decision, divergence, notes}.
        """
        vals = list(scores.values())
        avg  = sum(vals) / len(vals) if vals else 0.0
        spread = max(vals) - min(vals) if vals else 0.0

        # Build a prompt for the arbitrator
        score_lines = "\n".join(f"  {mid}: {s:.3f}" for mid, s in scores.items())
        prompt = (
            "You are the final arbitrator of an AI system audit.\n\n"
            f"Module scores:\n{score_lines}\n\n"
            f"Divergence level: {divergence}\n"
            f"Peer-review summary:\n{peer_summary}\n\n"
            "Based on these results, produce a final audit decision.\n"
            "Return ONLY JSON with keys:\n"
            "  final_score  (float 0-100, weighted composite)\n"
            "  confidence   (float 0-1)\n"
            "  decision     ('PASS' | 'FAIL' | 'ESCALATE')\n"
            "  divergence   (repeat the divergence label)\n"
            "  notes        (one sentence rationale)\n"
        )

        try:
            resp = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a senior AI audit arbitrator. Return ONLY JSON."},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=300,
            )
            raw = resp.choices[0].message.content or "{}"
            result = json.loads(raw)
        except Exception:
            # Deterministic fallback — no LLM call
            avg_100 = round(avg * 100, 1)
            confidence = max(0.0, round(1.0 - spread, 2))
            if divergence == "critical":
                decision = "ESCALATE"
                notes = "Critical divergence across modules → mandatory human review"
            elif avg >= 0.75:
                decision = "PASS"
                notes = "All modules meet or exceed the 0.75 pass threshold"
            else:
                decision = "FAIL"
                notes = "One or more modules scored below the 0.75 pass threshold"
            result = {
                "final_score": avg_100,
                "confidence":  confidence,
                "decision":    decision,
                "divergence":  divergence,
                "notes":       notes,
            }

        return result


# ── Internal helpers ──────────────────────────────────────────────────────────

def _summarise_findings(findings: list[dict], max_items: int = 5) -> str:
    """Return a compact text summary of the worst findings."""
    if not findings:
        return "No findings available."
    worst = sorted(findings, key=lambda f: f.get("score", 1.0))[:max_items]
    lines = []
    for f in worst:
        lines.append(
            f"  [{f.get('criterion_id','?')}] score={f.get('score','?'):.2f} "
            f"severity={f.get('severity','?')} — {f.get('description','')[:80]}"
        )
    return "\n".join(lines)