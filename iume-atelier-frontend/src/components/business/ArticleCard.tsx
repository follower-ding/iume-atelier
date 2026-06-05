import { Link } from 'react-router-dom'
import type { Article } from '@/types/api'
import { zh } from '@/locales/zh'

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export default function ArticleCard({ article, featured }: ArticleCardProps) {
  if (featured) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group grid grid-cols-1 md:grid-cols-12 cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/60 shadow-sm hover:shadow-md hover:border-accent/20 transition-all duration-300"
      >
        <div className="md:col-span-7 flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <span className="mb-3 inline-block w-fit rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-accent">
            {article.categoryName || '精选'}
          </span>
          <h2 className="mb-4 font-display text-2xl sm:text-3xl lg:text-5xl leading-tight group-hover:text-accent transition-colors duration-200">
            {article.title}
          </h2>
          <p className="text-secondary dark:text-zinc-400 line-clamp-3 leading-relaxed">{article.summary}</p>
        </div>
        <div className="md:col-span-5 min-h-[200px] md:min-h-[280px] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center font-display text-6xl text-zinc-300 dark:text-zinc-600">
              {article.title.charAt(0)}
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col h-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-900/60 p-6 shadow-sm transition-all duration-200 hover:border-accent/25 hover:shadow-md"
    >
      {article.categoryName && (
        <span className="mb-2 inline-block w-fit rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">
          {article.categoryName}
        </span>
      )}
      <h3 className="mb-3 font-display text-lg lg:text-xl leading-snug group-hover:text-accent transition-colors duration-200">
        {article.title}
      </h3>
      <p className="mb-4 flex-1 text-sm text-secondary dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {article.summary}
      </p>
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span>{article.authorName}</span>
        <span>{article.viewCount} {zh.article.reads}</span>
      </div>
    </Link>
  )
}
