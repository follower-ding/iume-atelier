import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { articleApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'
import EmptyState from '@/components/common/EmptyState'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

const PAGE_SIZE = 10

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const query = searchParams.get('q')?.trim() || ''
  const [input, setInput] = useState(query)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const hasMore = articles.length < total

  useEffect(() => {
    setInput(query)
    setPage(1)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query) {
      setArticles([])
      setTotal(0)
      setLoading(false)
      return
    }

    const isFirstPage = page === 1
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)

    articleApi.search(query, page, PAGE_SIZE)
      .then((res) => {
        setTotal(res.total)
        setArticles((prev) => (isFirstPage ? res.records : [...prev, ...res.records]))
      })
      .catch(() => {
        if (isFirstPage) {
          setArticles([])
          setTotal(0)
        }
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [query, page])

  const submitSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setSearchParams({})
      return
    }
    setSearchParams({ q: trimmed })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch(input)
  }

  return (
    <>
      <PageMeta
        title={query ? `${zh.search.title}：${query}` : zh.search.title}
        description={zh.search.pageDescription}
      />

      <section className="page-container py-10 lg:py-14">
        <BlogShell>
          <div className="mb-10 max-w-2xl">
            <h1 className="section-title text-2xl lg:text-3xl">{zh.search.title}</h1>
            <p className="mt-2 text-sm text-secondary">{zh.search.pageSubtitle}</p>

            <form onSubmit={handleSubmit} className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
              <input
                ref={inputRef}
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={zh.search.placeholder}
                className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-accent/15"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              />
            </form>
          </div>

          {!query && (
            <EmptyState
              title={zh.search.emptyPrompt}
              description={zh.search.pageSubtitle}
              actionLabel={zh.nav.articles}
              actionTo="/articles"
            />
          )}

          {query && loading && <ArticleListSkeleton count={4} />}

          {query && !loading && articles.length === 0 && (
            <EmptyState
              title={zh.search.noResults}
              description={zh.search.noResultsHint}
              actionLabel={zh.notFound.backHome}
              actionTo="/"
            />
          )}

          {query && !loading && articles.length > 0 && (
            <>
              <p className="mb-6 text-sm text-secondary">
                {zh.search.resultCount(total, query)}
              </p>
              <div className="article-list article-list--wide">
                {articles.map((a, i) => (
                  <ArticleCard key={a.id} article={a} index={i} highlightQuery={query} />
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

          {query && (
            <p className="mt-8 text-center text-sm text-secondary">
              <Link to="/articles" className="text-accent cursor-pointer hover:underline">
                {zh.search.browseAll}
              </Link>
            </p>
          )}
        </BlogShell>
      </section>
    </>
  )
}
