// ─── Config ───────────────────────────────────────────────────────────────

const API_BASE_URL = 'http://localhost:8000/api';

// ─── Request / Response types ──────────────────────────────────────────────

export interface AuditCreateRequest {
    name: string;
    files: File[];
    urls?: string[];
    githubRepos?: string[];
}

export interface AuditCreateResponse {
    audit_id: string;
    name: string;
    created_at: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'escalate';
    files: { name: string; size: number }[];
}

// Matches the Evidence shape produced by all five Python modules
export interface Evidence {
    evidence_id: string;
    evidence_type: string;
    excerpt: string;
    source_section: string;
}

// Matches Finding dataclass from governance/fairness/security/transparency/performance modules
export interface Finding {
    criterion_id: string;
    description: string;
    score: number;           // 0.0 – 1.0
    severity: string;        // "PASS" | "SIGNIFICANT_DEFICIENCY" | "MATERIAL_WEAKNESS"
    weight: number;          // criterion weight from *_rules.py
    evidence: Evidence;
}

// Matches ModuleResult returned by each module's run() method
export interface ModuleResult {
    module_id: string;       // e.g. "M1_GOVERNANCE"
    module_name: string;
    module_score: number;    // weighted average, 0.0 – 1.0
    pass_threshold: number;  // e.g. 0.75
    risk_level: 'low' | 'medium' | 'high';
    status: 'PASS' | 'FAIL';
    findings: Finding[];
}

// Peer-review card produced by the Council of Experts stage
export interface PeerReview {
    reviewer_module: string;
    reviewed_module: string;
    comment: string;
    flag: boolean;
}

// Arbitrator synthesis — matches arbitrator_synthesis() output
export interface OverallSummary {
    final_score: number;     // 0 – 100
    confidence: number;      // 0.0 – 1.0
    decision: 'PASS' | 'FAIL' | 'ESCALATE';
    divergence: 'none' | 'minor' | 'moderate' | 'critical';
    notes: string;
}

// Full audit results — matches AuditOrchestrator.run() output
export interface AuditResults {
    audit_id: string;
    audit_name: string;
    status: string;
    overall_summary: OverallSummary;
    modules: Record<string, ModuleResult>;
    peer_reviews: PeerReview[];
    key_findings: string[];
}

// Progress event streamed during execution
export interface AuditProgress {
    audit_id: string;
    stage: 'uploading' | 'module_running' | 'module_complete' | 'peer_review' | 'arbitration' | 'complete' | 'error';
    module?: string;         // which module just completed / is running
    score?: number;
    message: string;
    timestamp: string;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...init?.headers },
        ...init,
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new AuditApiError(res.status, res.statusText, body);
    }

    return res.json() as Promise<T>;
}

export class AuditApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly statusText: string,
        public readonly body: string,
    ) {
        super(`API ${status} ${statusText}: ${body}`);
        this.name = 'AuditApiError';
    }
}

// ─── API surface ──────────────────────────────────────────────────────────

export const auditApi = {
    /**
     * Upload documents and create a new audit session.
     * Sends multipart/form-data — Content-Type is set by the browser automatically.
     */
    async createAudit(data: AuditCreateRequest): Promise<AuditCreateResponse> {
        const formData = new FormData();
        formData.append('name', data.name);
        data.files.forEach(file => formData.append('files', file));
        // Send as JSON strings — backend parses with json.loads()
        formData.append('urls', JSON.stringify(data.urls ?? []));
        formData.append('github_repos', JSON.stringify(data.githubRepos ?? []));

        const res = await fetch(`${API_BASE_URL}/audits`, {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type — browser adds multipart boundary automatically
        });

        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new AuditApiError(res.status, res.statusText, body);
        }

        return res.json() as Promise<AuditCreateResponse>;
    },

    /**
     * Kick off the 5-module orchestration pipeline for an existing audit.
     * The backend runs governance → fairness → security → transparency → performance
     * then the Council of Experts peer-review and arbitrator synthesis.
     */
    async executeAudit(auditId: string): Promise<{ status: string; message: string }> {
        return request(`/audits/${auditId}/execute`, { method: 'POST' });
    },

    /**
     * Poll the current status of an audit (pending / running / completed / failed / escalate).
     */
    async getAuditStatus(auditId: string): Promise<AuditCreateResponse> {
        return request(`/audits/${auditId}`);
    },

    /**
     * Fetch the full audit results once status === 'completed' | 'escalate'.
     * Returns all 5 ModuleResults, peer reviews, and the arbitrator's OverallSummary.
     */
    async getAuditResults(auditId: string): Promise<AuditResults> {
        return request(`/audits/${auditId}/results`);
    },

    /**
     * List all audits for the current user/session.
     */
    async listAudits(): Promise<AuditCreateResponse[]> {
        return request('/audits');
    },

    /**
     * Delete an audit and all associated files/results.
     */
    async deleteAudit(auditId: string): Promise<{ deleted: boolean }> {
        return request(`/audits/${auditId}`, { method: 'DELETE' });
    },

    /**
     * Convenience: poll getAuditStatus every `intervalMs` until the audit
     * reaches a terminal state (completed / failed / escalate), then return results.
     * Rejects after `maxAttempts` polls.
     */
    async pollUntilComplete(
        auditId: string,
        {
            intervalMs = 3000,
            maxAttempts = 60,
            onProgress,
        }: {
            intervalMs?: number;
            maxAttempts?: number;
            onProgress?: (status: AuditCreateResponse) => void;
        } = {},
    ): Promise<AuditResults> {
        const TERMINAL = new Set(['completed', 'failed', 'escalate']);

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            const status = await auditApi.getAuditStatus(auditId);
            onProgress?.(status);

            if (TERMINAL.has(status.status)) {
                if (status.status === 'failed') {
                    throw new Error(`Audit ${auditId} failed on the server.`);
                }
                return auditApi.getAuditResults(auditId);
            }
        }

        throw new Error(`Audit ${auditId} did not complete within ${maxAttempts} polls.`);
    },
};