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

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {zh.toc}
      </p>
      <ul className="space-y-2 border-l border-zinc-200 dark:border-zinc-700">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={clsx(
                'block border-l-2 py-1 pl-4 text-sm transition-colors duration-200 cursor-pointer',
                item.level === 3 && 'pl-6',
                activeId === item.id
                  ? 'border-accent text-accent font-medium'
                  : 'border-transparent text-zinc-500 hover:text-ink dark:hover:text-white'
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
