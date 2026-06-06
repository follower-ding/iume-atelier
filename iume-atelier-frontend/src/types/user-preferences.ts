import type { CustomMusicTrack } from '@/store/useUserPrefsStore'

export interface UserPreferences {
  companionCallName: string
  customQuotes: string[]
  customTracks: CustomMusicTrack[]
}
