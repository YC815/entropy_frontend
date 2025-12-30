import { create } from 'zustand'

interface UIStore {
  // ============================================================
  // Dock Error State (For Toast)
  // ============================================================
  dockError: string | null
  setDockError: (error: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Error state (ephemeral)
  dockError: null,
  setDockError: (error) => set({ dockError: error }),
}))
