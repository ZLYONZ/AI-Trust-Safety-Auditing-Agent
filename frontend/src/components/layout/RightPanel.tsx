import { X, Download, Shield, Scale, Eye, Gauge, Lock, ChevronRight, AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useUIStore, type AuditResults } from '../../store/uiStore';
import type { ModuleResult } from '../../services/auditApi';

// ─── Module display metadata ───────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; short: string; icon: JSX.Element; bar: string; badgeColor: string }> = {
  M1_GOVERNANCE: { label: 'Governance & Compliance', short: 'Governance', icon: <Shield className="w-3.5 h-3.5" />, bar: '#b45309', badgeColor: 'text-yellow-700 bg-yellow-100' },
  M2_FAIRNESS: { label: 'Fairness & Bias', short: 'Fairness', icon: <Scale className="w-3.5 h-3.5" />, bar: '#0f766e', badgeColor: 'text-teal-700 bg-teal-100' },
  M3_SECURITY: { label: 'Security & Privacy', short: 'Security', icon: <Lock className="w-3.5 h-3.5" />, bar: '#1d4ed8', badgeColor: 'text-blue-700 bg-blue-100' },
  M4_EXPLAINABILITY: { label: 'Explainability & Audit Trail', short: 'Transparency', icon: <Eye className="w-3.5 h-3.5" />, bar: '#c2410c', badgeColor: 'text-orange-700 bg-orange-100' },
  M5_ACCURACY: { label: 'Accuracy & Performance', short: 'Performance', icon: <Gauge className="w-3.5 h-3.5" />, bar: '#15803d', badgeColor: 'text-green-700 bg-green-100' },
};

// Fallback for modules the server returns with different IDs
function getModuleMeta(id: string) {
  return MODULE_META[id] ?? {
    label: id, short: id, icon: <Shield className="w-3.5 h-3.5" />, bar: '#6b7280', badgeColor: 'text-gray-700 bg-gray-100',
  };
}

