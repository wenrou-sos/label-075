import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currentDepartment: string;
  setCurrentDepartment: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  currentDepartment: 'd1',
  setCurrentDepartment: (id) => set({ currentDepartment: id }),
}));
