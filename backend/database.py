"""
database.py
-----------
SQLite persistence layer for TrustGuard.

Tables
  audits        — one row per audit session (id, name, status, files metadata)
  audit_results — one row per completed audit (full JSON results blob)

Switch to Postgres for production by changing DATABASE_URL in .env:
  DATABASE_URL=postgresql://user:pass@host:5432/trustguard
"""

import json
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator, Optional

# ── Config ─────────────────────────────────────────────────────────────────

DB_PATH = Path(__file__).parent / "trustguard.db"


# ── Connection helper ───────────────────────────────────────────────────────

@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
    """Yield a configured SQLite connection, auto-commit or rollback."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # safe for concurrent reads
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ── Schema init ─────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create tables if they don't exist. Safe to call on every startup."""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS audits (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                status      TEXT NOT NULL DEFAULT 'pending',
                files_json  TEXT NOT NULL DEFAULT '[]',
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_results (
                audit_id    TEXT PRIMARY KEY REFERENCES audits(id) ON DELETE CASCADE,
                result_json TEXT NOT NULL,
                created_at  TEXT NOT NULL
            );
        """)


# ── Audit CRUD ──────────────────────────────────────────────────────────────

def create_audit(name: str, files: list[dict]) -> dict:
    """
    Insert a new audit row.

    files: list of {"name": str, "size": int}
    Returns the full audit row as a dict.
    """
    audit_id = str(uuid.uuid4())
    now = _now()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO audits (id, name, status, files_json, created_at, updated_at)
            VALUES (?, ?, 'pending', ?, ?, ?)
            """,
            (audit_id, name, json.dumps(files), now, now),
        )
    row = get_audit(audit_id)
    assert row is not None, f"Failed to retrieve audit {audit_id} after insert"
    return row


def get_audit(audit_id: str) -> Optional[dict]:
    """Return audit row as dict, or None if not found."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM audits WHERE id = ?", (audit_id,)
        ).fetchone()
    if row is None:
        return None
    return _audit_row_to_dict(row)


def list_audits() -> list[dict]:
    """Return all audits ordered by created_at descending."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM audits ORDER BY created_at DESC"
        ).fetchall()
    return [_audit_row_to_dict(r) for r in rows]


def update_audit_status(audit_id: str, status: str) -> None:
    """
    Update status field.
    Valid values: 'pending' | 'running' | 'completed' | 'failed' | 'escalate'
    """
    with get_conn() as conn:
        conn.execute(
            "UPDATE audits SET status = ?, updated_at = ? WHERE id = ?",
            (status, _now(), audit_id),
        )


def delete_audit(audit_id: str) -> bool:
    """Delete audit and its results (CASCADE). Returns True if row existed."""
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM audits WHERE id = ?", (audit_id,))
    return cur.rowcount > 0


# ── Results CRUD ─────────────────────────────────────────────────────────────

def save_audit_results(audit_id: str, results: dict) -> None:
    """
    Upsert the full AuditResults payload for an audit.
    results: dict that matches the AuditResults Pydantic model.
    """
    now = _now()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO audit_results (audit_id, result_json, created_at)
            VALUES (?, ?, ?)
            ON CONFLICT(audit_id) DO UPDATE
                SET result_json = excluded.result_json
            """,
            (audit_id, json.dumps(results), now),
        )


def get_audit_results(audit_id: str) -> Optional[dict]:
    """Return parsed results dict, or None if not yet available."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT result_json FROM audit_results WHERE audit_id = ?",
            (audit_id,),
        ).fetchone()
    if row is None:
        return None
    return json.loads(row["result_json"])


# ── Internal helpers ─────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _audit_row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "audit_id":   row["id"],
        "name":       row["name"],
        "status":     row["status"],
        "files":      json.loads(row["files_json"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }