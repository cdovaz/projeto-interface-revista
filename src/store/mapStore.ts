import { create } from 'zustand';

export type ActiveScreen = 'navegar' | 'perfil' | 'posts' | 'configuracoes';

interface MapState {
  zoom: number; // 0.2 (Universo) até 2.0 (Post detalhado)
  pan: { x: number; y: number };
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  createModalOpen: boolean;
  activeScreen: ActiveScreen;
  
  // Actions
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCreateModalOpen: (open: boolean) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  resetView: () => void;
  focusOnCoordinates: (x: number, y: number, targetZoom?: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  zoom: 0.9,
  pan: { x: 0, y: 0 },
  theme: 'dark', // default cósmico
  sidebarOpen: true,
  createModalOpen: false,
  activeScreen: 'navegar',

  setZoom: (zoom) => set({ zoom: Math.max(0.15, Math.min(2.5, zoom)) }),
  setPan: (pan) => set({ pan }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: nextTheme };
  }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCreateModalOpen: (open) => set({ createModalOpen: open }),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  
  resetView: () => set({ zoom: 0.9, pan: { x: 0, y: 0 }, activeScreen: 'navegar' }),
  
  focusOnCoordinates: (x, y, targetZoom = 1.2) => {
    set({
      pan: { x: -x * targetZoom, y: -y * targetZoom },
      zoom: targetZoom,
      activeScreen: 'navegar'
    });
  }
}));
