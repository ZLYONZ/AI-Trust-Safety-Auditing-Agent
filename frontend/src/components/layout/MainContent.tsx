import {
  Upload, Send, Loader2, AlertTriangle, Trash2, Sparkles,
  CheckCircle, XCircle, Shield, Scale, Lock, Eye, Gauge,
  ChevronRight,
} from 'lucide-react';
import { useUIStore, apiResponseToAudit, type ChatMessage } from '../../store/uiStore';
import { useState, useRef, useEffect } from 'react';
import { auditApi, type AuditResults } from '../../services/auditApi';
import { AuditWebSocket } from '../../services/auditWebSocket';
import FileUploadModal from './FileUploadModal';

// ── Module display metadata ────────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; icon: JSX.Element; color: string; bar: string }> = {
  M1_GOVERNANCE: { label: 'Governance', icon: <Shield className="w-3.5 h-3.5" />, color: '#b45309', bar: '#b45309' },
  M2_FAIRNESS: { label: 'Fairness', icon: <Scale className="w-3.5 h-3.5" />, color: '#0f766e', bar: '#0f766e' },
  M3_SECURITY: { label: 'Security', icon: <Lock className="w-3.5 h-3.5" />, color: '#1d4ed8', bar: '#1d4ed8' },
  M4_EXPLAINABILITY: { label: 'Transparency', icon: <Eye className="w-3.5 h-3.5" />, color: '#c2410c', bar: '#c2410c' },
  M5_ACCURACY: { label: 'Performance', icon: <Gauge className="w-3.5 h-3.5" />, color: '#15803d', bar: '#15803d' },
};

const MODULE_ORDER = ['M1_GOVERNANCE', 'M2_FAIRNESS', 'M3_SECURITY', 'M4_EXPLAINABILITY', 'M5_ACCURACY'];

const STAGE_LABELS = [
  'Governance & Compliance',
  'Fairness & Bias',
  'Security & Privacy',
  'Explainability & Audit Trail',
  'Accuracy & Performance',
  'Council of Experts Review',
  'Arbitrator Synthesis',
];

// ── Running state card ─────────────────────────────────────────────────────

const RunningCard = ({ stageIndex }: { stageIndex: number }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-xl mx-auto">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {stageIndex < 5
            ? `Running ${STAGE_LABELS[stageIndex]} module…`
            : stageIndex < 7
              ? `Running ${STAGE_LABELS[stageIndex]}…`
              : 'Pipeline complete'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stageIndex < 5 ? `Module ${stageIndex + 1} of 5` : stageIndex < 7 ? 'Final stage' : 'Loading results…'}
        </p>
      </div>
    </div>

    {/* Progress bar */}
    <div className="flex gap-1.5 mb-4">
      {STAGE_LABELS.map((label, i) => (
        <div key={label} className="flex-1">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              background: i < stageIndex || stageIndex >= 5 ? '#0f766e'
                : i === stageIndex ? '#5eead4'
                  : '#e5e7eb',
            }}
          />
        </div>
      ))}
    </div>

    {/* Module progress list — all 5 always shown */}
    <div className="space-y-1.5">
      {STAGE_LABELS.map((label, i) => {
        const done = i < stageIndex;
        const current = i === stageIndex && stageIndex < STAGE_LABELS.length;
        const pending = !done && !current;
        return (
          <div key={label} className={`flex items-center gap-2 text-xs ${done ? 'text-gray-500' : current ? 'text-teal-700 font-medium' : 'text-gray-300'}`}>
            {done && <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />}
            {current && <Loader2 className="w-3.5 h-3.5 text-teal-500 animate-spin flex-shrink-0" />}
            {pending && <div className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0" />}
            <span>{label}</span>
          </div>
        );
      })}
      {stageIndex === 5 && (
        <div className="flex items-center gap-2 text-xs text-teal-700 font-medium mt-1 pt-1.5 border-t border-gray-100">
          <Loader2 className="w-3.5 h-3.5 text-teal-500 animate-spin flex-shrink-0" />
          <span>Running Council of Experts review…</span>
        </div>
      )}
      {stageIndex === 6 && (
        <div className="flex items-center gap-2 text-xs text-teal-700 font-medium mt-1 pt-1.5 border-t border-gray-100">
          <Loader2 className="w-3.5 h-3.5 text-teal-500 animate-spin flex-shrink-0" />
          <span>Running arbitrator synthesis…</span>
        </div>
      )}
    </div>
  </div>
);

