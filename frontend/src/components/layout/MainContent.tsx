import { Upload, Send, Loader2, AlertTriangle, Trash2, Sparkles } from 'lucide-react';
import { useUIStore, apiResponseToAudit, type ChatMessage } from '../../store/uiStore';
import { useState, useRef, useEffect } from 'react';
import { auditApi } from '../../services/auditApi';
import { AuditWebSocket } from '../../services/auditWebSocket';
import FileUploadModal from './FileUploadModal';

const MainContent = () => {
  const {
    currentAuditId, audits, liveMessages, auditStatus,
    addAudit, updateAuditStatus, setAuditResults,
    addChatMessage, setCurrentAudit, removeAudit, liveResults,
  } = useUIStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<AuditWebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentAudit = audits.find((a) => a.id === currentAuditId);
  const messages: ChatMessage[] = currentAuditId ? (liveMessages[currentAuditId] ?? []) : [];
  const status = currentAuditId ? (auditStatus[currentAuditId] ?? currentAudit?.status) : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Clean up WS + poll when switching audits
  useEffect(() => {
    return () => {
      wsRef.current?.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentAuditId]);

  // Auto-poll when selecting a running audit after page refresh
  useEffect(() => {
    if (!currentAuditId) return;
    const isRealAudit = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(currentAuditId);
    if (!isRealAudit) return;

    // Use stable status value computed at render time
    const currentStatus = auditStatus[currentAuditId] ?? currentAudit?.status;
    if (currentStatus !== 'running' && currentStatus !== 'pending') return;
    const msgs = liveMessages[currentAuditId] ?? [];
    if (msgs.length > 0) return;

    push(currentAuditId, { type: 'system', content: 'Reconnecting to running audit…' });
    startPolling(currentAuditId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAuditId, status]);

  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const push = (id: string, msg: Omit<ChatMessage, 'timestamp'>) =>
    addChatMessage(id, { ...msg, timestamp: ts() });

  // ── Core polling — primary results path (WebSocket is bonus) ────────────────
  const startPolling = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    // Show progress messages at fixed intervals while pipeline runs
    const STAGES = [
      { delay: 2000, msg: 'Running Governance & Compliance module…' },
      { delay: 14000, msg: 'Running Fairness & Bias module…' },
      { delay: 26000, msg: 'Running Security & Privacy module…' },
      { delay: 38000, msg: 'Running Explainability & Audit Trail module…' },
      { delay: 50000, msg: 'Running Accuracy & Performance module…' },
      { delay: 62000, msg: 'Running Council of Experts peer review…' },
      { delay: 74000, msg: 'Running arbitrator synthesis…' },
    ];
    const stageTimers: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach(({ delay, msg }) => {
      stageTimers.push(setTimeout(() => push(id, { type: 'system', content: msg }), delay));
    });

    const clearStages = () => stageTimers.forEach(clearTimeout);

    // Shared done-guard so poll and fetchResults don't both fire
    let done = false;

    const handleTerminal = (termStatus: string) => {
      if (done) return;
      done = true;
      clearInterval(interval);
      clearStages();
      pollRef.current = null;
      const term = termStatus === 'escalate' ? 'escalate'
        : termStatus === 'completed' ? 'completed' : 'failed';
      updateAuditStatus(id, term as any);
      push(id, { type: 'system', content: 'Pipeline complete — loading results…' });
      fetchResults();
    };

    const fetchResults = async (attempt = 1): Promise<void> => {
      try {
        const results = await auditApi.getAuditResults(id);
        setAuditResults(id, results);
        const s = results.overall_summary;
        push(id, {
          type: 'decision',
          content: `Final Decision: ${s.decision}\nComposite score: ${s.final_score} / 100 · Confidence: ${Math.round(s.confidence * 100)}% · Divergence: ${s.divergence}\n${s.notes}`,
        });
      } catch (e) {
        if (attempt < 12) {
          setTimeout(() => fetchResults(attempt + 1), 3000);
        } else {
          push(id, { type: 'system', content: 'Results saved — click Modules tab to view details.' });
        }
      }
    };

    // After arbitrator stage fires, poll more aggressively (every 2s instead of 3s)
    // for the final 60 seconds of the pipeline
    stageTimers.push(setTimeout(() => {
      if (done) return;
      const fastInterval = setInterval(async () => {
        if (done) { clearInterval(fastInterval); return; }
        try {
          const res = await auditApi.getAuditStatus(id);
          if (['completed', 'escalate', 'failed'].includes(res.status)) {
            clearInterval(fastInterval);
            handleTerminal(res.status);
          }
        } catch { }
      }, 2000);
      stageTimers.push(fastInterval as any);
    }, 76000));

    const interval = setInterval(async () => {
      if (done) { clearInterval(interval); return; }
      try {
        const res = await auditApi.getAuditStatus(id);
        if (['completed', 'escalate', 'failed'].includes(res.status)) {
          handleTerminal(res.status);
        }
      } catch { }
    }, 3000);

    pollRef.current = interval;
    // Safety: stop after 15 minutes
    setTimeout(() => {
      if (!done) {
        done = true;
        clearInterval(interval);
        clearStages();
        push(id, { type: 'system', content: 'Audit timed out — refresh to check status.' });
      }
    }, 900000);
  };

  // ── File upload + pipeline ─────────────────────────────────────────────────
  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    setShowUploadModal(false);
    let auditId = '';

    try {
      const created = await auditApi.createAudit({
        name: `Audit - ${new Date().toLocaleDateString()}`,
        files,
      });
      auditId = created.audit_id;

      addAudit(apiResponseToAudit(created));
      setCurrentAudit(auditId);
      updateAuditStatus(auditId, 'running');

      push(auditId, {
        type: 'system',
        content: `Audit started. ${files.length} file${files.length > 1 ? 's' : ''} uploaded: ${files.map((f) => f.name).join(', ')}`,
      });

      // Start polling immediately — this is the reliable path
      startPolling(auditId);

      // WebSocket is a bonus: shows live module messages if connection stays open
      const ws = new AuditWebSocket();
      wsRef.current = ws;
      ws.connect(auditId, {
        onOpen: () =>
          push(auditId, { type: 'agent', content: 'Live stream connected. Running 5-module evaluation…' }),

        onProgress: (msg) =>
          push(auditId, { type: 'system', content: msg.message }),

        onModuleComplete: (msg) => {
          const score = msg.result.module_score;
          const passed = score >= (msg.result.pass_threshold ?? 0.75);
          push(auditId, {
            type: 'system',
            content: `${passed ? '✓' : '⚠'} ${msg.module_name} complete — Score: ${score.toFixed(3)} · ${passed ? 'PASS' : 'FAIL'}`,
          });
        },

        onPeerReview: (msg) => {
          if (msg.flag)
            push(auditId, { type: 'agent', content: `Peer review flag: ${msg.reviewer} → ${msg.reviewed}: ${msg.comment}` });
        },

        onArbitration: (msg) => {
          const s = msg.summary;
          push(auditId, {
            type: 'decision',
            content: `Final Decision: ${s.decision}\nComposite score: ${s.final_score} / 100 · Confidence: ${Math.round(s.confidence * 100)}% · Divergence: ${s.divergence}\n${s.notes}`,
          });
        },

        onAuditComplete: async (msg) => {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          const term = msg.decision === 'ESCALATE' ? 'escalate' : msg.decision === 'PASS' ? 'completed' : 'failed';
          updateAuditStatus(auditId, term);
          try {
            const results = await auditApi.getAuditResults(auditId);
            setAuditResults(auditId, results);
          } catch { }
          ws.disconnect();
        },

        onError: () => { }, // polling handles it
      });

      await auditApi.executeAudit(auditId);

    } catch (err) {
      const text = err instanceof Error ? err.message : 'Upload failed';
      if (auditId) { push(auditId, { type: 'system', content: `Error: ${text}` }); updateAuditStatus(auditId, 'failed'); }
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAuditId) return;
    try {
      await auditApi.deleteAudit(currentAuditId);
    } catch { }
    removeAudit(currentAuditId);
    setCurrentAudit(null);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentAuditId) return;
    push(currentAuditId, { type: 'user', content: message });
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.type === 'user') return (
      <div key={index} className="flex justify-end">
        <div className="max-w-[72%] bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-sm leading-relaxed">{msg.content}</p>
          <p className="text-xs mt-1 text-teal-200">{msg.timestamp}</p>
        </div>
      </div>
    );
    if (msg.type === 'system') return (
      <div key={index} className="flex justify-center">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-xs font-medium max-w-[85%] text-center">
          {msg.content}
        </div>
      </div>
    );
    if (msg.type === 'decision') return (
      <div key={index} className="flex justify-start">
        <div className="max-w-[82%] bg-yellow-50 border border-yellow-300 rounded-2xl rounded-tl-sm px-4 py-3">
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

  if (!currentAuditId) {
    return (
      <>
        <div className="h-full flex items-center justify-center bg-white">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to TrustGuard</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Upload governance policies, model artifacts, security documentation, and compliance records to start an audit.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Files to Start Audit
            </button>
          </div>
        </div>
        {showUploadModal && <FileUploadModal onClose={() => setShowUploadModal(false)} onUpload={handleFileUpload} />}
      </>
    );
  }

  const isRunning = status === 'running' || status === 'pending';

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 px-5 py-3 bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">{currentAudit?.name ?? 'Audit Session'}</h2>
              {status === 'escalate' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-300"><AlertTriangle className="w-3 h-3" /> ESCALATE</span>}
              {status === 'completed' && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-300">PASS</span>}
              {status === 'failed' && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-300">FAILED</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentAudit?.company ?? 'Unknown'} · 5-module evaluation
              {isRunning && <span className="ml-2 inline-flex items-center gap-1 text-teal-600"><Loader2 className="w-3 h-3 animate-spin" /> Running…</span>}
              {uploading && <span className="ml-2 inline-flex items-center gap-1 text-teal-600"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(status === 'failed' || status === 'completed' || status === 'escalate') && (
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={() => setShowUploadModal(true)} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              <Upload className="w-3.5 h-3.5" /> New Audit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-white">
          {messages.length === 0 && isRunning && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Pipeline running — results appear automatically…
              </div>
            </div>
          )}
          {messages.map((msg, i) => renderMessage(msg, i))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 px-5 py-3 bg-white flex-shrink-0">
          {/* Smart suggestions */}
          {showSuggestions && currentAuditId && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[
                ...(liveResults[currentAuditId]
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
                ),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setMessage(suggestion);
                    setShowSuggestions(false);
                    textareaRef.current?.focus();
                  }}
                  className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full hover:bg-teal-100 transition-colors text-left"
                >
                  {suggestion}
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
              placeholder="Ask about findings, request improvement advice…"
              className="flex-1 px-3 py-2.5 resize-none outline-none text-sm overflow-hidden bg-transparent rounded-xl"
              style={{ minHeight: '42px', maxHeight: '160px' }}
              rows={1}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowSuggestions((v) => !v)}
                className="p-1 text-gray-300 hover:text-teal-500 transition-colors"
                title="Show suggestions"
              >
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