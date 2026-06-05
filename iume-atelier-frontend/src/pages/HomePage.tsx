import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articleApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    articleApi.list(1, 7).then((res) => {
      setArticles(res.records)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <>
      <PageMeta title={zh.siteName} description={zh.home.subtitle} />
      <section className="page-container pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="mb-12 lg:mb-16 text-center md:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{zh.home.label}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.08] mb-6 tracking-tight">
            {zh.home.title}<br />
            <span className="italic text-accent">{zh.home.titleAccent}</span>
          </h1>
          <p className="max-w-2xl text-lg text-secondary dark:text-zinc-400 leading-relaxed">
            {zh.home.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500">{zh.home.loading}</div>
        ) : (
          <div className="space-y-8">
            {featured && <ArticleCard article={featured} featured />}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 text-center">
          <Link to="/articles" className="btn-secondary cursor-pointer inline-block">
            {zh.home.viewAll}
          </Link>
        </div>
      </section>
    </>
  )
}
