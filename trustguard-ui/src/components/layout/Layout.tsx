import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import { useUIStore } from '../../store/uiStore';

const Layout = () => {
  const { leftSidebarOpen, rightPanelOpen, toggleLeftSidebar, toggleRightPanel } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <aside
          className={`
            bg-white border-r border-gray-200 transition-all duration-300
            ${leftSidebarOpen ? 'w-64' : 'w-0'}
            overflow-hidden
          `}
        >
          <LeftSidebar />
        </aside>

        {/* Toggle Left Button */}
        <button
          onClick={toggleLeftSidebar}
          className="absolute top-4 left-0 z-10 bg-white border border-gray-200 rounded-r-lg p-1.5 hover:bg-gray-50 shadow-sm"
          aria-label={leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {leftSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Middle Content */}
        <main className="flex-1 overflow-hidden">
          <MainContent />
        </main>

        {/* Right Panel */}
        <aside
          className={`
            bg-white border-l border-gray-200 transition-all duration-300
            ${rightPanelOpen ? 'w-96' : 'w-0'}
            overflow-hidden
          `}
        >
          <RightPanel />
        </aside>

        {/* Toggle Right Button (when closed) */}
        {!rightPanelOpen && (
          <button
            onClick={toggleRightPanel}
            className="absolute top-4 right-0 z-10 bg-white border border-gray-200 rounded-l-lg p-1.5 hover:bg-gray-50 shadow-sm"
            aria-label="Open report panel"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;
