import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import { useUIStore } from '../../store/uiStore';

const Layout = () => {
  const { leftSidebarOpen, rightPanelOpen, toggleLeftSidebar, toggleRightPanel } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex overflow-hidden bg-white">

        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <aside
          className={`
            bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 relative
            ${leftSidebarOpen ? 'w-60' : 'w-0'}
            overflow-hidden
          `}
        >
          <LeftSidebar />
        </aside>

        {/* Left toggle — floats just outside the sidebar edge */}
        <div className="relative flex-shrink-0 flex items-start pt-3">
          <button
            onClick={toggleLeftSidebar}
            className="bg-white border border-gray-200 rounded-r-md p-1.5 hover:bg-gray-50 shadow-sm z-20"
            aria-label={leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {leftSidebarOpen
              ? <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            }
          </button>
        </div>

        {/* ── Main Chat ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden min-w-0">
          <MainContent />
        </main>

        {/* Right toggle — floats just inside the right edge when panel is closed */}
        {!rightPanelOpen && (
          <div className="relative flex-shrink-0 flex items-start pt-3">
            <button
              onClick={toggleRightPanel}
              className="bg-white border border-gray-200 rounded-l-md p-1.5 hover:bg-gray-50 shadow-sm z-20"
              aria-label="Open report panel"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        )}

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <aside
          className={`
            bg-white border-l border-gray-200 transition-all duration-300 flex-shrink-0
            ${rightPanelOpen ? 'w-[340px]' : 'w-0'}
            overflow-hidden
          `}
        >
          <RightPanel />
        </aside>

      </div>
    </div>
  );
};

export default Layout;