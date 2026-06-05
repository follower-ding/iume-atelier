import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { articleApi, categoryApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article, Category } from '@/types/api'

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  const keyword = searchParams.get('q')?.trim() || ''
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const fetch = keyword
      ? articleApi.search(keyword, 1, 30)
      : articleApi.list(1, 20, categoryId)

    fetch.then((res) => {
      setArticles(res.records)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [categoryId, keyword])

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
  }

  return (
    <>
      <PageMeta title={keyword ? `搜索：${keyword}` : zh.articles.title} description="浏览 iume atelier 全部技术文章" />
      <section className="page-container py-10 lg:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl">
            {keyword ? (
              <>搜索结果：<span className="text-accent">{keyword}</span></>
            ) : (
              zh.articles.title
            )}
          </h1>
          {keyword && (
            <button type="button" onClick={clearSearch} className="mt-2 text-sm text-zinc-500 hover:text-accent cursor-pointer transition-colors">
              清除搜索，查看全部
            </button>
          )}
        </div>

        {!keyword && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors ${!categoryId ? 'bg-accent text-white shadow-sm' : 'border border-zinc-300 dark:border-zinc-700 hover:border-accent'}`}
            >
              {zh.articles.all}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSearchParams({ category: String(c.id) })}
                className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors ${categoryId === c.id ? 'bg-accent text-white shadow-sm' : 'border border-zinc-300 dark:border-zinc-700 hover:border-accent'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-zinc-500">{zh.articles.loading}</p>
        ) : articles.length === 0 ? (
          <p className="text-zinc-500 py-12 text-center">{keyword ? zh.search.noResults : '暂无文章'}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
