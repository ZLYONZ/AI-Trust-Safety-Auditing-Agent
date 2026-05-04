import { Plus, Search, CheckCircle, Clock, AlertCircle, AlertTriangle, Loader2, Trash2, Pencil } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { auditApi } from '../../services/auditApi';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

const LeftSidebar = () => {
  const { currentAuditId, audits, setCurrentAudit, removeAudit, setAudits, renameAudit } = useUIStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const loadedRef = useRef(false);

  // Load real audits from API once on mount — replace store with server truth
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    auditApi.listAudits().then((list: any[]) => {
      // Build fresh list from API, keeping mock entries that aren't in DB
      const apiIds = new Set(list.map((r) => r.audit_id));
      const mocks = audits.filter((a) => !apiIds.has(a.id) && !/^[0-9a-f]{8}-/.test(a.id));
      const real = list.map((r) => ({
        id: r.audit_id,
        name: r.name,
        company: 'Uploaded',
        status: r.status ?? 'pending',
        created_at: r.created_at,
      }));
      setAudits([...real, ...mocks]);
    }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try { await auditApi.deleteAudit(id); } catch { }
    removeAudit(id);
  };

  const sorted = [...audits].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const filtered = sorted.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.company.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
      case 'in-progress':
      case 'running': return <Clock className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 animate-pulse" />;
      case 'pending': return <Loader2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 animate-spin" />;
      case 'failed': return <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
      case 'escalate': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-block text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap';
    switch (status) {
      case 'completed': return `${base} bg-green-100 text-green-700`;
      case 'in-progress':
      case 'running': return `${base} bg-teal-100 text-teal-700`;
      case 'pending': return `${base} bg-gray-100 text-gray-500`;
      case 'failed': return `${base} bg-red-100 text-red-600`;
      case 'escalate': return `${base} bg-yellow-100 text-yellow-800`;
      default: return `${base} bg-gray-100 text-gray-500`;
    }
  };

  const getStatusLabel = (s: string) => {
    if (s === 'in-progress' || s === 'running') return 'running';
    if (s === 'failed') return 'fail';
    return s;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setCurrentAudit(null)}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Audit
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Audits ({filtered.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">No audits yet</p>
        )}
        {filtered.map((audit) => (
          <div
            key={audit.id}
            className={`
              relative p-3 rounded-lg border transition-all group cursor-pointer
              ${currentAuditId === audit.id
                ? 'bg-teal-50 border-teal-300'
                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
              }
            `}
            onClick={() => setCurrentAudit(audit.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentAudit(audit.id)}
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {getStatusIcon(audit.status)}
                {editingId === audit.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => {
                      if (editValue.trim()) renameAudit(audit.id, editValue.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { if (editValue.trim()) renameAudit(audit.id, editValue.trim()); setEditingId(null); }
                      if (e.key === 'Escape') setEditingId(null);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-gray-900 border-b border-teal-500 outline-none bg-transparent flex-1 min-w-0"
                  />
                ) : (
                  <h3 className="font-medium text-xs text-gray-900 truncate flex-1 leading-tight">
                    {audit.name}
                  </h3>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <span
                  onClick={(e) => { e.stopPropagation(); setEditValue(audit.name); setEditingId(audit.id); }}
                  className="p-0.5 text-gray-300 hover:text-teal-500 cursor-pointer transition-colors"
                  title="Rename"
                  role="button"
                  tabIndex={0}
                >
                  <Pencil className="w-3 h-3" />
                </span>
                <span
                  onClick={(e) => handleDelete(e, audit.id)}
                  className="p-0.5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors"
                  title="Delete"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleDelete(e as any, audit.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 ml-5 mb-1.5">{audit.company}</p>
            <div className="ml-5 flex items-center gap-2">
              <span className={getStatusBadge(audit.status)}>
                {getStatusLabel(audit.status)}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;