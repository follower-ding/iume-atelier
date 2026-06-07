import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { articleApi, commentApi } from '@/api'
import CommentThread from '@/components/business/CommentThread'
import RelatedArticles from '@/components/business/RelatedArticles'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'
import EmptyState from '@/components/common/EmptyState'
import HeroBanner from '@/components/common/HeroBanner'
import ReadingProgress from '@/components/common/ReadingProgress'
import TableOfContents, { extractTocFromMarkdown } from '@/components/common/TableOfContents'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'
import ShareCardGenerator from '@/components/interactive/ShareCardGenerator'
import { useActiveTocItem } from '@/hooks/useActiveTocItem'
import PageMeta from '@/components/seo/PageMeta'
import { estimateReadingTime, formatReadingTime } from '@/utils/readingTime'
import { zh } from '@/locales/zh'
import type { Article, Comment } from '@/types/api'

function formatDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    articleApi
      .getBySlug(slug)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [slug])

  const refreshComments = useCallback(() => {
    if (!article?.id) return
    commentApi.list(article.id).then(setComments).catch(() => {})
  }, [article?.id])

  useEffect(() => {
    refreshComments()
  }, [refreshComments])

  const toc = article ? extractTocFromMarkdown(article.content) : []
  const tocIds = toc.map((t) => t.id)
  const activeTocId = useActiveTocItem(tocIds)
  const readMinutes = article ? estimateReadingTime(article.content) : 0

  if (loading) {
    return (
      <section className="page-container py-16">
        <ArticleListSkeleton count={1} />
      </section>
    )
  }

  if (!article) {
    return (
      <section className="page-container py-24">
        <EmptyState
          title={zh.article.notFound}
          description={zh.notFound.description}
          actionLabel={zh.notFound.backHome}
          actionTo="/articles"
        />
      </section>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    author: { '@type': 'Person', name: article.authorName },
    datePublished: article.publishedAt,
    image: article.coverImage
      ? (article.coverImage.startsWith('http') ? article.coverImage : `${window.location.origin}${article.coverImage}`)
      : undefined,
  }

  return (
    <>
      <ReadingProgress />
      {article.status === 'DRAFT' && (
        <div className="draft-banner" role="status">
          {zh.article.draftPreview}
        </div>
      )}
      <PageMeta
        title={article.title}
        description={article.summary?.slice(0, 160)}
        image={article.coverImage}
        type="article"
        publishedTime={article.publishedAt}
        author={article.authorName}
        jsonLd={jsonLd}
      />

      <HeroBanner compact>
        <h1 className="mx-auto max-w-3xl font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight text-balance">
          {article.title}
        </h1>
        {article.summary && (
          <p className="mx-auto mt-5 max-w-2xl text-lg sm:text-xl leading-relaxed text-secondary">
            {article.summary}
          </p>
        )}
        <div className="meta-line mt-6 space-y-1">
          {article.categoryName && (
            <p>
              {zh.article.filedUnder}{' '}
              <Link to={`/articles?category=${article.categoryId}`} className="prose-link cursor-pointer">
                {article.categoryName}
              </Link>
              {article.publishedAt && (
                <> {zh.article.onDate} {formatDate(article.publishedAt)}</>
              )}
            </p>
          )}
          {article.seriesSlug && article.seriesTitle && (
            <p>
              {zh.series.partOf}{' '}
              <Link to={`/series/${article.seriesSlug}`} className="prose-link cursor-pointer">
                {article.seriesTitle}
              </Link>
            </p>
          )}
          <p>
            {article.authorName && (
              <>
                <Link to={`/authors/${article.authorId}`} className="prose-link cursor-pointer">{article.authorName}</Link>
                {' · '}
              </>
            )}
            {article.viewCount} {zh.article.reads}
            {' · '}
            <span className="text-accent">{formatReadingTime(readMinutes)}</span>
          </p>
          {article.tags?.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-secondary">{zh.article.tags}:</span>
              {article.tags.map((t) => (
                <Link
                  key={t.id}
                  to={`/articles?tag=${t.id}`}
                  className="rounded-full border border-zinc-300 dark:border-zinc-600 px-2.5 py-0.5 text-xs hover:border-accent hover:text-accent cursor-pointer transition-colors"
                >
                  {t.name}
                </Link>
              ))}
            </p>
          )}
        </div>
        <ShareCardGenerator
          title={article.title}
          summary={article.summary}
          author={article.authorName}
          slug={article.slug}
          coverImage={article.coverImage}
        />
      </HeroBanner>

      <article className="page-container py-12 lg:py-16">
        {toc.length > 0 && (
          <nav className="article-toc-mobile lg:hidden" aria-label="Table of contents">
            <p className="article-toc__label">{zh.toc}</p>
            <div className="article-toc-mobile__scroll">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`article-toc-mobile__chip${activeTocId === item.id ? ' article-toc-mobile__chip--active' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="article-layout">
          <div className="article-layout__main">
            <div className="article-prose">
              <MarkdownRenderer content={article.content} />
            </div>

            <RelatedArticles
              articleId={article.id}
              categoryId={article.categoryId}
              tagId={article.tags?.[0]?.id}
            />

            <div className="mt-16 pt-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <CommentThread
                comments={comments}
                articleId={article.id}
                onRefresh={refreshComments}
              />
            </div>
          </div>

          {toc.length > 0 && (
            <aside className="article-layout__aside hidden lg:block">
              <TableOfContents items={toc} activeId={activeTocId} />
            </aside>
          )}
        </div>
      </article>
    </>
  )
}
