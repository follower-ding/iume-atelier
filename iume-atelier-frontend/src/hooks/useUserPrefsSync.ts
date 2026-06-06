import { useEffect } from 'react'
import { userApi } from '@/api'
import { useAuthStore } from '@/store'
import { hydrateUserPrefsFromCloud } from '@/utils/syncUserPrefs'

export function useUserPrefsSync() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  useEffect(() => {
    if (!initialized || !user) return
    userApi
      .getPreferences()
      .then(hydrateUserPrefsFromCloud)
      .catch(() => {})
  }, [initialized, user?.id])
}
