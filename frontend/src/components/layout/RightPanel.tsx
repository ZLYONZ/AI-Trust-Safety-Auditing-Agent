import {
  X, Download, Shield, Scale, Eye, Gauge, Lock,
  ChevronRight, AlertTriangle, CheckCircle, AlertCircle,
} from 'lucide-react';
import { useUIStore, MOCK_AUDITS, TTMT_AUDIT_RESULT, type ModuleResult } from '../../store/uiStore';

// ─── Types ────────────────────────────────────────────────────────────────

type ModuleId = keyof typeof TTMT_AUDIT_RESULT.modules;

// ─── Helpers ──────────────────────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; short: string; icon: JSX.Element; color: string; bar: string }> = {
  M1_GOVERNANCE: { label: 'Governance & Compliance', short: 'Governance', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-yellow-700 bg-yellow-100 border-yellow-200', bar: '#b45309' },
  M2_FAIRNESS: { label: 'Fairness & Bias', short: 'Fairness', icon: <Scale className="w-3.5 h-3.5" />, color: 'text-teal-700 bg-teal-100 border-teal-200', bar: '#0f766e' },
  M3_SECURITY: { label: 'Security & Privacy', short: 'Security', icon: <Lock className="w-3.5 h-3.5" />, color: 'text-blue-700 bg-blue-100 border-blue-200', bar: '#1d4ed8' },
  M4_EXPLAINABILITY: { label: 'Explainability & Audit Trail', short: 'Transparency', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-orange-700 bg-orange-100 border-orange-200', bar: '#c2410c' },
  M5_ACCURACY: { label: 'Accuracy & Performance', short: 'Performance', icon: <Gauge className="w-3.5 h-3.5" />, color: 'text-green-700 bg-green-100 border-green-200', bar: '#15803d' },
};

const getSeverityStyle = (sev: string) => {
  if (sev === 'PASS') return 'bg-green-100 text-green-700 border-green-200';
  if (sev.includes('SIGNIFICANT')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (sev.includes('MATERIAL')) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const getRiskStyle = (level: string) => {
  if (level === 'low') return 'bg-green-100 text-green-700';
  if (level === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const getDecisionStyle = (decision: string) => {
  if (decision === 'PASS') return 'bg-green-100 text-green-800 border-green-300';
  if (decision === 'ESCALATE') return 'bg-yellow-100 text-yellow-900 border-yellow-400';
  return 'bg-red-100 text-red-800 border-red-300';
};

// ─── Sub-components ───────────────────────────────────────────────────────

const ScoreBar = ({ score, color }: { score: number; color: string }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${score * 100}%`, backgroundColor: color }}
    />
  </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────

const OverviewTab = ({ setActiveTab, setActiveModuleId }: {
  setActiveTab: (t: 'overview' | 'modules' | 'risks') => void;
  setActiveModuleId: (id: string) => void;
}) => {
  const result = TTMT_AUDIT_RESULT;

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4">
      {/* Score cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Final Score</p>
          <p className="text-2xl font-semibold text-gray-900">{result.finalScore}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>
        <div className={`rounded-lg p-3 border ${getDecisionStyle(result.decision)}`}>
          <p className="text-xs opacity-70 mb-1">Decision</p>
          <p className="text-lg font-semibold">{result.decision}</p>
          <p className="text-xs opacity-70">Human review req.</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Confidence</p>
          <p className="text-2xl font-semibold text-gray-900">{Math.round(result.confidence * 100)}%</p>
          <p className="text-xs text-gray-400">Divergence: {result.divergence}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Modules</p>
          <p className="text-2xl font-semibold text-gray-900">4/5</p>
          <p className="text-xs text-gray-400">Passed</p>
        </div>
      </div>

      {/* Module scores */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Module Scores</p>
        <div className="space-y-2.5">
          {(Object.entries(result.modules) as [string, ModuleResult][]).map(([id, mod]) => {
            const meta = MODULE_META[id];
            return (
              <button
                key={id}
                onClick={() => { setActiveTab('modules'); setActiveModuleId(id); }}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 group-hover:text-teal-700 transition-colors">
                    <span className={`p-0.5 rounded ${meta.color.split(' ').slice(0, 2).join(' ')}`}>{meta.icon}</span>
                    {meta.short}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-mono">{mod.score.toFixed(3)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${mod.status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {mod.status}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </div>
                </div>
                <ScoreBar score={mod.score} color={meta.bar} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Key findings */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Key Findings</p>
        <div className="space-y-1.5">
          {result.keyFindings.map((f, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border-l-2 border-teal-500">
              <AlertCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Modules Tab ──────────────────────────────────────────────────────────

const ModulesTab = ({ activeModuleId, setActiveModuleId }: {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
}) => {
  const modules = TTMT_AUDIT_RESULT.modules;
  const current = modules[activeModuleId as ModuleId];
  const meta = MODULE_META[activeModuleId];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Module selector */}
      <div className="p-2 border-b border-gray-200 flex flex-col gap-1 flex-shrink-0">
        {Object.entries(modules).map(([id, mod]) => {
          const m = MODULE_META[id];
          return (
            <button
              key={id}
              onClick={() => setActiveModuleId(id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs w-full
                ${activeModuleId === id ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <span className={`p-1 rounded ${m.color.split(' ').slice(0, 2).join(' ')}`}>{m.icon}</span>
              <span className="flex-1 font-medium">{m.short}</span>
              <span className="font-mono text-gray-500">{mod.score.toFixed(3)}</span>
              {mod.status === 'PASS'
                ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                : <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
              }
            </button>
          );
        })}
      </div>

      {/* Criteria list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Module header */}
        <div className={`p-2.5 rounded-lg border ${meta.color}`}>
          <p className="text-xs font-semibold">{meta.label}</p>
          <p className="text-xs opacity-75 mt-0.5">
            Module score: <span className="font-mono font-semibold">{current.score.toFixed(3)}</span>
            {' · '}
            <span className={`font-medium ${getRiskStyle(current.riskLevel)} px-1 rounded`}>{current.riskLevel} risk</span>
          </p>
        </div>

        {current.criteria.map((c) => (
          <div key={c.id} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{c.id}: {c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.evidence}</p>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${getSeverityStyle(c.severity)}`}>
                {c.severity === 'PASS' ? '✓' : '!'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Score</span>
              <span className="font-mono font-medium text-gray-700">{c.score.toFixed(2)} / 1.0</span>
            </div>
            <ScoreBar score={c.score} color={meta.bar} />
            {c.severity !== 'PASS' && (
              <p className={`text-xs mt-1.5 px-2 py-1 rounded font-medium ${getSeverityStyle(c.severity)}`}>
                {c.severity}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Risks Tab ────────────────────────────────────────────────────────────

const RISKS = [
  {
    title: 'SOX 404 control documentation gaps',
    criterion: 'G1.3 · Score: 0.50',
    badge: 'SIGNIFICANT DEFICIENCY',
    badgeStyle: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />,
    desc: 'Testing frequency varies across teams; documentation not standardized. COSO framework mapping incomplete. Potential Material Weakness risk under SOX 404.',
    rec: 'Standardize control documentation templates and enforce quarterly testing cadence. Map all controls to COSO framework within 60 days.',
  },
  {
    title: 'GDPR Art. 30 & 35 compliance gaps',
    criterion: 'G1.6, G1.7 · Score: 0.50',
    badge: 'SIGNIFICANT DEFICIENCY',
    badgeStyle: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />,
    desc: 'ROPA and DPIA governance not fully standardized. DPO consultation processes and governance committee reviews are inconsistent.',
    rec: 'Assign DPO ownership of all AI processing activities. Establish mandatory DPIA review gate for high-risk AI deployments with remediation tracking.',
  },
  {
    title: 'Privacy by Design not fully implemented',
    criterion: 'S3.4 · Score: 0.50',
    badge: 'CONTROL DEFICIENCY',
    badgeStyle: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />,
    desc: 'GDPR Article 25 requires privacy by design at system architecture level. Current implementation covers data pipeline anonymization but lacks system-level documentation.',
    rec: 'Document privacy-by-design principles in system architecture specs. Verify default settings enforce data minimization across all AI workflows.',
  },
  {
    title: 'Automated decision opt-out mechanism',
    criterion: 'F2.4 · Score: 0.50',
    badge: 'CONTROL DEFICIENCY',
    badgeStyle: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />,
    desc: 'GDPR Art. 22 and CCPA require explicit opt-out from solely automated decisions. Current data access/correction procedures do not fully address this right.',
    rec: 'Implement explicit opt-out flow for automated decisions. Ensure GDPR Art. 22 rights (human review, contest decision) are documented and accessible to affected users.',
  },
  {
    title: 'Performance monitoring not fully automated',
    criterion: 'A5.1–A5.4 · Score: 0.75',
    badge: 'CONTROL DEFICIENCY',
    badgeStyle: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />,
    desc: 'Drift detection alerts configured but automated retraining not universally triggered. Dashboard updates not always real-time. Correction request workflows partially manual.',
    rec: 'Implement automated retraining pipelines on drift threshold breach. Connect real-time performance monitoring feeds to production dashboard.',
  },
];

const RisksTab = () => (
  <div className="h-full overflow-y-auto p-3 space-y-3">
    {RISKS.map((r, i) => (
      <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
        <div className="flex items-start gap-2 mb-2">
          {r.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{r.title}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${r.badgeStyle}`}>
                {r.badge.split(' ').map(w => w[0]).join('.')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{r.criterion}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-2">{r.desc}</p>
        <div className="bg-teal-50 border border-teal-200 rounded p-2">
          <p className="text-xs font-semibold text-teal-800 mb-0.5">Recommendation</p>
          <p className="text-xs text-teal-700 leading-relaxed">{r.rec}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─── Root RightPanel ──────────────────────────────────────────────────────

const RightPanel = () => {
  const {
    currentAuditId,
    closeRightPanel,
    activeRightTab,
    setActiveRightTab,
    activeModuleId,
    setActiveModuleId,
  } = useUIStore();

  const currentAudit = MOCK_AUDITS.find(a => a.id === currentAuditId);

  if (!currentAuditId) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-white">
        <div className="text-center text-gray-400">
          <p className="text-sm">No audit selected</p>
          <p className="text-xs mt-1">Select an audit to view the report</p>
        </div>
      </div>
    );
  }

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(TTMT_AUDIT_RESULT, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGuard_${TTMT_AUDIT_RESULT.auditId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{currentAudit?.name}</p>
          <p className="text-xs text-gray-400">{currentAudit?.company}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleExportJSON}
            title="Export JSON"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeRightPanel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {(['overview', 'modules', 'risks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRightTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors capitalize border-b-2 -mb-px
              ${activeRightTab === tab
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeRightTab === 'overview' && (
          <OverviewTab setActiveTab={setActiveRightTab} setActiveModuleId={setActiveModuleId} />
        )}
        {activeRightTab === 'modules' && (
          <ModulesTab activeModuleId={activeModuleId} setActiveModuleId={setActiveModuleId} />
        )}
        {activeRightTab === 'risks' && <RisksTab />}
      </div>
    </div>
  );
};

export default RightPanel;