import { Upload, Send, Loader2, AlertTriangle } from 'lucide-react';
import { useUIStore, MOCK_AUDITS, TTMT_AUDIT_RESULT } from '../../store/uiStore';
import { useState, useRef, useEffect } from 'react';
import { auditApi } from '../../services/auditApi';
import FileUploadModal from './FileUploadModal';

// ─── Chat messages for the TTMT audit run ─────────────────────────────────

const TTMT_MESSAGES = [
  { type: 'system', content: 'Audit session started. TTMT AI system documentation received. Initialising 5-module evaluation pipeline.', timestamp: '10:30 AM' },
  { type: 'user', content: 'Uploaded: TTMT_governance_policy.pdf, AI_fairness_compliance.pdf, security_architecture.pdf, model_explainability.pdf, performance_monitoring.pdf', timestamp: '10:31 AM' },
  { type: 'agent', content: 'Files received. Running Module 1 — Governance & Compliance…', timestamp: '10:32 AM' },
  { type: 'system', content: '⚠ Governance module completed — Score: 0.655 · SIGNIFICANT DEFICIENCY', timestamp: '10:33 AM' },
  { type: 'agent', content: 'Governance analysis complete. Key findings: G1.3 (SOX 404 controls) scored 0.5 due to inconsistent testing frequency and non-standardized documentation. G1.6 and G1.7 both at 0.5 — GDPR Article 30 ROPA and Article 35 DPIA governance gaps identified. DPO consultation processes not fully standardized.', timestamp: '10:33 AM' },
  { type: 'system', content: '✓ Fairness module completed — Score: 0.862 · PASS', timestamp: '10:35 AM' },
  { type: 'agent', content: 'Fairness assessment strong. F2.1 (special category data) and F2.3 (bias mitigation) both scored 1.0 — strict prohibition on protected attributes and systematic reweighting/resampling in place. Gap found in F2.4 at 0.5: automated decision opt-out rights under GDPR Art. 22 and CCPA only partially fulfilled.', timestamp: '10:35 AM' },
  { type: 'system', content: '✓ Security module completed — Score: 0.855 · PASS', timestamp: '10:37 AM' },
  { type: 'agent', content: 'Security posture excellent. S3.1 (AES-256/TLS 1.3), S3.2 (adversarial robustness with red-teaming), and S3.3 (RBAC+ABAC+MFA) all scored 1.0. S3.4 flagged at 0.5 — Privacy by Design per GDPR Art. 25 is applied to data pipelines but lacks system-level architectural documentation.', timestamp: '10:37 AM' },
  { type: 'system', content: '✓ Explainability module completed — Score: 0.925 · PASS', timestamp: '10:39 AM' },
  { type: 'agent', content: 'Transparency and explainability excellent. E4.1 (SHAP explanations at 98%+ coverage), E4.2 (WORM immutable audit trail, 7-year retention), and E4.3 (comprehensive model cards with Git versioning) all scored 1.0. E4.4 and E4.5 at 0.75 — right-to-contest and CCPA explanation rights could be more explicitly documented.', timestamp: '10:39 AM' },
  { type: 'system', content: '✓ Performance module completed — Score: 0.750 · PASS', timestamp: '10:40 AM' },
  { type: 'agent', content: 'Performance monitoring in place with >94% model accuracy. All four criteria (A5.1–A5.4) scored 0.75 — drift detection alerts are configured but automated retraining is not universally triggered; dashboard updates are not always real-time.', timestamp: '10:40 AM' },
  { type: 'decision', content: 'Final Decision: ESCALATE\nComposite score: 85.5 / 100 · Confidence: 46% · Divergence: CRITICAL\nCritical divergence across modules → mandatory human review required before certification.', timestamp: '10:41 AM' },
  { type: 'user', content: 'What are the highest-priority remediation actions?', timestamp: '10:42 AM' },
  { type: 'agent', content: 'Top 3 remediation priorities:\n1. Standardize SOX 404 control documentation and enforce quarterly testing cadence (G1.3 — Material Weakness risk)\n2. Assign DPO ownership of ROPA and establish mandatory DPIA review gate for high-risk AI (G1.6, G1.7 — GDPR Art. 30 & 35)\n3. Implement Privacy by Design system architecture documentation per GDPR Art. 25 (S3.4)', timestamp: '10:42 AM' },
];

