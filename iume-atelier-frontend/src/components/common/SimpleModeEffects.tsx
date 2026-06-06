import { useEffect } from 'react'
import { useSimpleModeStore } from '@/store'

export default function SimpleModeEffects() {
  const simpleMode = useSimpleModeStore((s) => s.simpleMode)

  useEffect(() => {
    document.documentElement.classList.toggle('simple-mode', simpleMode)
  }, [simpleMode])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (mq.matches) document.documentElement.classList.add('simple-mode')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return null
}
