import { create } from 'zustand';

export interface CriterionResult {
  id: string;
  name: string;
  score: number;
  severity: string;
  evidence: string;
}

export interface ModuleResult {
  moduleId: string;
  moduleName: string;
  score: number;
  status: 'PASS' | 'FAIL';
  riskLevel: 'low' | 'medium' | 'high';
  criteria: CriterionResult[];
}

export interface AuditResult {
  auditId: string;
  auditName: string;
  company: string;
  date: string;
  finalScore: number;
  decision: 'PASS' | 'FAIL' | 'ESCALATE';
  confidence: number;
  divergence: string;
  modules: Record<string, ModuleResult>;
  keyFindings: string[];
}

export const TTMT_AUDIT_RESULT: AuditResult = {
  auditId: 'audit-ttmt-2026-001',
  auditName: 'TTMT AI System Audit',
  company: 'TTMT Corp',
  date: 'March 24, 2026',
  finalScore: 85.5,
  decision: 'ESCALATE',
  confidence: 0.46,
  divergence: 'critical',
  keyFindings: [
    'SOX 404 control documentation inconsistent — G1.3 scored 0.5',
    'ROPA & DPIA governance gaps — G1.6, G1.7 at 0.5 (GDPR Art. 30 & 35)',
    'Privacy by Design not fully implemented — S3.4 at 0.5 (GDPR Art. 25)',
    'Automated decision opt-out incomplete — F2.4 at 0.5 (GDPR Art. 22)',
    'Performance monitoring not fully automated — A5.1–A5.4 at 0.75',
  ],
  modules: {
    M1_GOVERNANCE: {
      moduleId: 'M1_GOVERNANCE',
      moduleName: 'Governance & Compliance',
      score: 0.655,
      status: 'FAIL',
      riskLevel: 'medium',
      criteria: [
        { id: 'G1.1', name: 'AI Governance Policy', score: 0.75, severity: 'PASS', evidence: 'Board-approved policy exists; periodic review but not always annual.' },
        { id: 'G1.2', name: 'AI Risk Management System', score: 0.75, severity: 'PASS', evidence: 'Risk register maintained; NIST AI RMF alignment not always explicit.' },
        { id: 'G1.3', name: 'SOX 404 Control Documentation', score: 0.50, severity: 'SIGNIFICANT DEFICIENCY', evidence: 'Controls documented but testing frequency varies; documentation not standardized.' },
        { id: 'G1.4', name: 'AI System Inventory', score: 0.75, severity: 'PASS', evidence: 'Inventory maintained; real-time updates not always ensured.' },
        { id: 'G1.5', name: 'Training & Competency', score: 0.75, severity: 'PASS', evidence: 'Majority of personnel trained; coverage not fully comprehensive.' },
        { id: 'G1.6', name: 'ROPA Maintenance (GDPR Art. 30)', score: 0.50, severity: 'SIGNIFICANT DEFICIENCY', evidence: 'ROPA present but DPO review and update frequency gaps identified.' },
        { id: 'G1.7', name: 'High-Risk AI DPIA (GDPR Art. 35)', score: 0.50, severity: 'SIGNIFICANT DEFICIENCY', evidence: 'DPIA process exists; DPO consultation and committee review not standardized.' },
      ],
    },
    M2_FAIRNESS: {
      moduleId: 'M2_FAIRNESS',
      moduleName: 'Fairness & Bias',
      score: 0.862,
      status: 'PASS',
      riskLevel: 'low',
      criteria: [
        { id: 'F2.1', name: 'Fairness Metrics & Special Category Data', score: 1.00, severity: 'PASS', evidence: 'Strict prohibition on protected attributes; automated + manual dataset screening.' },
        { id: 'F2.2', name: 'Bias Monitoring System', score: 0.75, severity: 'PASS', evidence: 'Quarterly bias audits with centralized governance and fairness thresholds.' },
        { id: 'F2.3', name: 'Bias Mitigation Procedures', score: 1.00, severity: 'PASS', evidence: 'Reweighting, resampling, and model retraining systematically applied on detection.' },
        { id: 'F2.4', name: 'Automated Decision Opt-Out (GDPR Art. 22)', score: 0.50, severity: 'CONTROL DEFICIENCY', evidence: 'Data access/correction rights present but Art. 22 opt-out not fully addressed.' },
      ],
    },
    M3_SECURITY: {
      moduleId: 'M3_SECURITY',
      moduleName: 'Security & Privacy',
      score: 0.855,
      status: 'PASS',
      riskLevel: 'low',
      criteria: [
        { id: 'S3.1', name: 'Data Protection & Encryption', score: 1.00, severity: 'PASS', evidence: 'AES-256 at rest, TLS 1.3 in transit; PII fully tokenized before model training.' },
        { id: 'S3.2', name: 'Adversarial Robustness', score: 1.00, severity: 'PASS', evidence: 'Red-teaming, adversarial perturbation testing; findings incorporated into retraining.' },
        { id: 'S3.3', name: 'Access Control & Authorization', score: 1.00, severity: 'PASS', evidence: 'RBAC+ABAC enforced, MFA mandatory, quarterly access reviews, real-time logging.' },
        { id: 'S3.4', name: 'Privacy by Design & Default', score: 0.50, severity: 'CONTROL DEFICIENCY', evidence: 'PII tokenized in training pipelines but system-level privacy architecture gaps.' },
        { id: 'S3.5', name: 'Breach Detection & Notification', score: 0.75, severity: 'PASS', evidence: 'Incident response framework with drills; AI-specific breach procedures in place.' },
        { id: 'S3.6', name: 'Third-Party AI Risk Management', score: 0.75, severity: 'PASS', evidence: 'Vendor assessment processes exist; not always fully documented.' },
      ],
    },
    M4_EXPLAINABILITY: {
      moduleId: 'M4_EXPLAINABILITY',
      moduleName: 'Explainability & Audit Trail',
      score: 0.925,
      status: 'PASS',
      riskLevel: 'low',
      criteria: [
        { id: 'E4.1', name: 'Explainability & Transparency', score: 1.00, severity: 'PASS', evidence: 'SHAP explanations on 98%+ of decisions; plain-language summaries for end users.' },
        { id: 'E4.2', name: 'Audit Trail Completeness', score: 1.00, severity: 'PASS', evidence: '100% decision logging, WORM immutable storage, 7-year retention.' },
        { id: 'E4.3', name: 'Model Documentation & Version Control', score: 1.00, severity: 'PASS', evidence: 'Comprehensive model cards, Git-based versioning, real-time updates on deployment.' },
        { id: 'E4.4', name: 'Right to Contest Automated Decisions', score: 0.75, severity: 'PASS', evidence: 'Human review mechanisms exist; Art. 22 rights documentation could be more explicit.' },
        { id: 'E4.5', name: 'CCPA Explanation Rights', score: 0.75, severity: 'PASS', evidence: 'Right-to-know procedures in place; opt-out of automated logic partially addressed.' },
      ],
    },
    M5_ACCURACY: {
      moduleId: 'M5_ACCURACY',
      moduleName: 'Accuracy & Performance',
      score: 0.75,
      status: 'PASS',
      riskLevel: 'low',
      criteria: [
        { id: 'A5.1', name: 'Model Validation & Accuracy', score: 0.75, severity: 'PASS', evidence: '>94% accuracy; confusion matrix / ROC validation; 20% holdout dataset maintained.' },
        { id: 'A5.2', name: 'Drift Monitoring (GDPR Accuracy Triggers)', score: 0.75, severity: 'PASS', evidence: 'Drift alerts configured; automated retraining not always triggered.' },
        { id: 'A5.3', name: 'Performance Dashboard & Materiality', score: 0.75, severity: 'PASS', evidence: 'Internal KPI dashboard maintained; updates not always real-time.' },
        { id: 'A5.4', name: 'Personal Data Inference Accuracy', score: 0.75, severity: 'PASS', evidence: 'Correction requests analyzed; retraining triggers not universally automated.' },
      ],
    },
  },
};

