import { useEffect } from 'react'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'

export function useSharedMusicSync() {
  const fetch = useSharedMusicStore((s) => s.fetch)

  useEffect(() => {
    fetch().catch(() => {})
  }, [fetch])
}
