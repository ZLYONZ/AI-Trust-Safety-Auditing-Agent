import { Shield, Bell, Settings } from 'lucide-react';

const Header = () => {
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

        {/* Center badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-900/40 border border-yellow-700/50 rounded-full">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs text-yellow-300 font-medium">TTMT Audit · ESCALATE · 85.5/100</span>
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