// ─── Zustand store ─────────────────────────────────────────────────────────

export interface Audit {
  id: string;
  name: string;
  company: string;
  status: 'completed' | 'in-progress' | 'failed' | 'escalate';
  created_at: string;
  result?: AuditResult;
}

export const MOCK_AUDITS: Audit[] = [
  {
    id: 'audit-ttmt-2026-001',
    name: 'TTMT AI System Audit',
    company: 'TTMT Corp',
    status: 'escalate',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    result: TTMT_AUDIT_RESULT,
  },
  {
    id: 'audit-financebot-2026',
    name: 'FinanceBot AI Audit',
    company: 'Acme Finance',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-creditscoring-2026',
    name: 'Credit Scoring Model Audit',
    company: 'CreditCo',
    status: 'in-progress',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

interface UIStore {
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  currentAuditId: string | null;
  activeRightTab: 'overview' | 'modules' | 'risks';
  activeModuleId: string;

  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  openRightPanel: () => void;
  closeRightPanel: () => void;
  setCurrentAudit: (id: string | null) => void;
  setActiveRightTab: (tab: 'overview' | 'modules' | 'risks') => void;
  setActiveModuleId: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  leftSidebarOpen: true,
  rightPanelOpen: false,
  currentAuditId: null,
  activeRightTab: 'overview',
  activeModuleId: 'M1_GOVERNANCE',

  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  openRightPanel: () => set({ rightPanelOpen: true }),

  closeRightPanel: () => set({ rightPanelOpen: false }),

  setCurrentAudit: (id) =>
    set({ currentAuditId: id, rightPanelOpen: id !== null, activeRightTab: 'overview', activeModuleId: 'M1_GOVERNANCE' }),

  setActiveRightTab: (tab) => set({ activeRightTab: tab }),

  setActiveModuleId: (id) => set({ activeModuleId: id }),
}));