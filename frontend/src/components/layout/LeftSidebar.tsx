import { Plus, Search, CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { useUIStore, MOCK_AUDITS } from '../../store/uiStore';
import { formatDistanceToNow } from 'date-fns';

const LeftSidebar = () => {
  const { currentAuditId, setCurrentAudit } = useUIStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
      case 'in-progress':
        return <Clock className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
      case 'escalate':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-block text-xs px-2 py-0.5 rounded-full font-medium';
    switch (status) {
      case 'completed': return `${base} bg-green-100 text-green-700`;
      case 'in-progress': return `${base} bg-teal-100 text-teal-700`;
      case 'failed': return `${base} bg-red-100 text-red-700`;
      case 'escalate': return `${base} bg-yellow-100 text-yellow-800`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* New Audit button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setCurrentAudit(null)}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Audit
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audits..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent Audits</span>
      </div>

      {/* Audit list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {MOCK_AUDITS.map((audit) => (
          <button
            key={audit.id}
            onClick={() => setCurrentAudit(audit.id)}
            className={`
              w-full text-left p-3 rounded-lg border transition-all
              ${currentAuditId === audit.id
                ? 'bg-teal-50 border-teal-300'
                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
              }
            `}
          >
            <div className="flex items-start gap-2 mb-1">
              {getStatusIcon(audit.status)}
              <h3 className="font-medium text-xs text-gray-900 truncate flex-1 leading-tight">
                {audit.name}
              </h3>
            </div>
            <p className="text-xs text-gray-400 ml-5 mb-2">{audit.company}</p>
            <div className="flex items-center justify-between ml-5">
              <span className={getStatusBadge(audit.status)}>
                {audit.status === 'escalate' ? 'escalate' : audit.status}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;