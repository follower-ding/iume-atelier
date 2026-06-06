import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomMusicTrack {
  id: string
  title: string
  artist: string
  src: string
  cover?: string
  createdAt: string
}

interface UserPrefsState {
  companionCallName: string
  customQuotes: string[]
  customTracks: CustomMusicTrack[]
  setCompanionCallName: (name: string) => void
  setCustomQuotes: (quotes: string[]) => void
  hydrateFromCloud: (data: {
    companionCallName?: string
    customQuotes?: string[]
    customTracks?: CustomMusicTrack[]
  }) => void
  addCustomTrack: (track: CustomMusicTrack) => void
  updateCustomTrack: (id: string, patch: Partial<Pick<CustomMusicTrack, 'title' | 'artist' | 'cover'>>) => void
  removeCustomTrack: (id: string) => void
}

export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set, get) => ({
      companionCallName: '',
      customQuotes: [],
      customTracks: [],
      setCompanionCallName: (companionCallName) => set({ companionCallName }),
      setCustomQuotes: (customQuotes) => set({ customQuotes }),
      hydrateFromCloud: (data) =>
        set({
          companionCallName: data.companionCallName ?? '',
          customQuotes: data.customQuotes ?? [],
          customTracks: data.customTracks ?? [],
        }),
      addCustomTrack: (track) => set({ customTracks: [track, ...get().customTracks] }),
      updateCustomTrack: (id, patch) =>
        set({
          customTracks: get().customTracks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      removeCustomTrack: (id) =>
        set({ customTracks: get().customTracks.filter((t) => t.id !== id) }),
    }),
    {
      name: 'iume-user-prefs',
      partialize: (state) => ({
        companionCallName: state.companionCallName,
        customQuotes: state.customQuotes,
        customTracks: state.customTracks,
      }),
    },
  ),
)
