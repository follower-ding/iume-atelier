import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  author?: string
  jsonLd?: Record<string, unknown>
}

function toAbsoluteUrl(path?: string): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}

export default function PageMeta({
  title,
  description = '专注技术写作的博客 — 支持 Markdown、代码高亮与图片粘贴。',
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  jsonLd,
}: PageMetaProps) {
  const siteName = import.meta.env.VITE_SITE_NAME || 'iume atelier'
  const fullTitle = title === siteName ? title : `${title} · ${siteName}`
  const canonical = url || (typeof window !== 'undefined' ? window.location.href : '')
  const ogImage = toAbsoluteUrl(image)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="zh_CN" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
