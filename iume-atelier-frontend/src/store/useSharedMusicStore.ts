import { create } from 'zustand'
import { sharedMusicApi, type SharedMusicTrack } from '@/api'

interface SharedMusicState {
  tracks: SharedMusicTrack[]
  loaded: boolean
  fetch: () => Promise<void>
  setTracks: (tracks: SharedMusicTrack[]) => void
  upsertTrack: (track: SharedMusicTrack) => void
  removeById: (id: number) => void
}

export const useSharedMusicStore = create<SharedMusicState>((set, get) => ({
  tracks: [],
  loaded: false,
  fetch: async () => {
    const tracks = await sharedMusicApi.list()
    set({ tracks, loaded: true })
  },
  setTracks: (tracks) => set({ tracks, loaded: true }),
  upsertTrack: (track) => {
    const prev = get().tracks
    const idx = prev.findIndex((t) => t.id === track.id)
    if (idx >= 0) {
      const next = [...prev]
      next[idx] = track
      set({ tracks: next })
    } else {
      set({ tracks: [...prev, track] })
    }
  },
  removeById: (id) => set({ tracks: get().tracks.filter((t) => t.id !== id) }),
}))
