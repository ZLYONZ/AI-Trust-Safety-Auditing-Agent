import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import { useUIStore } from '../../store/uiStore';

const Layout = () => {
  const { leftSidebarOpen, rightPanelOpen, toggleLeftSidebar, toggleRightPanel } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <aside
          className={`
            bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0
            ${leftSidebarOpen ? 'w-60' : 'w-0'}
            overflow-hidden
          `}
        >
          <LeftSidebar />
        </aside>

        {/* Toggle Left Button */}
        <button
          onClick={toggleLeftSidebar}
          className="absolute top-4 z-20 bg-white border border-gray-200 rounded-r-md p-1 hover:bg-gray-50 shadow-sm transition-all"
          style={{ left: leftSidebarOpen ? '240px' : '0px' }}
          aria-label={leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {leftSidebarOpen
            ? <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          }
        </button>

        {/* Main Chat */}
        <main className="flex-1 overflow-hidden min-w-0">
          <MainContent />
        </main>

        {/* Right Panel */}
        <aside
          className={`
            bg-white border-l border-gray-200 transition-all duration-300 flex-shrink-0
            ${rightPanelOpen ? 'w-[340px]' : 'w-0'}
            overflow-hidden
          `}
        >
          <RightPanel />
        </aside>

        {/* Toggle Right Button */}
        {!rightPanelOpen && (
          <button
            onClick={toggleRightPanel}
            className="absolute top-4 right-0 z-20 bg-white border border-gray-200 rounded-l-md p-1 hover:bg-gray-50 shadow-sm"
            aria-label="Open report panel"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;