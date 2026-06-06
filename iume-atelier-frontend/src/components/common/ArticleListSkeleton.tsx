interface ArticleListSkeletonProps {
  count?: number
}

export default function ArticleListSkeleton({ count = 4 }: ArticleListSkeletonProps) {
  return (
    <div className="article-list article-list--wide" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-article">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--summary" />
          <div className="skeleton-line skeleton-line--meta" />
        </div>
      ))}
    </div>
  )
}
