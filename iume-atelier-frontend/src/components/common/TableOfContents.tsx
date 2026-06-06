import clsx from 'clsx'
import { zh } from '@/locales/zh'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
  activeId?: string
}

export default function TableOfContents({ items, activeId }: TableOfContentsProps) {
  if (items.length === 0) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label="Table of contents" className="article-toc">
      <p className="article-toc__label">{zh.toc}</p>
      <ul className="article-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={clsx(
                'article-toc__link cursor-pointer',
                item.level === 3 && 'article-toc__link--sub',
                activeId === item.id && 'article-toc__link--active',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function extractTocFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
      items.push({ id, text, level })
    }
  }
  return items
}
