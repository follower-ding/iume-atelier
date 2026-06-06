import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CompanionMood = 'idle' | 'happy' | 'writing' | 'reading'
export type CompanionDrawer = 'snippets' | 'music' | 'tools' | null

export interface CompanionPosition {
  x: number
  y: number
}

interface CompanionState {
  collapsed: boolean
  drawer: CompanionDrawer
  mood: CompanionMood
  quote: string | null
  position: CompanionPosition | null
  toggleCollapsed: () => void
  setDrawer: (drawer: CompanionDrawer) => void
  toggleDrawer: (drawer: Exclude<CompanionDrawer, null>) => void
  setMood: (mood: CompanionMood) => void
  showQuote: (text: string) => void
  clearQuote: () => void
  setPosition: (position: CompanionPosition) => void
  resetPosition: (position: CompanionPosition) => void
}

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      drawer: null,
      mood: 'idle',
      quote: null,
      position: null,
      toggleCollapsed: () => set({ collapsed: !get().collapsed, drawer: null }),
      setDrawer: (drawer) => set({ drawer, collapsed: false }),
      toggleDrawer: (drawer) => {
        const next = get().drawer === drawer ? null : drawer
        set({ drawer: next, collapsed: false })
      },
      setMood: (mood) => set({ mood }),
      showQuote: (text) => set({ quote: text, mood: 'happy' }),
      clearQuote: () => set({ quote: null, mood: 'idle' }),
      setPosition: (position) => set({ position }),
      resetPosition: (position) => set({ position }),
    }),
    {
      name: 'iume-companion-v3',
      partialize: (state) => ({ position: state.position }),
    },
  ),
)
