import { Shield, Bell, Settings } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const Header = () => {
  const { audits, auditStatus, liveResults } = useUIStore();

  // Find the most recently created real audit (UUID format)
  const recentAudit = [...audits]
    .filter((a) => /^[0-9a-f]{8}-/.test(a.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const status = recentAudit ? (auditStatus[recentAudit.id] ?? recentAudit.status) : null;
  const results = recentAudit ? liveResults[recentAudit.id] : null;
  const score = results?.overall_summary?.final_score;
  const decision = results?.overall_summary?.decision ?? status?.toUpperCase();

  const badgeStyle =
    status === 'escalate' ? 'bg-yellow-900/40 border-yellow-700/50 text-yellow-300' :
      status === 'completed' ? 'bg-green-900/40 border-green-700/50 text-green-300' :
        status === 'failed' ? 'bg-red-900/40 border-red-700/50 text-red-300' :
          status === 'running' || status === 'pending' ? 'bg-teal-900/40 border-teal-700/50 text-teal-300' :
            'bg-gray-800/40 border-gray-700/50 text-gray-400';

  const dotStyle =
    status === 'escalate' ? 'bg-yellow-400 animate-pulse' :
      status === 'completed' ? 'bg-green-400' :
        status === 'failed' ? 'bg-red-400' :
          status === 'running' || status === 'pending' ? 'bg-teal-400 animate-pulse' :
            'bg-gray-500';

  const badgeText = recentAudit
    ? `${recentAudit.name} · ${decision ?? status?.toUpperCase() ?? '—'}${score != null ? ` · ${score}/100` : ''}`
    : 'No audits yet';

  return (
    <header className="bg-purple-900 text-white border-b border-gray-700 flex-shrink-0">
      <div className="px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">TrustGuard</h1>
            <p className="text-xs text-gray-400 leading-tight">AI Trust & Safety Auditing Platform</p>
          </div>
        </div>

        {/* Live status badge */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full ${badgeStyle}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyle}`} />
          <span className="text-xs font-medium truncate max-w-xs">{badgeText}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-700">
            <span className="text-sm text-gray-300">Lyon Zhang</span>
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-xs font-semibold">
              LZ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;