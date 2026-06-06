import { useEffect } from 'react'
import { useUiSound } from '@/hooks/useUiSound'
import { burstAt, initParticleLoop } from '@/utils/burstParticles'

const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], .key-cap, .character-card, .nav-link'

export default function ClickParticles() {
  const { play } = useUiSound()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    initParticleLoop()

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(INTERACTIVE)) return
      if (target.closest('.click-particles-ignore')) return
      burstAt(e.clientX, e.clientY, 18, true)
      play('hover')
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [play])

  return null
}
