import { userApi } from '@/api'
import { useUserPrefsStore } from '@/store/useUserPrefsStore'
import type { UserPreferences } from '@/types/user-preferences'

export function getUserPrefsPayload(): UserPreferences {
  const { companionCallName, customQuotes, customTracks } = useUserPrefsStore.getState()
  return { companionCallName, customQuotes, customTracks }
}

export async function syncUserPrefsToCloud(): Promise<UserPreferences> {
  return userApi.updatePreferences(getUserPrefsPayload())
}

export function hydrateUserPrefsFromCloud(data: Partial<UserPreferences>) {
  useUserPrefsStore.getState().hydrateFromCloud({
    companionCallName: data.companionCallName ?? '',
    customQuotes: data.customQuotes ?? [],
    customTracks: data.customTracks ?? [],
  })
}
