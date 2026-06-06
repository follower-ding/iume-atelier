import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CursorStyle = 'ring' | 'minimal' | 'ink' | 'caret' | 'orbit'

interface CursorStyleState {
  style: CursorStyle
  setStyle: (style: CursorStyle) => void
}

function applyCursorStyle(style: CursorStyle) {
  document.documentElement.dataset.cursorStyle = style
}

export const useCursorStyleStore = create<CursorStyleState>()(
  persist(
    (set) => ({
      style: 'ring',
      setStyle: (style) => {
        applyCursorStyle(style)
        set({ style })
      },
    }),
    {
      name: 'iume-cursor-style',
      onRehydrateStorage: () => (state) => {
        if (state) applyCursorStyle(state.style)
      },
    },
  ),
)
