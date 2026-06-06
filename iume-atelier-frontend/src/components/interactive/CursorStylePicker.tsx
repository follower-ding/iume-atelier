import { useCursorStyleStore, type CursorStyle } from '@/store/useCursorStyleStore'
import { zh } from '@/locales/zh'

const OPTIONS: CursorStyle[] = ['ring', 'minimal', 'ink', 'caret', 'orbit']

export default function CursorStylePicker() {
  const style = useCursorStyleStore((s) => s.style)
  const setStyle = useCursorStyleStore((s) => s.setStyle)

  return (
    <div className="cursor-style-picker">
      <p className="settings-page__toggle-label">{zh.settings.cursorStyle}</p>
      <p className="settings-page__hint">{zh.settings.cursorStyleHint}</p>
      <div className="cursor-style-picker__grid" role="radiogroup" aria-label={zh.settings.cursorStyle}>
        {OPTIONS.map((id) => {
          const meta = zh.settings.cursorStyles[id]
          const selected = style === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`cursor-style-picker__card${selected ? ' cursor-style-picker__card--active' : ''}`}
              onClick={() => setStyle(id)}
            >
              <span className={`cursor-style-picker__preview cursor-style-picker__preview--${id}`} aria-hidden="true" />
              <span className="cursor-style-picker__name">{meta.name}</span>
              <span className="cursor-style-picker__desc">{meta.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
