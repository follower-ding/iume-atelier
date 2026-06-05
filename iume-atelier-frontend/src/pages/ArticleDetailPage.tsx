import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { articleApi, commentApi } from '@/api'
import ReadingProgress from '@/components/common/ReadingProgress'
import TableOfContents, { extractTocFromMarkdown } from '@/components/common/TableOfContents'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'
import PageMeta from '@/components/seo/PageMeta'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import type { Article, Comment } from '@/types/api'

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuthStore()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return
    articleApi.getBySlug(slug).then(setArticle).catch(() => setArticle(null))
  }, [slug])

  useEffect(() => {
    if (article?.id) {
      commentApi.list(article.id).then(setComments).catch(() => {})
    }
  }, [article?.id])

  const toc = article ? extractTocFromMarkdown(article.content) : []

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!article || !commentText.trim() || !user) return
    setSubmitting(true)
    try {
      await commentApi.create(article.id, commentText.trim())
      setCommentText('')
      const updated = await commentApi.list(article.id)
      setComments(updated)
    } finally {
      setSubmitting(false)
    }
  }

  if (!article) {
    return <div className="py-32 text-center text-zinc-500">{zh.article.notFound}</div>
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    author: { '@type': 'Person', name: article.authorName },
    datePublished: article.publishedAt,
    image: article.coverImage,
  }

  return (
    <>
      <ReadingProgress />
      <PageMeta
        title={article.title}
        description={article.summary?.slice(0, 160)}
        image={article.coverImage}
        type="article"
        jsonLd={jsonLd}
      />
      <article className="page-container py-10 lg:py-14">
        <header className="mb-10 lg:mb-14 max-w-4xl mx-auto text-center">
          {article.categoryName && (
            <span className="inline-block mb-4 rounded-full bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              {article.categoryName}
            </span>
          )}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">{article.title}</h1>
          {article.summary && (
            <p className="mt-5 text-lg text-secondary dark:text-zinc-400 leading-relaxed">{article.summary}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{article.authorName}</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span>{article.viewCount} {zh.article.reads}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,220px)_1fr] gap-8 xl:gap-14 max-w-article mx-auto">
          <aside className="hidden lg:block">
            <TableOfContents items={toc} />
          </aside>

          <div className="min-w-0">
            <div className="article-prose rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 px-6 sm:px-8 lg:px-10 py-8 lg:py-10 shadow-sm">
              <MarkdownRenderer content={article.content} />
            </div>

            <section className="mt-12 lg:mt-16 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/30 px-6 sm:px-8 py-8">
              <h2 className="font-display text-2xl mb-6">{zh.article.comments}（{comments.length}）</h2>
              {user ? (
                <form onSubmit={handleComment} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={zh.article.commentPlaceholder}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-950/50 p-4 mb-3 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                  <button type="submit" disabled={submitting} className="btn-primary cursor-pointer">
                    {zh.article.postComment}
                  </button>
                </form>
              ) : (
                <p className="mb-6 text-zinc-500">{zh.article.signInToComment}</p>
              )}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 p-4">
                    <div className="mb-1.5 text-sm font-medium">{c.userName}</div>
                    <p className="text-secondary dark:text-zinc-300 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  )
}
