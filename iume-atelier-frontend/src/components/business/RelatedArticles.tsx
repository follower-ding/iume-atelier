import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articleApi } from '@/api'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

interface RelatedArticlesProps {
  articleId: number
  categoryId?: number
  tagId?: number
}

export default function RelatedArticles({ articleId, categoryId, tagId }: RelatedArticlesProps) {
  const [related, setRelated] = useState<Article[]>([])

  useEffect(() => {
    if (!categoryId && !tagId) return

    const fetchRelated = async () => {
      try {
        let items: Article[] = []
        if (categoryId) {
          const res = await articleApi.list(1, 5, categoryId)
          items = res.records.filter((a) => a.id !== articleId)
        }
        if (items.length < 3 && tagId) {
          const res = await articleApi.list(1, 5, undefined, tagId)
          const extra = res.records.filter((a) => a.id !== articleId && !items.some((i) => i.id === a.id))
          items = [...items, ...extra]
        }
        setRelated(items.slice(0, 4))
      } catch {
        setRelated([])
      }
    }

    fetchRelated()
  }, [articleId, categoryId, tagId])

  if (related.length === 0) return null

  return (
    <section className="mt-16 max-w-prose pt-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <h2 className="font-display text-xl mb-5">{zh.article.related}</h2>
      <ul className="space-y-3">
        {related.map((a) => (
          <li key={a.id}>
            <Link to={`/article/${a.slug}`} className="group block cursor-pointer">
              <span className="font-medium group-hover:text-accent transition-colors">{a.title}</span>
              {a.summary && (
                <p className="mt-1 text-sm text-secondary line-clamp-2">{a.summary}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
