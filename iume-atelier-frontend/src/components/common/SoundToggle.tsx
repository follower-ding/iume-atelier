import { Volume2, VolumeX } from 'lucide-react'
import { useUiSound } from '@/hooks/useUiSound'
import { useSoundStore } from '@/store'
import { zh } from '@/locales/zh'

export default function SoundToggle() {
  const { enabled, toggle } = useSoundStore()
  const { play } = useUiSound()

  return (
    <button
      type="button"
      onClick={() => {
        play('click')
        toggle()
      }}
      aria-label={enabled ? zh.sound.mute : zh.sound.unmute}
      className="header-icon-btn cursor-pointer"
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  )
}
