import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { seriesApi, type Series } from '@/api'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'

export default function SeriesListPage() {
  const [items, setItems] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seriesApi.list(1, 50)
      .then((res) => setItems(res.records))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageMeta title={zh.series.listTitle} description={zh.series.listSubtitle} />
      <section className="page-container py-10 lg:py-14">
        <BlogShell>
          <h1 className="section-title">{zh.series.listTitle}</h1>
          <p className="mt-2 mb-8 text-sm text-secondary">{zh.series.listSubtitle}</p>
          {loading ? (
            <p className="text-secondary">{zh.articles.loading}</p>
          ) : items.length === 0 ? (
            <p className="text-secondary">{zh.series.empty}</p>
          ) : (
            <div className="series-grid">
              {items.map((s) => (
                <Link key={s.id} to={`/series/${s.slug}`} className="series-card group cursor-pointer">
                  <h2 className="series-card__title">{s.title}</h2>
                  {s.description && <p className="series-card__desc line-clamp-2">{s.description}</p>}
                  <span className="series-card__meta">{zh.series.articleCount(s.articleCount ?? 0)}</span>
                </Link>
              ))}
            </div>
          )}
        </BlogShell>
      </section>
    </>
  )
}
