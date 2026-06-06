import { useEffect, useRef, useState } from 'react'
import { burstAt } from '@/utils/burstParticles'
import { zh } from '@/locales/zh'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false)
  const stepRef = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === SEQUENCE[stepRef.current]) {
        stepRef.current += 1
        if (stepRef.current === SEQUENCE.length) {
          stepRef.current = 0
          setActive(true)
          burstAt(window.innerWidth / 2, window.innerHeight / 2, 48, true)
          setTimeout(() => setActive(false), 4200)
        }
      } else {
        stepRef.current = key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!active) return null

  return (
    <div className="konami-overlay" role="alert">
      <div className="konami-overlay__card animate-fade-up">
        <p className="konami-overlay__emoji">✨🎮✨</p>
        <p className="konami-overlay__title">{zh.easterEgg.title}</p>
        <p className="konami-overlay__body">{zh.easterEgg.body}</p>
      </div>
    </div>
  )
}
