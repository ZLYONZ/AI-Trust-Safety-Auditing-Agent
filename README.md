# TrustGuard — AI Trust & Safety Auditing Platform

TrustGuard is an AI-powered compliance auditing platform that evaluates AI systems across five regulatory modules: **Governance**, **Fairness**, **Security**, **Transparency**, and **Performance**. Upload your AI governance documentation and get a structured audit report with scores, evidence, and risk findings in under 2 minutes.

---

## Architecture

```
AI-Trust-Safety-Auditing-Agent/
├── backend/                      # FastAPI server + Python pipeline
│   ├── main.py                   # API server (REST + WebSocket)
│   ├── database.py               # SQLite persistence
│   ├── file_parser.py            # PDF/DOCX/TXT text extraction
│   ├── orchestrator.py           # AuditOrchestrator + Council of Experts
│   ├── llm_utils.py              # Shared LLM call helper (temperature=0, retries)
│   ├── requirements.txt
│   ├── .env                      # Your OpenAI API key (not committed)
│   └── five-modules/
│       ├── governance/           # Module 1 — ISO 42001, NIST AI RMF, SOX 404
│       ├── fairness/             # Module 2 — GDPR Art. 9/22, CCPA
│       ├── security/             # Module 3 — GDPR Art. 25, encryption, RBAC
│       ├── transparency/         # Module 4 — GDPR Art. 13-14/22, audit trail
│       └── performance/          # Module 5 — GDPR Art. 5(1)(d), drift monitoring
└── frontend/                     # React + TypeScript + Tailwind CSS
    └── src/
        ├── components/layout/    # Header, Layout, LeftSidebar, MainContent,
        │                         #   RightPanel, FileUploadModal
        ├── services/             # auditApi.ts, auditWebSocket.ts
        └── store/                # uiStore.ts (Zustand)
```

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| OpenAI API key | — | [platform.openai.com](https://platform.openai.com) |

---

## Setup — Backend

### 1. Navigate to the backend folder

```bash
cd AI-Trust-Safety-Auditing-Agent/backend
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate        # Mac / Linux
# venv\Scripts\activate         # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set your OpenAI API key

Create a `.env` file in the `backend/` folder:

```bash
# Mac / Linux
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Or open any text editor and create backend/.env manually
```

The `.env` file should contain:

```
OPENAI_API_KEY=sk-your-key-here
```

> **Note:** The platform uses `gpt-4.1-mini` by default. Make sure your API key has access to this model. A full 5-module audit costs approximately $0.15–$0.40 in API credits.

### 5. Start the backend server

```bash
python3 -m uvicorn main:app --reload --port 8000
```

You should see:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Verify it's working by opening **http://localhost:8000/docs** in your browser — the Swagger UI lists all available endpoints.

---

## Setup — Frontend

Open a **new terminal tab** (keep the backend running).

### 1. Navigate to the frontend folder

```bash
cd AI-Trust-Safety-Auditing-Agent/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

You should see:

```
VITE ready in Xms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Running an Audit

1. Open **http://localhost:5173**
2. Click **Start New Audit** (or **New Audit** in the top left)
3. Upload one or more documents (PDF, DOCX, TXT, CSV, JSON, XLSX)
4. Click **Upload & Audit**
5. Watch the 5-module pipeline run in real time (~90 seconds)
6. Results appear automatically — click any module row to see detailed criteria scores, or click any key finding to open the Risks panel

### Sample test document

A pre-built sample document is included for testing:

```
backend/docs/ACME_AI_Governance_Policy.txt
```

This document covers all 22 audit criteria across all 5 modules and should produce a **PASS** or **ESCALATE** result with meaningful evidence excerpts.

---

## Troubleshooting

### `zsh: command not found: uvicorn`

Use the module path instead:
```bash
python3 -m uvicorn main:app --reload --port 8000
```

### `ModuleNotFoundError: No module named 'fastapi'`

The virtual environment isn't activated, or pip installed into a different Python. Run:
```bash
source venv/bin/activate
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

### Upload shows "Pipeline error"

Check the backend terminal — the real error appears there. Common causes:
- OpenAI API key missing or invalid → check `.env`
- API quota exhausted → add credits at [platform.openai.com/settings/billing](https://platform.openai.com/settings/billing)
- Module import failure → verify folder names above

### Results don't appear after audit completes

Click the **↺ refresh icon** in the top-right of the right panel. This manually fetches results from the database. Results are always saved even if the WebSocket connection dropped.

### Teammate can't see results when running on their machine

Each person must run the **backend locally** on their own machine. `localhost:8000` always refers to the current machine — it cannot be shared across computers. Each teammate needs to:
1. Clone the repo
2. Create their own `.env` with the OpenAI key
3. Run both the backend and frontend locally

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.12, FastAPI, Uvicorn, SQLite |
| LLM | OpenAI `gpt-4.1-mini` (temperature=0, seed=42) |
| File parsing | pdfplumber, python-docx, openpyxl |
| Real-time | WebSocket (progress) + REST polling (results) |

---

## Regulatory Coverage

| Framework | Criteria |
|-----------|---------|
| ISO 42001 | AI Governance Policy, AI System Inventory |
| NIST AI RMF | Risk Management (GOVERN, MAP, MEASURE, MANAGE) |
| GDPR | Articles 5, 9, 13, 14, 22, 25, 30, 35 |
| SOX 404 | Internal controls documentation and testing |
| CCPA | Opt-out rights, right to know, data deletion |
| EU AI Act | Article 15 — accuracy, robustness, cybersecurity |