const getSeverityStyle = (sev: string) => {
  if (sev === 'PASS') return 'bg-green-100 text-green-700 border-green-200';
  if (sev.includes('SIGNIFICANT')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (sev.includes('MATERIAL')) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const ScoreBar = ({ score, color }: { score: number; color: string }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(score * 100, 100)}%`, backgroundColor: color }} />
  </div>
);

// ─── Overview tab ─────────────────────────────────────────────────────────

const OverviewTab = ({
  results,
  setActiveTab,
  setActiveModuleId,
}: {
  results: AuditResults;
  setActiveTab: (t: 'overview' | 'modules' | 'risks') => void;
  setActiveModuleId: (id: string) => void;
}) => {
  const s = results.overall_summary;
  const decisionStyle =
    s.decision === 'PASS' ? 'bg-green-100 text-green-900 border-green-300'
      : s.decision === 'ESCALATE' ? 'bg-yellow-100 text-yellow-900 border-yellow-400'
        : 'bg-red-100 text-red-900 border-red-300';

  return (
    <div className="p-3 space-y-4">
      {/* Score cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Final Score</p>
          <p className="text-2xl font-semibold text-gray-900">{s.final_score}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>
        <div className={`rounded-lg p-3 border ${decisionStyle}`}>
          <p className="text-xs opacity-70 mb-1">Decision</p>
          <p className="text-lg font-semibold">{s.decision}</p>
          <p className="text-xs opacity-70 leading-tight">{s.notes?.slice(0, 40)}…</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Confidence</p>
          <p className="text-2xl font-semibold text-gray-900">{Math.round(s.confidence * 100)}%</p>
          <p className="text-xs text-gray-400">Divergence: {s.divergence}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Modules</p>
          <p className="text-2xl font-semibold text-gray-900">
            {Object.values(results.modules).filter((m) => m.module_score >= (m.pass_threshold ?? 0.75)).length}/{Object.keys(results.modules).length}
          </p>
          <p className="text-xs text-gray-400">Passed</p>
        </div>
      </div>

      {/* Module score bars */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Module Scores</p>
        <div className="space-y-2.5">
          {Object.entries(results.modules).map(([id, mod]) => {
            const meta = getModuleMeta(id);
            const passed = mod.module_score >= (mod.pass_threshold ?? 0.75);
            return (
              <button key={id} onClick={() => { setActiveTab('modules'); setActiveModuleId(id); }} className="w-full text-left group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 group-hover:text-teal-700 transition-colors">
                    <span className={`p-0.5 rounded text-xs ${meta.badgeColor}`}>{meta.icon}</span>
                    {meta.short}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-mono">{mod.module_score.toFixed(3)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {passed ? 'PASS' : 'FAIL'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </div>
                </div>
                <ScoreBar score={mod.module_score} color={meta.bar} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Key findings */}
      {results.key_findings.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Key Findings</p>
          <div className="space-y-1.5">
            {results.key_findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border-l-2 border-teal-500">
                <AlertCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Modules tab ──────────────────────────────────────────────────────────

const ModulesTab = ({
  results,
  activeModuleId,
  setActiveModuleId,
}: {
  results: AuditResults;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
}) => {
  const moduleIds = Object.keys(results.modules);
  const currentId = moduleIds.includes(activeModuleId) ? activeModuleId : moduleIds[0];
  const current: ModuleResult | undefined = results.modules[currentId];
  const meta = getModuleMeta(currentId);
  const passed = current ? current.module_score >= (current.pass_threshold ?? 0.75) : false;

  return (
    <div className="flex flex-col" style={{ minHeight: "500px" }}>
      {/* Module selector */}
      <div className="p-2 border-b border-gray-200 flex flex-col gap-1 flex-shrink-0">
        {moduleIds.map((id) => {
          const m = getModuleMeta(id);
          const mod = results.modules[id];
          const ok = mod.module_score >= (mod.pass_threshold ?? 0.75);
          return (
            <button key={id} onClick={() => setActiveModuleId(id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs w-full ${activeModuleId === id ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'hover:bg-gray-50 text-gray-600'}`}>
              <span className={`p-1 rounded text-xs ${m.badgeColor}`}>{m.icon}</span>
              <span className="flex-1 font-medium text-sm">{m.short}</span>
              <span className="font-mono text-gray-500">{mod.module_score.toFixed(3)}</span>
              {ok ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
            </button>
          );
        })}
      </div>

      {/* Criteria */}
      <div className="p-3 space-y-2.5">
        {current && (
          <>
            <div className={`p-2.5 rounded-lg text-xs ${meta.badgeColor}`}>
              <p className="text-sm font-semibold">{meta.label}</p>
              <p className="text-xs opacity-75 mt-0.5">
                Score: <span className="font-mono font-semibold">{current.module_score.toFixed(3)}</span>
                {' · '}
                <span className="font-medium">{current.risk_level} risk</span>
                {' · '}
                <span className="font-medium">{passed ? 'PASS' : 'FAIL'}</span>
              </p>
            </div>

            {current.findings.map((f) => (
              <div key={f.criterion_id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{f.criterion_id}: {f.description}</p>
                    {f.evidence?.excerpt && f.evidence.excerpt !== 'No evidence found in document' && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.evidence.excerpt.slice(0, 120)}…</p>
                    )}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${getSeverityStyle(f.severity)}`}>
                    {f.severity === 'PASS' ? '✓' : '!'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Score</span>
                  <span className="font-mono font-medium text-gray-700">{f.score.toFixed(2)} / 1.0</span>
                </div>
                <ScoreBar score={f.score} color={meta.bar} />
                {f.severity !== 'PASS' && (
                  <p className={`text-xs mt-1.5 px-2 py-1 rounded font-medium ${getSeverityStyle(f.severity)}`}>
                    {f.severity}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Risks tab ─────────────────────────────────────────────────────────────

const RisksTab = ({ results }: { results: AuditResults }) => {
  const failingFindings = Object.entries(results.modules).flatMap(([moduleId, mod]) =>
    mod.findings
      .filter((f) => f.score < 0.75)
      .map((f) => ({ moduleId, mod, finding: f }))
  ).sort((a, b) => a.finding.score - b.finding.score);

  if (failingFindings.length === 0) {
    return (
      <div className="p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">No risks identified</p>
        <p className="text-xs text-gray-400 mt-1">All criteria scored above threshold</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {failingFindings.map(({ finding, mod }, i) => {
        const isSig = finding.severity.includes('SIGNIFICANT') || finding.severity.includes('MATERIAL');
        return (
          <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-start gap-2 mb-2">
              {isSig
                ? <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{finding.criterion_id}: {finding.description}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${getSeverityStyle(finding.severity)}`}>
                    {finding.severity.split(' ').map((w) => w[0]).join('.')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Score: {finding.score.toFixed(2)} · {mod.module_id}</p>
              </div>
            </div>
            {finding.evidence?.excerpt && finding.evidence.excerpt !== 'No evidence found in document' && (
              <p className="text-xs text-gray-600 leading-relaxed mb-2 pl-6">{finding.evidence.excerpt.slice(0, 150)}…</p>
            )}
            <div className="pl-6">
              <ScoreBar score={finding.score} color={finding.score < 0.5 ? '#dc2626' : '#d97706'} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Empty state ───────────────────────────────────────────────────────────

const EmptyPanel = ({ message, onReload }: { message: string; onReload?: () => void }) => (
  <div className="flex items-center justify-center p-6 min-h-[200px]">
    <div className="text-center text-gray-400">
      <p className="text-sm">{message}</p>
      <p className="text-xs mt-1">Results appear here once the audit completes</p>
      {onReload && (
        <button
          onClick={onReload}
          className="mt-3 px-3 py-1.5 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Load Results
        </button>
      )}
    </div>
  </div>
);

// ─── Root RightPanel ──────────────────────────────────────────────────────

const RightPanel = () => {
  const {
    currentAuditId, audits, liveResults, auditStatus,
    closeRightPanel, activeRightTab, setActiveRightTab,
    activeModuleId, setActiveModuleId, setAuditResults,
  } = useUIStore();

  const currentAudit = audits.find((a) => a.id === currentAuditId);
  const results: AuditResults | undefined = currentAuditId ? liveResults[currentAuditId] : undefined;
  const status = currentAuditId ? (auditStatus[currentAuditId] ?? currentAudit?.status ?? null) : null;
  const isRunning = status === 'running' || status === 'pending';
  const isTerminal = status === 'completed' || status === 'escalate' || status === 'failed';
  const isRealAudit = currentAuditId ? /^[0-9a-f]{8}-/.test(currentAuditId) : false;

  // ── Handlers (defined before early return — used in JSX and useEffect) ───
  const handleExport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGuard_${currentAuditId ?? 'audit'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReload = async () => {
    if (!currentAuditId) return;
    try {
      const { auditApi } = await import('../../services/auditApi');
      const fetched = await auditApi.getAuditResults(currentAuditId);
      setAuditResults(currentAuditId, fetched);
    } catch (e) {
      console.error('Reload failed:', e);
    }
  };

  // ── Auto-load hook — MUST be before any early return ──────────────────────
  useEffect(() => {
    if (!currentAuditId || !isRealAudit) return;
    if (!results && isTerminal) {
      const t = setTimeout(handleReload, 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAuditId, status]);

  // ── Early return (after all hooks) ────────────────────────────────────────
  if (!currentAuditId) {
    return <EmptyPanel message="No audit selected" />;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{currentAudit?.name ?? 'Audit'}</p>
          <p className="text-xs text-gray-500">{currentAudit?.company ?? ''}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!results && isTerminal && isRealAudit && (
            <button onClick={handleReload} title="Load results" className="p-1.5 text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {results && (
            <button onClick={handleExport} title="Export JSON" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={closeRightPanel} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {(['overview', 'modules', 'risks'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveRightTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${activeRightTab === tab ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isRunning && !results && (
          <EmptyPanel message="Audit is running…" />
        )}
        {!isRunning && !results && (
          <EmptyPanel
            message="No results yet"
            onReload={isRealAudit && isTerminal ? handleReload : undefined}
          />
        )}
        {results && activeRightTab === 'overview' && (
          <OverviewTab results={results} setActiveTab={setActiveRightTab} setActiveModuleId={setActiveModuleId} />
        )}
        {results && activeRightTab === 'modules' && (
          <ModulesTab results={results} activeModuleId={activeModuleId} setActiveModuleId={setActiveModuleId} />
        )}
        {results && activeRightTab === 'risks' && (
          <RisksTab results={results} />
        )}
      </div>
    </div>
  );
};

export default RightPanel;