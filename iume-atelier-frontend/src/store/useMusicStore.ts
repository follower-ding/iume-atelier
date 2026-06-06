import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RepeatMode = 'off' | 'all' | 'one'

interface MusicState {
  trackIndex: number
  playing: boolean
  volume: number
  expanded: boolean
  currentTime: number
  duration: number
  seekTarget: number | null
  shuffle: boolean
  repeat: RepeatMode
  hiddenTrackIds: string[]
  setTrackIndex: (index: number) => void
  setPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setExpanded: (expanded: boolean) => void
  setPlaybackProgress: (currentTime: number, duration: number) => void
  requestSeek: (time: number) => void
  clearSeek: () => void
  togglePlaying: () => void
  toggleExpanded: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  hideTrack: (id: string) => void
  clampTrackIndex: (total: number) => void
  goNext: (total: number) => void
  goPrev: (total: number) => void
  onTrackEnded: (total: number) => 'replay' | 'stop' | 'advance'
}

function pickShuffleIndex(current: number, total: number) {
  if (total <= 1) return current
  let next = current
  while (next === current) next = Math.floor(Math.random() * total)
  return next
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      trackIndex: 0,
      playing: false,
      volume: 0.45,
      expanded: false,
      currentTime: 0,
      duration: 0,
      seekTarget: null,
      shuffle: false,
      repeat: 'off',
      hiddenTrackIds: [],
      setTrackIndex: (trackIndex) => set({ trackIndex }),
      setPlaying: (playing) => set({ playing }),
      setVolume: (volume) => set({ volume }),
      setExpanded: (expanded) => set({ expanded }),
      setPlaybackProgress: (currentTime, duration) => set({ currentTime, duration }),
      requestSeek: (time) => set({ seekTarget: time }),
      clearSeek: () => set({ seekTarget: null }),
      togglePlaying: () => set({ playing: !get().playing }),
      toggleExpanded: () => set({ expanded: !get().expanded }),
      toggleShuffle: () => set({ shuffle: !get().shuffle }),
      cycleRepeat: () => {
        const order: RepeatMode[] = ['off', 'all', 'one']
        const i = order.indexOf(get().repeat)
        set({ repeat: order[(i + 1) % order.length] })
      },
      hideTrack: (id) => {
        const hidden = get().hiddenTrackIds
        if (hidden.includes(id)) return
        set({ hiddenTrackIds: [...hidden, id] })
      },
      clampTrackIndex: (total) => {
        if (total <= 0) return
        const { trackIndex } = get()
        if (trackIndex >= total) set({ trackIndex: total - 1 })
      },
      goNext: (total) => {
        if (total <= 0) return
        const { trackIndex, shuffle } = get()
        if (shuffle && total > 1) {
          set({ trackIndex: pickShuffleIndex(trackIndex, total) })
          return
        }
        set({ trackIndex: trackIndex >= total - 1 ? 0 : trackIndex + 1 })
      },
      goPrev: (total) => {
        if (total <= 0) return
        const { trackIndex, shuffle } = get()
        if (shuffle && total > 1) {
          set({ trackIndex: pickShuffleIndex(trackIndex, total) })
          return
        }
        set({ trackIndex: trackIndex <= 0 ? total - 1 : trackIndex - 1 })
      },
      onTrackEnded: (total) => {
        if (total <= 0) return 'stop'
        const { trackIndex, repeat, shuffle } = get()
        if (repeat === 'one') return 'replay'
        if (trackIndex >= total - 1 && repeat === 'off') {
          set({ playing: false })
          return 'stop'
        }
        if (shuffle && total > 1) {
          set({ trackIndex: pickShuffleIndex(trackIndex, total) })
        } else if (trackIndex >= total - 1) {
          set({ trackIndex: 0 })
        } else {
          set({ trackIndex: trackIndex + 1 })
        }
        return 'advance'
      },
    }),
    {
      name: 'iume-music',
      partialize: (state) => ({
        trackIndex: state.trackIndex,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        hiddenTrackIds: state.hiddenTrackIds,
      }),
    },
  ),
)