// ─── Component ────────────────────────────────────────────────────────────

const MainContent = () => {
  const { currentAuditId, setCurrentAudit } = useUIStore();
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extraMessages, setExtraMessages] = useState<Array<{ type: string; content: string; timestamp: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAudit = MOCK_AUDITS.find(a => a.id === currentAuditId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentAuditId, extraMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setExtraMessages(prev => [...prev, { type: 'user', content: message, timestamp: now }]);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const audit = await auditApi.createAudit({
        name: `Audit - ${new Date().toISOString()}`,
        files,
      });
      setCurrentAudit(audit.audit_id);
      await auditApi.executeAudit(audit.audit_id);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!currentAuditId) {
    return (
      <>
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to TrustGuard</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Start a new AI system audit by uploading your governance policies, model artifacts, security documentation, and compliance records.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files to Start Audit
            </button>
          </div>
        </div>
        {showUploadModal && (
          <FileUploadModal onClose={() => setShowUploadModal(false)} onUpload={handleFileUpload} />
        )}
      </>
    );
  }

  // ── Determine which messages to show ────────────────────────────────────
  const messages = currentAuditId === 'audit-ttmt-2026-001' ? TTMT_MESSAGES : [];
  const isEscalate = currentAudit?.status === 'escalate';

  // ── Message bubble renderer ──────────────────────────────────────────────
  const renderMessage = (msg: typeof TTMT_MESSAGES[0], index: number) => {
    if (msg.type === 'user') {
      return (
        <div key={index} className="flex justify-end">
          <div className="max-w-[72%] bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm leading-relaxed">{msg.content}</p>
            <p className="text-xs mt-1 text-teal-200">{msg.timestamp}</p>
          </div>
        </div>
      );
    }

    if (msg.type === 'system') {
      return (
        <div key={index} className="flex justify-center">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-xs font-medium max-w-[80%] text-center">
            {msg.content}
          </div>
        </div>
      );
    }

    if (msg.type === 'decision') {
      return (
        <div key={index} className="flex justify-start">
          <div className="max-w-[80%] bg-yellow-50 border border-yellow-300 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-yellow-800">Orchestrator Decision</span>
            </div>
            {msg.content.split('\n').map((line, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'font-semibold text-yellow-900' : 'text-yellow-800'}`}>{line}</p>
            ))}
            <p className="text-xs mt-1.5 text-yellow-600">{msg.timestamp}</p>
          </div>
        </div>
      );
    }

    // agent
    return (
      <div key={index} className="flex justify-start">
        <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          {msg.content.split('\n').map((line, i) => (
            <p key={i} className="text-sm text-gray-800 leading-relaxed">{line}</p>
          ))}
          <p className="text-xs mt-1 text-gray-400">{msg.timestamp}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Chat header */}
        <div className="border-b border-gray-200 px-6 py-3 bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                {currentAudit?.name || 'Audit Session'}
              </h2>
              {isEscalate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-300">
                  <AlertTriangle className="w-3 h-3" />
                  ESCALATE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentAudit?.company} · 5 modules evaluated
              {uploading && (
                <span className="ml-2 inline-flex items-center gap-1 text-teal-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Processing…
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Files
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {[...messages, ...extraMessages].map((msg, index) => renderMessage(msg as typeof TTMT_MESSAGES[0], index))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-5 py-3 bg-white flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about findings, request clarification, or add context…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm overflow-hidden bg-gray-50"
              style={{ minHeight: '40px', maxHeight: '160px' }}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {showUploadModal && (
        <FileUploadModal onClose={() => setShowUploadModal(false)} onUpload={handleFileUpload} />
      )}
    </>
  );
};

export default MainContent;