// ── Results card ───────────────────────────────────────────────────────────

const ResultsCard = ({
  results,
  onViewDetails,
}: {
  results: AuditResults;
  onViewDetails: (target: string) => void;
}) => {
  const s = results.overall_summary;
  const passedCount = Object.values(results.modules).filter(
    (m) => m.module_score >= (m.pass_threshold ?? 0.75)
  ).length;
  const totalCount = Object.keys(results.modules).length;

  const decisionColors = {
    PASS: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800 border-green-300', text: 'text-green-900' },
    FAIL: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800 border-red-300', text: 'text-red-900' },
    ESCALATE: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800 border-amber-300', text: 'text-amber-900' },
  };
  const dc = decisionColors[s.decision as keyof typeof decisionColors] ?? decisionColors.ESCALATE;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">

      {/* Decision banner */}
      <div className={`rounded-2xl p-5 border ${dc.bg} ${dc.border}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Audit Decision</p>
            <p className={`text-2xl font-semibold ${dc.text}`}>{s.decision}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${dc.badge}`}>
            {s.decision === 'ESCALATE' && <AlertTriangle className="w-3 h-3" />}
            {s.decision === 'PASS' && <CheckCircle className="w-3 h-3" />}
            {s.decision === 'FAIL' && <XCircle className="w-3 h-3" />}
            {s.decision}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">{s.notes}</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Final Score', value: `${s.final_score}`, sub: '/ 100' },
            { label: 'Confidence', value: `${Math.round(s.confidence * 100)}%`, sub: '' },
            { label: 'Modules', value: `${passedCount}/${totalCount}`, sub: 'passed' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white/60 rounded-xl p-3 border border-white/80">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value} <span className="text-xs font-normal text-gray-400">{sub}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Module scores */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Module Scores</p>
        <div className="space-y-3">
          {MODULE_ORDER.filter((id) => results.modules[id]).map((id) => {
            const mod = results.modules[id];
            const meta = MODULE_META[id] ?? { label: id, icon: null, color: '#6b7280', bar: '#6b7280' };
            const passed = mod.module_score >= (mod.pass_threshold ?? 0.75);
            return (
              <div
                key={id}
                className="group cursor-pointer"
                onClick={() => onViewDetails(id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-teal-700 transition-colors">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{mod.module_score.toFixed(3)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                      {passed ? 'PASS' : 'FAIL'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${mod.module_score * 100}%`, background: meta.bar }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key findings */}
      {results.key_findings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Key Findings</p>
          <div className="space-y-2">
            {results.key_findings.map((f, i) => (
              <div
                key={i}
                onClick={() => onViewDetails('risks')}
                className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl border-l-2 border-teal-500 cursor-pointer hover:bg-teal-50 hover:border-teal-600 transition-colors group"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed group-hover:text-teal-800">{f}</p>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 flex-shrink-0 mt-0.5 ml-auto transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────


// ── Criterion Detail Panel ─────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  'PASS': 'bg-green-50 border-green-200 text-green-800',
  'SIGNIFICANT DEFICIENCY': 'bg-amber-50 border-amber-200 text-amber-800',
  'MATERIAL WEAKNESS': 'bg-red-50 border-red-200 text-red-800',
  'CONTROL DEFICIENCY': 'bg-gray-50 border-gray-200 text-gray-600',
};

const CriterionDetailPanel = ({
  moduleId,
  criterionId,
  results,
  onClose,
}: {
  moduleId: string;
  criterionId: string;
  results: AuditResults;
  onClose: () => void;
}) => {
  const mod = results.modules[moduleId];
  const finding = mod?.findings.find((f) => f.criterion_id === criterionId);
  const modMeta = MODULE_META[moduleId];

  if (!finding) return null;

  const passed = finding.score >= 0.75;
  const sevStyle = SEVERITY_COLORS[finding.severity] ?? SEVERITY_COLORS['CONTROL DEFICIENCY'];

  const recMap: Record<string, string> = {
    G: 'Review and update governance documentation. Ensure board-level approval, complete the risk register, and align with ISO 42001 and NIST AI RMF.',
    F: 'Conduct a bias audit. Implement automated fairness monitoring and establish GDPR Article 22 opt-out mechanisms.',
    S: 'Strengthen security controls — upgrade encryption, complete adversarial testing, and embed Privacy by Design into the AI development lifecycle.',
    E: 'Implement SHAP or LIME explainability. Ensure audit trails are immutable (WORM storage) and publish model cards for all production systems.',
    A: 'Establish automated drift monitoring with defined retraining triggers. Validate all models against held-out test sets.',
  };
  const rec = recMap[criterionId.charAt(0)] ?? 'Review this criterion against relevant regulatory requirements.';

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: modMeta?.color ?? '#6b7280' }}>{modMeta?.icon}</span>
            <span className="text-xs text-gray-400">{modMeta?.label ?? moduleId}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{criterionId}: {finding.description}</h3>
        </div>
        <button
          onClick={onClose}
          className="ml-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Score */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Score</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{finding.score.toFixed(2)}</span>
            <span className="text-xs text-gray-400">/ 1.0</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${sevStyle}`}>
              {finding.severity}
            </span>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${finding.score * 100}%`,
              background: passed ? '#0f766e' : finding.score >= 0.5 ? '#d97706' : '#dc2626',
            }}
          />
        </div>
      </div>

      {/* Evidence */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence from Document</p>
        {finding.evidence?.excerpt && finding.evidence.excerpt !== 'No evidence found in document' ? (
          <>
            <blockquote className="bg-gray-50 border-l-4 border-teal-500 rounded-r-lg p-3 text-sm text-gray-700 leading-relaxed italic">
              "{finding.evidence.excerpt}"
            </blockquote>
            {finding.evidence.source_section && finding.evidence.source_section !== 'N/A' && (
              <p className="text-xs text-gray-400 mt-1.5 ml-1">
                Source: {finding.evidence.source_section}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">No evidence found in the uploaded document for this criterion.</p>
        )}
      </div>

      {/* Why it matters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why This Matters</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {finding.score === 0
            ? 'This criterion has no documented evidence in the uploaded material. Without formal documentation, this area represents an unmitigated compliance risk that could expose the organization to regulatory penalties.'
            : finding.score <= 0.5
              ? 'Partial evidence exists but the criterion is only partially met. Key components are missing or insufficiently documented, creating a compliance gap that needs remediation.'
              : finding.score < 0.75
                ? 'Evidence is present with minor gaps. The criterion is mostly addressed but some deficiencies remain that should be resolved to fully meet the threshold.'
                : 'This criterion meets the compliance threshold. Continue maintaining and monitoring this control.'}
        </p>
      </div>

      {/* Recommendation */}
      {!passed && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommendation</p>
          <p className="text-sm text-teal-700 leading-relaxed bg-teal-50 rounded-lg p-3 border border-teal-100">
            {rec}
          </p>
        </div>
      )}
    </div>
  );
};

const MainContent = () => {
  const {
    currentAuditId, audits, liveMessages, auditStatus,
    addAudit, updateAuditStatus, setAuditResults,
    setCurrentAudit, removeAudit, liveResults,
    setActiveRightTab, setActiveModuleId, openRightPanel,
    activeCriterion, setActiveCriterion,
  } = useUIStore();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<AuditWebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentAudit = audits.find((a) => a.id === currentAuditId);
  const status = currentAuditId ? (auditStatus[currentAuditId] ?? currentAudit?.status) : null;
  const results = currentAuditId ? liveResults[currentAuditId] : undefined;
  const isRunning = status === 'running' || status === 'pending';
  const isTerminal = status === 'completed' || status === 'escalate' || status === 'failed';

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Scroll to bottom when user messages added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages.length]);

  // Reset stage + user messages when audit changes
  useEffect(() => {
    setStageIndex(0);
    setUserMessages([]);
  }, [currentAuditId]);

  // Clean up WS + poll
  useEffect(() => {
    return () => {
      wsRef.current?.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentAuditId]);

  // Auto-poll for running audits after page refresh
  useEffect(() => {
    if (!currentAuditId) return;
    const isReal = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(currentAuditId);
    if (!isReal) return;
    const s = auditStatus[currentAuditId] ?? currentAudit?.status;
    if (s !== 'running' && s !== 'pending') return;
    if ((liveMessages[currentAuditId] ?? []).length > 0) return;
    startPolling(currentAuditId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAuditId, status]);

  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Polling ──────────────────────────────────────────────────────────────

  const startPolling = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    // Stage progress timers
    const DELAYS = [1500, 3000, 4500, 6000, 7500, 9000, 10500];
    const timers: ReturnType<typeof setTimeout>[] = [];
    DELAYS.forEach((delay, i) => {
      timers.push(setTimeout(() => setStageIndex(i), delay));
    });
    const clearTimers = () => timers.forEach(clearTimeout);

    let done = false;

    const fetchResults = async (attempt = 1): Promise<void> => {
      try {
        const r = await auditApi.getAuditResults(id);
        setAuditResults(id, r);
        // Update sidebar badge to match actual decision
        const decision = r.overall_summary?.decision;
        if (decision === 'FAIL') updateAuditStatus(id, 'failed');
        if (decision === 'ESCALATE') updateAuditStatus(id, 'escalate');
        if (decision === 'PASS') updateAuditStatus(id, 'completed');
      } catch {
        if (attempt < 12) setTimeout(() => fetchResults(attempt + 1), 3000);
      }
    };

    const handleTerminal = (termStatus: string): void => {
      if (done) return;
      done = true;
      clearInterval(interval);
      clearTimers();
      pollRef.current = null;
      setStageIndex(6); // show all 5 modules + peer review complete
      // fetchResults will override status with the actual decision (PASS/FAIL/ESCALATE)
      fetchResults();
    };

    // Fast poll after arbitrator
    timers.push(setTimeout(() => {
      if (done) return;
      const fast = setInterval(async () => {
        if (done) { clearInterval(fast); return; }
        try {
          const r = await auditApi.getAuditStatus(id);
          if (['completed', 'escalate', 'failed'].includes(r.status)) {
            clearInterval(fast);
            handleTerminal(r.status);
          }
        } catch { }
      }, 2000);
      timers.push(fast as any);
    }, 11000));

    const interval = setInterval(async () => {
      if (done) { clearInterval(interval); return; }
      try {
        const r = await auditApi.getAuditStatus(id);
        if (['completed', 'escalate', 'failed'].includes(r.status)) handleTerminal(r.status);
      } catch { }
    }, 3000);

    pollRef.current = interval;
    setTimeout(() => { if (!done) { done = true; clearInterval(interval); clearTimers(); } }, 900000);
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleFileUpload = async (files: File[], urls: string[] = [], githubRepos: string[] = []) => {
    setUploading(true);
    setShowUploadModal(false);
    let auditId = '';
    try {
      const created = await auditApi.createAudit({
        name: `Audit - ${new Date().toLocaleDateString()}`,
        files,
        urls,
        githubRepos,
      });
      auditId = created.audit_id;
      addAudit(apiResponseToAudit(created));
      setCurrentAudit(auditId);
      updateAuditStatus(auditId, 'running');
      setStageIndex(0);
      setUserMessages([]);

      startPolling(auditId);

      const ws = new AuditWebSocket();
      wsRef.current = ws;
      ws.connect(auditId, {
        onModuleComplete: (msg) => {
          const idx = MODULE_ORDER.indexOf(msg.module_id);
          if (idx >= 0) setStageIndex(idx + 1);
        },
        onAuditComplete: async (msg) => {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          const term = msg.decision === 'ESCALATE' ? 'escalate' : msg.decision === 'PASS' ? 'completed' : 'failed';
          updateAuditStatus(auditId, term);
          setStageIndex(7);
          try {
            const r = await auditApi.getAuditResults(auditId);
            setAuditResults(auditId, r);
          } catch { }
          ws.disconnect();
        },
        onError: () => { },
      });

      await auditApi.executeAudit(auditId);
    } catch (err) {
      if (auditId) updateAuditStatus(auditId, 'failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAuditId) return;
    try { await auditApi.deleteAudit(currentAuditId); } catch { }
    removeAudit(currentAuditId);
    setCurrentAudit(null);
  };

  const handleViewDetails = (target: string) => {
    if (target === 'risks') {
      setActiveRightTab('risks');
    } else {
      setActiveModuleId(target);
      setActiveRightTab('modules');
    }
    openRightPanel();
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setUserMessages(prev => [...prev, { type: 'user', content: message, timestamp: ts() }]);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!currentAuditId) {
    return (
      <>
        <div className="h-full flex items-center justify-center bg-white">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to TrustGuard</h2>
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Upload your AI governance policies, model documentation, security reports, and compliance records.
            </p>
            <p className="text-xs text-gray-400 mb-6">5 modules · 22 criteria · ISO 42001 · GDPR · SOX 404 · NIST AI RMF</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Start New Audit
            </button>
          </div>
        </div>
        {showUploadModal && <FileUploadModal onClose={() => setShowUploadModal(false)} onUpload={handleFileUpload} />}
      </>
    );
  }

  // ── Active audit ──────────────────────────────────────────────────────────

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">

        {/* Top bar */}
        <div className="border-b border-gray-200 px-5 py-3 bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">{currentAudit?.name ?? 'Audit Session'}</h2>
              {status === 'escalate' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-300"><AlertTriangle className="w-3 h-3" /> ESCALATE</span>}
              {status === 'completed' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-300"><CheckCircle className="w-3 h-3" /> PASS</span>}
              {status === 'failed' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-300"><XCircle className="w-3 h-3" /> FAIL</span>}
              {isRunning && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-medium rounded-full border border-teal-300"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentAudit?.company ?? 'Uploaded'} · 5-module evaluation
              {uploading && <span className="ml-2 text-teal-600">Uploading…</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isTerminal && (
              <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={() => setShowUploadModal(true)} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Upload className="w-3.5 h-3.5" /> New Audit
            </button>
          </div>
        </div>

        {/* Center content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-col items-center gap-4">

            {/* Running state */}
            {isRunning && !results && <RunningCard stageIndex={stageIndex} />}

            {/* Criterion detail panel - shown above results when a criterion is selected */}
            {results && activeCriterion && activeCriterion.moduleId in results.modules && (
              <CriterionDetailPanel
                moduleId={activeCriterion.moduleId}
                criterionId={activeCriterion.criterionId}
                results={results}
                onClose={() => setActiveCriterion(null)}
              />
            )}

            {/* Results card */}
            {results && (
              <ResultsCard
                results={results}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Failed with no results */}
            {status === 'failed' && !results && (
              <div className="w-full max-w-xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-red-900">Pipeline failed</p>
                <p className="text-xs text-red-600 mt-1">Check the server terminal for details. Delete this audit and try again.</p>
              </div>
            )}

            {/* User Q&A messages */}
            {userMessages.length > 0 && (
              <div className="w-full max-w-xl space-y-3 mt-2">
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-400 text-center mb-3">Follow-up questions</p>
                  {userMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.type === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                        }`}>
                        {msg.content}
                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-teal-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-gray-200 px-5 py-3 bg-white flex-shrink-0">
          {showSuggestions && currentAuditId && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(results
                ? [
                  'What are the highest-priority remediation actions?',
                  'Which module has the most critical gaps?',
                  'Summarize the governance findings',
                  'What GDPR articles need attention?',
                  'How can we improve the security score?',
                  'Explain the ESCALATE decision',
                ]
                : [
                  'What documents should I upload for a full audit?',
                  'What does each module evaluate?',
                  'How are scores calculated?',
                ]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => { setMessage(s); setShowSuggestions(false); textareaRef.current?.focus(); }}
                  className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full hover:bg-teal-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent bg-white pr-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={results ? 'Ask about findings or request improvement advice…' : 'Ask a question about the audit…'}
              className="flex-1 px-3 py-2.5 resize-none outline-none text-sm overflow-hidden bg-transparent rounded-xl"
              style={{ minHeight: '42px', maxHeight: '160px' }}
              rows={1}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setShowSuggestions((v) => !v)} className="p-1 text-gray-300 hover:text-teal-500 transition-colors" title="Suggestions">
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Enter to send · Shift+Enter for new line · ✦ for suggestions</p>
        </div>
      </div>

      {showUploadModal && <FileUploadModal onClose={() => setShowUploadModal(false)} onUpload={handleFileUpload} />}
    </>
  );
};

export default MainContent;