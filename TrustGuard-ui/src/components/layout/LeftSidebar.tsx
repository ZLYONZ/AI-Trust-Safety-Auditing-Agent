import { Plus, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { formatDistanceToNow } from 'date-fns';

// Mock audit data
const mockAudits = [
  {
    id: '1',
    name: 'FinanceBot AI System Audit',
    status: 'completed' as const,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Customer Service AI Review',
    status: 'in-progress' as const,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Credit Scoring Model Audit',
    status: 'completed' as const,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const LeftSidebar = () => {
  const { currentAuditId, setCurrentAudit } = useUIStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-teal-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-[1.15rem] border-b border-gray-200">
        <button
          onClick={() => setCurrentAudit(null)}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Audit
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search audits..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mockAudits.map((audit) => (
          <button
            key={audit.id}
            onClick={() => setCurrentAudit(audit.id)}
            className={`
              w-full text-left p-3 rounded-lg border transition-all
              ${currentAuditId === audit.id
                ? 'bg-teal-50 border-teal-300 shadow-sm'
                : 'hover:bg-gray-50 border-transparent'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(audit.status)}
              <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
                {audit.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
            </p>
            <div className="mt-2">
              <span className={`
                inline-block text-xs px-2 py-0.5 rounded-full font-medium
                ${audit.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                ${audit.status === 'in-progress' ? 'bg-teal-100 text-teal-700' : ''}
              `}>
                {audit.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
