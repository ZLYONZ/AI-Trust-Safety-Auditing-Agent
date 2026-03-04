import { Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-purple text-white border-b border-purple-light">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TrustGuard</h1>
            <p className="text-xs text-gray-300">AI Trust & Safety Auditing Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">Lyon Zhang</span>
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-sm font-semibold">
            LZ
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
