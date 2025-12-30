import { create } from 'zustand'

interface UIStore {
  // ============================================================
  // Drag State (Visual Feedback Only)
  // ============================================================
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void

  // ============================================================
  // Dock Error State (For Toast)
  // ============================================================
  dockError: string | null
  setDockError: (error: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Drag state
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),

  // Error state (ephemeral)
  dockError: null,
  setDockError: (error) => set({ dockError: error }),
}))
