import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

export default function PageMeta({
  title,
  description = 'A distinctive editorial blog by iume — writing, design, and ideas.',
  image,
  url,
  type = 'website',
  jsonLd,
}: PageMetaProps) {
  const siteName = import.meta.env.VITE_SITE_NAME || 'iume atelier'
  const fullTitle = title === siteName ? title : `${title} · ${siteName}`
  const canonical = url || window.location.href

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
