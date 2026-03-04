import { create } from 'zustand';

interface UIStore {
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  currentAuditId: string | null;
  
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  openRightPanel: () => void;
  closeRightPanel: () => void;
  setCurrentAudit: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  leftSidebarOpen: true,
  rightPanelOpen: false,
  currentAuditId: null,

  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  
  openRightPanel: () =>
    set({ rightPanelOpen: true }),
  
  closeRightPanel: () =>
    set({ rightPanelOpen: false }),
  
  setCurrentAudit: (id) =>
    set({ currentAuditId: id, rightPanelOpen: id !== null }),
}));
