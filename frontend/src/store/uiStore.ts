import { create } from 'zustand';
import type { AuditResults, AuditCreateResponse } from '../services/auditApi';

export type { AuditResults };

export interface Audit {
  id: string;
  name: string;
  company: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'escalate' | 'in-progress';
  created_at: string;
}

export interface ChatMessage {
  type: 'system' | 'agent' | 'user' | 'decision';
  content: string;
  timestamp: string;
}

export function apiResponseToAudit(r: AuditCreateResponse): Audit {
  const statusMap: Record<string, Audit['status']> = {
    pending: 'pending', running: 'running', completed: 'completed',
    failed: 'failed', escalate: 'escalate',
  };
  return {
    id: r.audit_id, name: r.name, company: 'Uploaded',
    status: statusMap[r.status] ?? 'pending', created_at: r.created_at,
  };
}

// ── Demo mock audit shown before any real audit is run ─────────────────────

const DEMO_ID = 'demo-ttmt-2026';

export const DEMO_AUDIT: Audit = {
  id: DEMO_ID,
  name: 'TTMT AI System (Demo)',
  company: 'TTMT Corp',
  status: 'escalate',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_RESULTS: AuditResults = {
  audit_id: DEMO_ID,
  audit_name: 'TTMT AI System (Demo)',
  status: 'escalate',
  overall_summary: {
    final_score: 85.5,
    confidence: 0.46,
    decision: 'ESCALATE',
    divergence: 'critical',
    notes: 'Critical divergence across modules → mandatory human review required.',
  },
  modules: {
    M1_GOVERNANCE: {
      module_id: 'M1_GOVERNANCE', module_name: 'Governance & Compliance',
      module_score: 0.655, pass_threshold: 0.75, risk_level: 'medium', status: 'FAIL',
      findings: [
        { criterion_id: 'G1.1', description: 'AI Governance Policy', score: 0.75, severity: 'PASS', weight: 0.20, evidence: { evidence_id: 'G1.1', evidence_type: 'policy_text', excerpt: 'Board-approved AI governance policy exists; periodic review but not always annual.', source_section: 'Governance Policy' } },
        { criterion_id: 'G1.3', description: 'SOX 404 Control Documentation', score: 0.50, severity: 'SIGNIFICANT DEFICIENCY', weight: 0.18, evidence: { evidence_id: 'G1.3', evidence_type: 'controls_text', excerpt: 'Testing frequency varies across teams; documentation not standardized.', source_section: 'Internal Controls' } },
        { criterion_id: 'G1.6', description: 'ROPA Maintenance (GDPR Art. 30)', score: 0.50, severity: 'SIGNIFICANT DEFICIENCY', weight: 0.10, evidence: { evidence_id: 'G1.6', evidence_type: 'ropa_records', excerpt: 'ROPA present but DPO review and update frequency gaps identified.', source_section: 'Data Governance' } },
      ],
    },
    M2_FAIRNESS: {
      module_id: 'M2_FAIRNESS', module_name: 'Fairness & Bias',
      module_score: 0.862, pass_threshold: 0.75, risk_level: 'low', status: 'PASS',
      findings: [
        { criterion_id: 'F2.1', description: 'Fairness Metrics & Special Category Data', score: 1.00, severity: 'PASS', weight: 0.30, evidence: { evidence_id: 'F2.1', evidence_type: 'policy_text', excerpt: 'Strict prohibition on protected attributes; automated + manual dataset screening.', source_section: 'Fairness Policy' } },
        { criterion_id: 'F2.4', description: 'Automated Decision Opt-Out (GDPR Art. 22)', score: 0.50, severity: 'CONTROL DEFICIENCY', weight: 0.20, evidence: { evidence_id: 'F2.4', evidence_type: 'policy_text', excerpt: 'Data access/correction rights present but Art. 22 opt-out not fully addressed.', source_section: 'Data Rights' } },
      ],
    },
    M3_SECURITY: {
      module_id: 'M3_SECURITY', module_name: 'Security & Privacy',
      module_score: 0.855, pass_threshold: 0.75, risk_level: 'low', status: 'PASS',
      findings: [
        { criterion_id: 'S3.1', description: 'Data Protection & Encryption', score: 1.00, severity: 'PASS', weight: 0.15, evidence: { evidence_id: 'S3.1', evidence_type: 'policy_text', excerpt: 'AES-256 at rest, TLS 1.3 in transit; PII fully tokenized before model training.', source_section: 'Security Architecture' } },
        { criterion_id: 'S3.4', description: 'Privacy by Design & Default', score: 0.50, severity: 'CONTROL DEFICIENCY', weight: 0.20, evidence: { evidence_id: 'S3.4', evidence_type: 'policy_text', excerpt: 'PII tokenized in training pipelines but system-level privacy architecture gaps.', source_section: 'Privacy Framework' } },
      ],
    },
    M4_EXPLAINABILITY: {
      module_id: 'M4_EXPLAINABILITY', module_name: 'Explainability & Audit Trail',
      module_score: 0.925, pass_threshold: 0.75, risk_level: 'low', status: 'PASS',
      findings: [
        { criterion_id: 'E4.1', description: 'Explainability & Transparency', score: 1.00, severity: 'PASS', weight: 0.25, evidence: { evidence_id: 'E4.1', evidence_type: 'policy_text', excerpt: 'SHAP explanations on 98%+ of decisions; plain-language summaries for end users.', source_section: 'Model Explainability' } },
        { criterion_id: 'E4.2', description: 'Audit Trail Completeness', score: 1.00, severity: 'PASS', weight: 0.25, evidence: { evidence_id: 'E4.2', evidence_type: 'policy_text', excerpt: '100% decision logging, WORM immutable storage, 7-year retention.', source_section: 'Audit Trail' } },
      ],
    },
    M5_ACCURACY: {
      module_id: 'M5_ACCURACY', module_name: 'Accuracy & Performance',
      module_score: 0.75, pass_threshold: 0.75, risk_level: 'low', status: 'PASS',
      findings: [
        { criterion_id: 'A5.1', description: 'Model Validation & Accuracy', score: 0.75, severity: 'PASS', weight: 0.30, evidence: { evidence_id: 'A5.1', evidence_type: 'process_description', excerpt: '>94% accuracy; confusion matrix / ROC validation; 20% holdout dataset maintained.', source_section: 'Model Validation' } },
        { criterion_id: 'A5.2', description: 'Drift Monitoring', score: 0.75, severity: 'PASS', weight: 0.30, evidence: { evidence_id: 'A5.2', evidence_type: 'process_description', excerpt: 'Drift alerts configured; automated retraining not always triggered.', source_section: 'Monitoring' } },
      ],
    },
  },
  peer_reviews: [],
  key_findings: [
    'SOX 404 control documentation inconsistent — G1.3 scored 0.50',
    'ROPA & DPIA governance gaps — G1.6, G1.7 at 0.50 (GDPR Art. 30 & 35)',
    'Privacy by Design not fully implemented — S3.4 at 0.50 (GDPR Art. 25)',
    'Automated decision opt-out incomplete — F2.4 at 0.50 (GDPR Art. 22)',
  ],
};

const DEMO_MESSAGES: ChatMessage[] = [
  { type: 'system', content: 'Demo audit loaded — TTMT AI System (2026). This is sample data showing a completed audit run.', timestamp: '10:30 AM' },
  { type: 'system', content: '✓ Governance complete — Score: 0.655 · FAIL', timestamp: '10:33 AM' },
  { type: 'system', content: '✓ Fairness complete — Score: 0.862 · PASS', timestamp: '10:35 AM' },
  { type: 'system', content: '✓ Security complete — Score: 0.855 · PASS', timestamp: '10:37 AM' },
  { type: 'system', content: '✓ Explainability complete — Score: 0.925 · PASS', timestamp: '10:39 AM' },
  { type: 'system', content: '✓ Performance complete — Score: 0.750 · PASS', timestamp: '10:40 AM' },
  { type: 'decision', content: 'Final Decision: ESCALATE\nComposite score: 85.5 / 100 · Confidence: 46% · Divergence: critical\nCritical divergence across modules → mandatory human review required.', timestamp: '10:41 AM' },
];

// ── Zustand store ──────────────────────────────────────────────────────────

interface UIStore {
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  currentAuditId: string | null;
  activeRightTab: 'overview' | 'modules' | 'risks';
  activeModuleId: string;
  audits: Audit[];
  liveResults: Record<string, AuditResults>;
  liveMessages: Record<string, ChatMessage[]>;
  auditStatus: Record<string, Audit['status']>;

  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  openRightPanel: () => void;
  closeRightPanel: () => void;
  setCurrentAudit: (id: string | null) => void;
  setActiveRightTab: (tab: 'overview' | 'modules' | 'risks') => void;
  setActiveModuleId: (id: string) => void;
  setAudits: (audits: Audit[]) => void;
  addAudit: (audit: Audit) => void;
  removeAudit: (id: string) => void;
  updateAuditStatus: (auditId: string, status: Audit['status']) => void;
  setAuditResults: (auditId: string, results: AuditResults) => void;
  addChatMessage: (auditId: string, msg: ChatMessage) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  leftSidebarOpen: true,
  rightPanelOpen: false,
  currentAuditId: null,
  activeRightTab: 'overview',
  activeModuleId: 'M1_GOVERNANCE',

  // Start with the demo audit pre-loaded
  audits: [DEMO_AUDIT],
  liveResults: { [DEMO_ID]: DEMO_RESULTS },
  liveMessages: { [DEMO_ID]: DEMO_MESSAGES },
  auditStatus: { [DEMO_ID]: 'escalate' },

  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  openRightPanel: () => set({ rightPanelOpen: true }),
  closeRightPanel: () => set({ rightPanelOpen: false }),

  setCurrentAudit: (id) => set({
    currentAuditId: id,
    rightPanelOpen: id !== null,
    activeRightTab: 'overview',
    activeModuleId: 'M1_GOVERNANCE',
  }),

  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setActiveModuleId: (id) => set({ activeModuleId: id }),

  // Replace entire audit list (used by LeftSidebar on mount to sync with DB)
  setAudits: (audits) => set({ audits }),

  addAudit: (audit) => set((s) => {
    // Deduplicate by id
    const exists = s.audits.some((a) => a.id === audit.id);
    return exists ? {} : { audits: [audit, ...s.audits] };
  }),

  removeAudit: (id) => set((s) => ({
    audits: s.audits.filter((a) => a.id !== id),
    liveResults: Object.fromEntries(Object.entries(s.liveResults).filter(([k]) => k !== id)),
    liveMessages: Object.fromEntries(Object.entries(s.liveMessages).filter(([k]) => k !== id)),
    auditStatus: Object.fromEntries(Object.entries(s.auditStatus).filter(([k]) => k !== id)),
    currentAuditId: s.currentAuditId === id ? null : s.currentAuditId,
    rightPanelOpen: s.currentAuditId === id ? false : s.rightPanelOpen,
  })),

  updateAuditStatus: (auditId, status) => set((s) => ({
    audits: s.audits.map((a) => a.id === auditId ? { ...a, status } : a),
    auditStatus: { ...s.auditStatus, [auditId]: status },
  })),

  setAuditResults: (auditId, results) => set((s) => ({
    liveResults: { ...s.liveResults, [auditId]: results },
  })),

  addChatMessage: (auditId, msg) => set((s) => ({
    liveMessages: {
      ...s.liveMessages,
      [auditId]: [...(s.liveMessages[auditId] ?? []), msg],
    },
  })),
}));