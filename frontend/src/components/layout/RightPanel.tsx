import { X, Download, Shield, Scale, Eye, Gauge, Lock, ChevronRight, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, Pencil, FileJson, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
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
  onSelectCriterion,
}: {
  results: AuditResults;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  onSelectCriterion: (moduleId: string, criterionId: string) => void;
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
              <div
                key={f.criterion_id}
                className="border border-gray-200 rounded-lg p-3 bg-white cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-colors group"
                onClick={() => onSelectCriterion(currentId, f.criterion_id)}
              >
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
                <p className="text-xs text-teal-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view full details →
                </p>
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
        const isMaterial = finding.severity.includes('MATERIAL');
        const isSig = finding.severity.includes('SIGNIFICANT');
        const isDeficiency = finding.severity.includes('CONTROL') || finding.severity.includes('DEFICIENCY');
        const noEvidence = !finding.evidence?.excerpt || finding.evidence.excerpt === 'No evidence found in document';

        // Severity label and style
        const sevLabel = isMaterial ? 'Material Weakness'
          : isSig ? 'Significant Deficiency'
            : isDeficiency ? 'Control Deficiency'
              : finding.severity || 'Below Threshold';

        const sevStyle = isMaterial ? 'bg-red-100 text-red-700 border-red-200'
          : isSig ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
            : 'bg-gray-100 text-gray-600 border-gray-200';

        const icon = isMaterial || isSig
          ? <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          : <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />;

        // Module display name
        const modMeta = MODULE_META[mod.module_id];
        const modName = modMeta?.short ?? mod.module_id;

        // Risk reason based on score band
        const riskReason = noEvidence
          ? 'No supporting evidence was found in the uploaded document for this criterion. The organization may not have documented this control, or the documentation was not included in the upload.'
          : finding.score === 0.25
            ? 'Minimal evidence exists — the criterion is largely unaddressed. Only faint indications of compliance were found.'
            : finding.score === 0.5
              ? 'Partial evidence found. The criterion is only partially met — key components are missing or insufficiently documented.'
              : 'Evidence present but with gaps. The criterion is mostly met but minor deficiencies remain that should be addressed.';

        // Recommendation based on criterion ID prefix
        const recMap: Record<string, string> = {
          'G': 'Review and update governance documentation. Ensure board-level approval, complete the risk register, and align with ISO 42001 and NIST AI RMF requirements.',
          'F': 'Conduct a bias audit using Fairlearn or AIF360. Implement automated fairness monitoring and establish GDPR Article 22 opt-out mechanisms for affected data subjects.',
          'S': 'Strengthen security controls — upgrade encryption standards, complete adversarial robustness testing, and embed Privacy by Design into the AI development lifecycle.',
          'E': 'Implement SHAP or LIME explainability for all automated decisions. Ensure audit trails are immutable (WORM storage), and publish model cards for all production systems.',
          'A': 'Establish automated drift monitoring with defined retraining triggers. Validate all production models against held-out test sets and connect correction requests to retraining workflows.',
        };
        const prefix = finding.criterion_id.charAt(0).toUpperCase();
        const recommendation = recMap[prefix] ?? 'Review this criterion against the relevant regulatory requirements and update documentation accordingly.';

        return (
          <div key={i} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Header */}
            <div className="p-3 pb-2">
              <div className="flex items-start gap-2">
                {icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {finding.criterion_id}: {finding.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevStyle}`}>
                      {sevLabel}
                    </span>
                    <span className="text-xs text-gray-400">{modName} · Score {finding.score.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-2.5 ml-6">
                <ScoreBar score={finding.score} color={finding.score < 0.5 ? '#dc2626' : '#d97706'} />
              </div>
            </div>

            {/* Evidence */}
            {!noEvidence && (
              <div className="mx-3 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Evidence found</p>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{finding.evidence.excerpt.slice(0, 200)}{finding.evidence.excerpt.length > 200 ? '…' : ''}"
                </p>
                {finding.evidence.source_section && finding.evidence.source_section !== 'N/A' && (
                  <p className="text-xs text-gray-400 mt-1">— {finding.evidence.source_section}</p>
                )}
              </div>
            )}

            {/* Why it's a risk */}
            <div className="mx-3 mb-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs font-medium text-amber-800 mb-1">Why this is a risk</p>
              <p className="text-xs text-amber-700 leading-relaxed">{riskReason}</p>
            </div>

            {/* Recommendation */}
            <div className="mx-3 mb-3 p-2.5 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-xs font-medium text-teal-800 mb-1">Recommendation</p>
              <p className="text-xs text-teal-700 leading-relaxed">{recommendation}</p>
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
    activeModuleId, setActiveModuleId, setAuditResults, renameAudit, setActiveCriterion,
  } = useUIStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentAudit = audits.find((a) => a.id === currentAuditId);
  const results: AuditResults | undefined = currentAuditId ? liveResults[currentAuditId] : undefined;
  const status = currentAuditId ? (auditStatus[currentAuditId] ?? currentAudit?.status ?? null) : null;
  const isRunning = status === 'running' || status === 'pending';
  const isTerminal = status === 'completed' || status === 'escalate' || status === 'failed';
  const isRealAudit = currentAuditId ? /^[0-9a-f]{8}-/.test(currentAuditId) : false;

  // ── Handlers (defined before early return — used in JSX and useEffect) ───
  const handleExportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGuard_${currentAudit?.name ?? currentAuditId ?? 'audit'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!results) return;
    const s = results.overall_summary;
    const auditName = currentAudit?.name ?? 'Audit Report';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const moduleRows = Object.entries(results.modules).map(([id, mod]) => {
      const meta = MODULE_META[id] ?? { short: id };
      const passed = mod.module_score >= (mod.pass_threshold ?? 0.75);
      return `<tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px;font-weight:500">${meta.short}</td>
        <td style="padding:8px 12px;font-family:monospace">${mod.module_score.toFixed(3)}</td>
        <td style="padding:8px 12px">
          <span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:${passed ? '#dcfce7' : '#fef9c3'};color:${passed ? '#166534' : '#854d0e'}">
            ${passed ? 'PASS' : 'FAIL'}
          </span>
        </td>
        <td style="padding:8px 12px;color:#6b7280;font-size:12px">${mod.risk_level} risk</td>
      </tr>`;
    }).join('');

    const findingRows = Object.values(results.modules).flatMap((mod) =>
      mod.findings.filter((f) => f.score < 0.75).map((f) =>
        `<tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:8px 12px;font-weight:500;font-size:12px">${f.criterion_id}</td>
          <td style="padding:8px 12px;font-size:12px">${f.description}</td>
          <td style="padding:8px 12px;font-family:monospace;font-size:12px">${f.score.toFixed(2)}</td>
          <td style="padding:8px 12px;font-size:11px;color:#6b7280">${f.severity}</td>
        </tr>`
      )
    ).join('');

    const decisionColor = s.decision === 'PASS' ? '#166534' : s.decision === 'ESCALATE' ? '#854d0e' : '#991b1b';
    const decisionBg = s.decision === 'PASS' ? '#dcfce7' : s.decision === 'ESCALATE' ? '#fef9c3' : '#fee2e2';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${auditName} — TrustGuard Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; margin: 0; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 16px; font-weight: 600; margin: 28px 0 12px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { text-align: left; padding: 8px 12px; background: #f9fafb; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 14px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .score-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .score-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .score-card .value { font-size: 22px; font-weight: 700; }
    .finding { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; margin-bottom: 6px; border-radius: 0 6px 6px 0; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
    <div>
      <div style="font-size:11px;font-weight:600;color:#0f766e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">TrustGuard Audit Report</div>
      <h1>${auditName}</h1>
    </div>
    <span class="badge" style="background:${decisionBg};color:${decisionColor}">${s.decision}</span>
  </div>
  <div class="meta">Generated ${date} &nbsp;·&nbsp; ${Object.keys(results.modules).length} modules evaluated</div>

  <div class="score-grid">
    <div class="score-card">
      <div class="label">Final Score</div>
      <div class="value">${s.final_score}<span style="font-size:14px;color:#6b7280">/100</span></div>
    </div>
    <div class="score-card">
      <div class="label">Confidence</div>
      <div class="value">${Math.round(s.confidence * 100)}<span style="font-size:14px;color:#6b7280">%</span></div>
    </div>
    <div class="score-card">
      <div class="label">Divergence</div>
      <div class="value" style="font-size:16px;text-transform:capitalize">${s.divergence}</div>
    </div>
    <div class="score-card">
      <div class="label">Modules Passed</div>
      <div class="value">${Object.values(results.modules).filter((m) => m.module_score >= (m.pass_threshold ?? 0.75)).length}<span style="font-size:14px;color:#6b7280">/${Object.keys(results.modules).length}</span></div>
    </div>
  </div>

  <p style="font-size:13px;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px">${s.notes}</p>

  <h2>Module Scores</h2>
  <table>
    <thead><tr><th>Module</th><th>Score</th><th>Status</th><th>Risk</th></tr></thead>
    <tbody>${moduleRows}</tbody>
  </table>

  ${findingRows ? `<h2>Risk Findings (below threshold)</h2>
  <table>
    <thead><tr><th>ID</th><th>Description</th><th>Score</th><th>Severity</th></tr></thead>
    <tbody>${findingRows}</tbody>
  </table>` : ''}

  ${results.key_findings.length > 0 ? `<h2>Key Findings</h2>
  ${results.key_findings.map((f) => `<div class="finding">${f}</div>`).join('')}` : ''}

  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af">
    Generated by TrustGuard &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; Confidential
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
      });
    }
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
        <div className="flex-1 min-w-0 mr-2">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => {
                if (titleValue.trim() && currentAuditId) renameAudit(currentAuditId, titleValue.trim());
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { if (titleValue.trim() && currentAuditId) renameAudit(currentAuditId, titleValue.trim()); setEditingTitle(false); }
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              className="w-full text-sm font-semibold text-gray-900 border-b-2 border-teal-500 outline-none bg-transparent pb-0.5"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1 group">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentAudit?.name ?? 'Audit'}</p>
              <button
                onClick={() => { setTitleValue(currentAudit?.name ?? ''); setEditingTitle(true); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-teal-600 transition-all flex-shrink-0"
                title="Rename audit"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500">{currentAudit?.company ?? ''}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!results && isTerminal && isRealAudit && (
            <button onClick={handleReload} title="Load results" className="p-1.5 text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {results && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                title="Export"
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
                  <button
                    onClick={() => { handleExportJSON(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileJson className="w-3.5 h-3.5 text-blue-500" /> Export JSON
                  </button>
                  <button
                    onClick={() => { handleExportPDF(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" /> Export PDF
                  </button>
                </div>
              )}
            </div>
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
          <ModulesTab
            results={results}
            activeModuleId={activeModuleId}
            setActiveModuleId={setActiveModuleId}
            onSelectCriterion={(moduleId, criterionId) => {
              setActiveCriterion({ moduleId, criterionId });
            }}
          />
        )}
        {results && activeRightTab === 'risks' && (
          <RisksTab results={results} />
        )}
      </div>
    </div>
  );
};

export default RightPanel;