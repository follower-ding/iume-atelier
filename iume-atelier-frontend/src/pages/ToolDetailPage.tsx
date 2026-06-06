import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, ExternalLink } from 'lucide-react'
import PageMeta from '@/components/seo/PageMeta'
import { getAiToolEntryById, getCategoryLabel } from '@/data/ai-tools'
import { useAiToolEntry } from '@/hooks/useAiTools'
import { useSnippetCopy } from '@/hooks/useSnippetCopy'
import { zh } from '@/locales/zh'
import NotFoundPage from '@/pages/NotFoundPage'

function ConfigBlock({
  title,
  content,
  copied,
  onCopy,
}: {
  title: string
  content: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="tool-detail__config">
      <div className="tool-detail__code-head">
        <h3 className="tool-detail__config-title">{title}</h3>
        <button type="button" className="btn-primary cursor-pointer tool-detail__copy-btn" onClick={onCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? zh.aiTools.copied : zh.aiTools.copy}
        </button>
      </div>
      <pre className="tool-detail__code"><code>{content}</code></pre>
    </div>
  )
}

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { entry, loading } = useAiToolEntry(id)
  const staticEntry = id ? getAiToolEntryById(id) : undefined
  const tool = entry ?? staticEntry
  const { copiedId, copyText } = useSnippetCopy()

  if (!loading && !tool) return <NotFoundPage />
  if (!tool) {
    return <div className="page-container py-20 text-secondary">{zh.articles.loading}</div>
  }

  const { detail } = tool
  const hasMcpConfig = (detail.configs?.length ?? 0) > 0 || tool.category === 'mcp'

  return (
    <>
      <PageMeta title={`${tool.name} — ${zh.tools.title}`} description={tool.description} />

      <article className="page-container py-10 lg:py-14 max-w-3xl">
        <Link to="/tools" className="tool-detail__back cursor-pointer">
          <ArrowLeft size={16} />
          {zh.aiTools.backToList}
        </Link>

        <header className="tool-detail__header">
          <span className="tool-detail__icon" aria-hidden="true">{tool.icon}</span>
          <div>
            <p className="tool-detail__category">{getCategoryLabel(tool.category)}</p>
            <h1 className="section-title">{tool.name}</h1>
            <p className="tool-detail__summary">{detail.intro ?? tool.description}</p>
          </div>
        </header>

        {tool.tags.length > 0 && (
          <div className="tool-detail__tags">
            {tool.tags.map((tag) => (
              <span key={tag} className="tool-detail__tag">#{tag}</span>
            ))}
          </div>
        )}

        <section className="tool-detail__section">
          <h2 className="tool-detail__heading">{zh.aiTools.features}</h2>
          <ul className="tool-detail__list">
            {detail.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {detail.install && detail.install.length > 0 && (
          <section className="tool-detail__section">
            <h2 className="tool-detail__heading">{zh.aiTools.install}</h2>
            <ol className="tool-detail__steps">
              {detail.install.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {detail.setup && detail.setup.length > 0 && (
          <section className="tool-detail__section">
            <h2 className="tool-detail__heading">{zh.aiTools.setup}</h2>
            {hasMcpConfig && tool.category === 'mcp' && (
              <p className="tool-detail__hint">{zh.aiTools.mcpJsonPath}</p>
            )}
            <ol className="tool-detail__steps">
              {detail.setup.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {detail.configs && detail.configs.length > 0 && (
          <section className="tool-detail__section">
            <h2 className="tool-detail__heading">{zh.aiTools.configSnippet}</h2>
            <div className="tool-detail__configs">
              {detail.configs.map((cfg) => (
                <ConfigBlock
                  key={cfg.id}
                  title={cfg.title}
                  content={cfg.content}
                  copied={copiedId === cfg.id}
                  onCopy={() => copyText(cfg.id, cfg.content)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="tool-detail__section">
          <h2 className="tool-detail__heading">{zh.aiTools.howToUse}</h2>
          <ol className="tool-detail__steps">
            {detail.usage.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {detail.related && detail.related.length > 0 && (
          <section className="tool-detail__section">
            <h2 className="tool-detail__heading">{zh.aiTools.related}</h2>
            <ul className="tool-detail__related">
              {detail.related.map((relId) => {
                const rel = getAiToolEntryById(relId)
                if (!rel) return null
                return (
                  <li key={relId}>
                    <Link to={`/tools/${relId}`} className="tool-detail__related-link cursor-pointer">
                      {rel.icon} {rel.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {tool.url && (
          <div className="tool-detail__actions">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary cursor-pointer inline-flex items-center gap-2"
            >
              <ExternalLink size={16} />
              {zh.aiTools.openLink}
            </a>
          </div>
        )}
      </article>
    </>
  )
}
