import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articleApi, categoryApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import HeroBanner from '@/components/common/HeroBanner'
import GradientText from '@/components/interactive/GradientText'
import TypewriterText from '@/components/interactive/TypewriterText'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article, Category } from '@/types/api'
import { getCategoryMeta, sortCategories } from '@/utils/categories'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
    articleApi.list(1, 7).then((res) => {
      setArticles(res.records)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const featured = articles[0]
  const rest = articles.slice(1, 4)
  const gridRest = articles.slice(4)

  return (
    <>
      <PageMeta title={zh.siteName} description={zh.home.subtitle} />

      <HeroBanner decorative>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent animate-fade-up">{zh.home.label}</p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-balance animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <TypewriterText text={zh.home.title} speed={70} />
          <GradientText as="span" className="block mt-2">
            <TypewriterText text={zh.home.titleAccent} speed={80} delay={1200} />
          </GradientText>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-secondary animate-fade-up" style={{ animationDelay: '0.16s' }}>
          {zh.home.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.24s' }}>
          <Link to="/about" className="btn-secondary cursor-pointer text-sm btn-magnetic">{zh.nav.about}</Link>
          <Link to="/projects" className="btn-primary cursor-pointer text-sm btn-magnetic">{zh.nav.projects}</Link>
        </div>
      </HeroBanner>

      <section className="page-container py-12 lg:py-16">
        <BlogShell>
          {categories.length > 0 && (
            <div className="mb-12">
              <h2 className="section-title">{zh.home.browseCategories}</h2>
              <p className="mb-4 text-sm text-secondary">{zh.home.categoryHint}</p>
              <div className="flex flex-wrap gap-2.5">
                {sortCategories(categories).map((c) => {
                  const meta = getCategoryMeta(c.slug)
                  return (
                    <Link
                      key={c.id}
                      to={`/articles?category=${c.id}`}
                      className={`category-pill category-pill--${c.slug}`}
                      title={c.description || meta.hint}
                    >
                      <span className="category-pill__icon" aria-hidden="true">{meta.icon}</span>
                      {c.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <h2 className="section-title">{zh.home.latestArticles}</h2>

          {loading ? (
            <ArticleListSkeleton count={4} />
          ) : (
            <>
              <div className="article-list article-list--wide mb-10">
                {featured && <ArticleCard article={featured} featured index={0} />}
                {rest.map((a, i) => (
                  <ArticleCard key={a.id} article={a} index={i + 1} />
                ))}
              </div>

              {gridRest.length > 0 && (
                <div className="article-grid">
                  {gridRest.map((a, i) => (
                    <ArticleCard key={a.id} article={a} layout="grid" index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-12 flex justify-center">
            <Link to="/articles" className="btn-secondary cursor-pointer">{zh.home.viewAll}</Link>
          </div>
        </BlogShell>
      </section>
    </>
  )
}
