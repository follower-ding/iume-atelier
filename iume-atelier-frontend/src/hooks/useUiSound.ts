import { useCallback } from 'react'
import { useSoundStore } from '@/store'
import { uiSound } from '@/utils/sound'

type SoundKey = keyof typeof uiSound

export function useUiSound() {
  const enabled = useSoundStore((s) => s.enabled)

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      uiSound[key]()
    },
    [enabled],
  )

  return { play, enabled }
}
