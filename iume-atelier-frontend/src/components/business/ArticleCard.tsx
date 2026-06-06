import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useUiSound } from '@/hooks/useUiSound'
import type { Article } from '@/types/api'
import { zh } from '@/locales/zh'

interface ArticleCardProps {
  article: Article
  featured?: boolean
  layout?: 'row' | 'grid'
  index?: number
}

function ArticleCover({ article, featured }: { article: Article; featured?: boolean }) {
  const initial = article.title.charAt(0).toUpperCase()
  const sizeClass = featured ? 'article-cover--featured' : 'article-cover--default'

  if (article.coverImage) {
    return (
      <div className={`article-cover ${sizeClass}`}>
        <img src={article.coverImage} alt="" className="article-cover__img" loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`article-cover article-cover--placeholder ${sizeClass}`}>
      <span>{initial}</span>
    </div>
  )
}

export default function ArticleCard({ article, featured, layout = 'row', index = 0 }: ArticleCardProps) {
  const { play } = useUiSound()
  const staggerStyle = { animationDelay: `${Math.min(index, 12) * 0.06}s` } as const

  if (layout === 'grid') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="article-grid-card group cursor-pointer animate-fade-up"
        style={staggerStyle}
        onClick={() => play('whoosh')}
      >
        <ArticleCover article={article} />
        <div className="article-grid-card__body">
          {article.categoryName && (
            <span className="article-grid-card__cat">{article.categoryName}</span>
          )}
          <h2 className="article-grid-card__title">{article.title}</h2>
          {article.summary && <p className="article-grid-card__summary line-clamp-2">{article.summary}</p>}
          <span className="article-row__more mt-3">
            {zh.home.readMore}
            <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className={`article-row article-row--with-cover group animate-fade-up ${featured ? 'article-row--featured' : ''}`}
      style={staggerStyle}
      onClick={() => play('whoosh')}
    >
      <div className="article-row__content">
        {article.categoryName && (
          <span className="mb-2 block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent">
            {article.categoryName}
          </span>
        )}
        <h2 className={`article-row__title ${featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
          {article.title}
        </h2>
        {article.summary && (
          <p className="article-row__summary line-clamp-2 sm:line-clamp-3">{article.summary}</p>
        )}
        <span className="article-row__more">
          {zh.home.readMore}
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
      <ArticleCover article={article} featured={featured} />
    </Link>
  )
}
