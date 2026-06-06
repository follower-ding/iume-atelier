import { CloudRain } from 'lucide-react'
import { useEffect } from 'react'
import { useAmbientStore } from '@/store'
import { ambientNoise } from '@/utils/ambientNoise'
import { zh } from '@/locales/zh'

export default function AmbientSoundToggle() {
  const { ambientOn, toggleAmbient } = useAmbientStore()

  useEffect(() => {
    if (ambientOn) ambientNoise.start(0.035)
    return () => ambientNoise.stop()
  }, [ambientOn])

  return (
    <button
      type="button"
      onClick={toggleAmbient}
      className={`ambient-toggle click-particles-ignore ${ambientOn ? 'ambient-toggle--on' : ''}`}
      aria-label={ambientOn ? zh.ambient.off : zh.ambient.on}
    >
      <CloudRain size={16} />
      <span>{ambientOn ? zh.ambient.playing : zh.ambient.label}</span>
    </button>
  )
}
