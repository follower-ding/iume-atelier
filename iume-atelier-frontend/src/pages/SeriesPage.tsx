import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { seriesApi, type Series } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    seriesApi.getBySlug(slug)
      .then(setSeries)
      .catch(() => setSeries(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div className="page-container py-20 text-center text-secondary">{zh.articles.loading}</div>
  }

  if (!series) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="section-title">{zh.notFound.title}</h1>
        <Link to="/series" className="btn-secondary mt-6 inline-block cursor-pointer">{zh.series.backToList}</Link>
      </div>
    )
  }

  const articles = series.articles || []

  return (
    <>
      <PageMeta title={series.title} description={series.description || zh.series.listSubtitle} />
      <section className="page-container py-10 lg:py-14">
        <BlogShell>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">{zh.series.label}</p>
          <h1 className="section-title">{series.title}</h1>
          {series.description && <p className="mt-3 mb-8 text-secondary max-w-2xl">{series.description}</p>}
          <div className="article-list article-list--wide">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
          {articles.length === 0 && <p className="text-secondary">{zh.series.emptyArticles}</p>}
          <p className="mt-10">
            <Link to="/series" className="text-accent cursor-pointer hover:underline">{zh.series.backToList}</Link>
          </p>
        </BlogShell>
      </section>
    </>
  )
}
