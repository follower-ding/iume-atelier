import { useEffect, useRef, type CSSProperties } from 'react'

interface ArticleSceneProps {
  categoryName?: string
  title: string
}

const THEMES: Record<string, { emoji: string; label: string }[]> = {
  default: [
    { emoji: '✦', label: 'spark' },
    { emoji: '◇', label: 'diamond' },
    { emoji: '○', label: 'ring' },
  ],
  code: [
    { emoji: '{', label: 'brace' },
    { emoji: '}', label: 'brace' },
    { emoji: '</>', label: 'tag' },
    { emoji: 'λ', label: 'lambda' },
  ],
  design: [
    { emoji: '◆', label: 'shape' },
    { emoji: '◎', label: 'target' },
    { emoji: '✿', label: 'flower' },
  ],
}

function pickTheme(category?: string) {
  const c = category?.toLowerCase() ?? ''
  if (c.includes('前端') || c.includes('react') || c.includes('代码') || c.includes('java')) return THEMES.code
  if (c.includes('设计') || c.includes('ui')) return THEMES.design
  return THEMES.default
}

export default function ArticleScene({ categoryName, title }: ArticleSceneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const items = pickTheme(categoryName)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--mx', String(x))
      el.style.setProperty('--my', String(y))
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <aside className="article-scene" ref={ref} aria-hidden="true">
      <div className="article-scene__panel">
        <p className="article-scene__label">{categoryName || 'Article'}</p>
        <p className="article-scene__title">{title.slice(0, 28)}{title.length > 28 ? '…' : ''}</p>
        <div className="article-scene__orbit">
          {items.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="article-scene__glyph"
              style={{ '--i': i } as CSSProperties}
            >
              {item.emoji}
            </span>
          ))}
          <span className="article-scene__core" />
        </div>
      </div>
    </aside>
  )
}
