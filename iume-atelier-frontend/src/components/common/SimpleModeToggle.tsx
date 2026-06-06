import { Sparkles } from 'lucide-react'
import { useSimpleModeStore } from '@/store'
import { zh } from '@/locales/zh'

interface SimpleModeToggleProps {
  showLabel?: boolean
}

export default function SimpleModeToggle({ showLabel }: SimpleModeToggleProps) {
  const { simpleMode, toggle } = useSimpleModeStore()

  return (
    <button
      type="button"
      onClick={toggle}
      className={`simple-mode-toggle cursor-pointer ${simpleMode ? 'simple-mode-toggle--on' : ''}`}
      aria-pressed={simpleMode}
      title={simpleMode ? zh.simpleMode.on : zh.simpleMode.off}
    >
      <Sparkles size={15} />
      {showLabel && <span>{simpleMode ? zh.simpleMode.on : zh.simpleMode.off}</span>}
    </button>
  )
}
