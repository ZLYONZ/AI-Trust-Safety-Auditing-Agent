"""
file_parser.py
--------------
Extract plain text from uploaded audit documents.

Supported formats
  .pdf   — pdfplumber (text-layer PDFs) with pdfminer fallback
  .docx  — python-docx
  .txt / .md / .csv / .json / .xml  — read as UTF-8

Install dependencies:
  pip install pdfplumber python-docx
"""

import io
import json
from pathlib import Path
from typing import Union


# ── Public API ──────────────────────────────────────────────────────────────

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract plain text from a file given its raw bytes and original filename.

    Returns a single UTF-8 string suitable for passing to AuditOrchestrator.run().
    Raises ValueError for unsupported extensions.
    """
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(file_bytes, filename)
    elif suffix in (".docx", ".doc"):
        return _extract_docx(file_bytes, filename)
    elif suffix in (".txt", ".md"):
        return file_bytes.decode("utf-8", errors="replace")
    elif suffix == ".csv":
        return _extract_csv(file_bytes)
    elif suffix == ".json":
        return _extract_json(file_bytes)
    elif suffix in (".xml", ".html", ".htm"):
        return _strip_xml_tags(file_bytes.decode("utf-8", errors="replace"))
    elif suffix in (".xlsx", ".xls"):
        return _extract_xlsx(file_bytes, filename)
    else:
        raise ValueError(
            f"Unsupported file type '{suffix}' for '{filename}'. "
            "Accepted: pdf, docx, txt, md, csv, json, xml, xlsx."
        )


def extract_text_from_files(files: list[tuple[bytes, str]]) -> str:
    """
    Concatenate extracted text from multiple (bytes, filename) pairs.
    Each document is separated by a clear header so the LLM can identify
    which section belongs to which source document.
    """
    parts: list[str] = []
    for file_bytes, filename in files:
        try:
            text = extract_text(file_bytes, filename)
            parts.append(f"=== Document: {filename} ===\n{text.strip()}")
        except ValueError as exc:
            # Skip unsupported files but log a warning inline
            parts.append(f"=== Document: {filename} (SKIPPED — {exc}) ===")
    return "\n\n".join(parts)


# ── Format extractors ────────────────────────────────────────────────────────

def _extract_pdf(file_bytes: bytes, filename: str) -> str:
    try:
        import pdfplumber
    except ImportError:
        raise ImportError(
            "pdfplumber is required for PDF extraction. "
            "Run: pip install pdfplumber"
        )

    text_pages: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_pages.append(page_text)

    if not text_pages:
        # Fallback: pdfminer direct extraction (handles some edge cases)
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract
            text = pdfminer_extract(io.BytesIO(file_bytes))
            return text.strip()
        except ImportError:
            pass
        raise ValueError(
            f"No text could be extracted from '{filename}'. "
            "The PDF may be scanned/image-based. "
            "Consider running OCR before uploading."
        )

    return "\n\n".join(text_pages)


def _extract_docx(file_bytes: bytes, filename: str) -> str:
    try:
        from docx import Document
    except ImportError:
        raise ImportError(
            "python-docx is required for Word document extraction. "
            "Run: pip install python-docx"
        )

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    # Also extract text from tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    paragraphs.append(cell.text.strip())

    return "\n".join(paragraphs)


def _extract_csv(file_bytes: bytes) -> str:
    """Return CSV as readable text — header + rows joined by newlines."""
    import csv
    text = file_bytes.decode("utf-8", errors="replace")
    reader = csv.reader(io.StringIO(text))
    rows = [", ".join(row) for row in reader]
    return "\n".join(rows)


def _extract_json(file_bytes: bytes) -> str:
    """Pretty-print JSON so it reads as prose for the LLM."""
    try:
        data = json.loads(file_bytes.decode("utf-8", errors="replace"))
        return json.dumps(data, indent=2, ensure_ascii=False)
    except json.JSONDecodeError:
        return file_bytes.decode("utf-8", errors="replace")


def _strip_xml_tags(text: str) -> str:
    """Naive tag stripper for XML/HTML — good enough for policy docs."""
    import re
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_xlsx(file_bytes: bytes, filename: str) -> str:
    try:
        import openpyxl
    except ImportError:
        raise ImportError(
            "openpyxl is required for Excel extraction. "
            "Run: pip install openpyxl"
        )

    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    parts: list[str] = []
    for sheet in wb.worksheets:
        parts.append(f"[Sheet: {sheet.title}]")
        for row in sheet.iter_rows(values_only=True):
            cells = [str(c) if c is not None else "" for c in row]
            if any(c.strip() for c in cells):
                parts.append(", ".join(cells))
    return "\n".join(parts)