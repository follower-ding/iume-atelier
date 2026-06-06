import { useState } from 'react'
import { useUiSound } from '@/hooks/useUiSound'

const KEYS = ['Q', 'W', 'E', 'R'] as const

export default function KeyCaps() {
  const [pressed, setPressed] = useState<string | null>(null)
  const { play } = useUiSound()

  const handlePress = (key: string) => {
    setPressed(key)
    play('click')
    window.setTimeout(() => setPressed(null), 180)
  }

  return (
    <div className="key-caps" role="group" aria-label="Interactive keyboard">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`key-cap${pressed === key ? ' key-cap--pressed' : ''}`}
          onClick={() => handlePress(key)}
          onMouseEnter={() => play('hover')}
        >
          <span className="key-cap__label">{key}</span>
        </button>
      ))}
    </div>
  )
}
