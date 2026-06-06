import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { articleApi, categoryApi, tagApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'
import EmptyState from '@/components/common/EmptyState'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article, Category, Tag } from '@/types/api'
import { getCategoryMeta, sortCategories } from '@/utils/categories'

const PAGE_SIZE = 10

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  const tagId = searchParams.get('tag') ? Number(searchParams.get('tag')) : undefined
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest'
  const keyword = searchParams.get('q')?.trim() || ''
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const sortedCategories = sortCategories(categories)
  const activeCategory = sortedCategories.find((c) => c.id === categoryId)
  const activeTag = tags.find((t) => t.id === tagId)
  const hasMore = articles.length < total

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
    tagApi.list().then(setTags).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
  }, [categoryId, tagId, sort, keyword])

  useEffect(() => {
    const isFirstPage = page === 1
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)

    const fetch = keyword
      ? articleApi.search(keyword, page, PAGE_SIZE)
      : articleApi.list(page, PAGE_SIZE, categoryId, tagId, sort)

    fetch
      .then((res) => {
        setTotal(res.total)
        setArticles((prev) => (isFirstPage ? res.records : [...prev, ...res.records]))
      })
      .catch(() => {
        if (isFirstPage) setArticles([])
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [page, categoryId, tagId, sort, keyword])

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
  }

  const pageTitle = keyword
    ? `${zh.search.title}：${keyword}`
    : activeTag
      ? `${activeTag.name}`
      : activeCategory
        ? activeCategory.name
        : sort === 'popular'
          ? zh.sidebar.popular
          : zh.articles.title

  return (
    <>
      <PageMeta title={pageTitle} description="浏览 iume atelier 全部技术文章" />

      <section className="page-container py-10 lg:py-14">
        <BlogShell>
          {keyword && (
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <h1 className="section-title !mb-0 text-2xl">{pageTitle}</h1>
              <button type="button" onClick={clearSearch} className="text-sm text-secondary hover:text-accent cursor-pointer transition-colors">
                清除搜索，查看全部
              </button>
            </div>
          )}

          {!keyword && (
            <div className="mb-8 flex flex-wrap gap-2 lg:hidden">
              <Link to="/articles?sort=latest" className={`sidebar-tag cursor-pointer ${sort === 'latest' && !tagId ? 'sidebar-tag--active' : ''}`}>{zh.sidebar.latest}</Link>
              <Link to="/articles?sort=popular" className={`sidebar-tag cursor-pointer ${sort === 'popular' && !tagId ? 'sidebar-tag--active' : ''}`}>{zh.sidebar.popular}</Link>
              {tags.map((t) => (
                <Link key={t.id} to={`/articles?tag=${t.id}`} className={`sidebar-tag cursor-pointer ${tagId === t.id ? 'sidebar-tag--active' : ''}`}>{t.name}</Link>
              ))}
            </div>
          )}

          {!keyword && sortedCategories.length > 0 && (
            <div className="mb-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary">{zh.articles.categoryFilter}</p>
              <div className="flex flex-wrap gap-2.5">
                <Link to="/articles" className={`category-pill ${!categoryId && !tagId && sort === 'latest' ? 'category-pill--active' : ''}`}>
                  {zh.articles.all}
                </Link>
                {sortedCategories.map((c) => {
                  const meta = getCategoryMeta(c.slug)
                  return (
                    <Link
                      key={c.id}
                      to={`/articles?category=${c.id}`}
                      className={`category-pill category-pill--${c.slug} ${categoryId === c.id ? 'category-pill--active' : ''}`}
                      title={c.description || meta.hint}
                    >
                      <span className="category-pill__icon" aria-hidden="true">{meta.icon}</span>
                      {c.name}
                    </Link>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-secondary">{zh.articles.categoryHint}</p>
            </div>
          )}

          {loading ? (
            <ArticleListSkeleton count={5} />
          ) : articles.length === 0 ? (
            <EmptyState
              title={keyword ? zh.search.noResults : zh.articles.empty}
              description={keyword ? undefined : zh.home.subtitle}
              actionLabel={zh.notFound.backHome}
              actionTo="/"
            />
          ) : (
            <>
              <div className="article-list article-list--wide">
                {articles.map((a, i) => (
                  <ArticleCard key={a.id} article={a} index={i} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loadingMore}
                    className="btn-secondary cursor-pointer"
                  >
                    {loadingMore ? zh.articles.loadingMore : zh.articles.loadMore}
                  </button>
                </div>
              )}
              <p className="mt-4 text-center text-sm text-secondary">
                {zh.articles.showingCount(articles.length, total)}
              </p>
            </>
          )}
        </BlogShell>
      </section>
    </>
  )
}
