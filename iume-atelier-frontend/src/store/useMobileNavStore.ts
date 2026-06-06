import { create } from 'zustand'

interface MobileNavUiState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useMobileNavStore = create<MobileNavUiState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}))
