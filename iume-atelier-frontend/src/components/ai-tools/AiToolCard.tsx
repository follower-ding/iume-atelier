import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, ExternalLink } from 'lucide-react'
import type { AiToolConfigBlock, AiToolItem } from '@/data/ai-tools/types'
import { getCategoryLabel } from '@/data/ai-tools'
import { zh } from '@/locales/zh'

interface AiToolCardProps {
  tool: AiToolItem
  index?: number
  copiedId?: string | null
  onCopy?: (configId: string, content: string) => void
  primaryConfig?: AiToolConfigBlock
  compact?: boolean
}

export default function AiToolCard({
  tool,
  index = 0,
  copiedId,
  onCopy,
  primaryConfig,
  compact,
}: AiToolCardProps) {
  const isCopied = primaryConfig ? copiedId === primaryConfig.id : false

  const stopNav = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link
      to={`/tools/${tool.id}`}
      className={`ai-tool-card ai-tool-card--simple ai-tool-card--link${compact ? ' ai-tool-card--compact' : ''} animate-fade-up cursor-pointer`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="ai-tool-card__head">
        <span className="ai-tool-card__icon" aria-hidden="true">{tool.icon}</span>
        <div className="ai-tool-card__actions" onClick={stopNav}>
          {primaryConfig && onCopy && (
            <button
              type="button"
              className="ai-tool-card__action cursor-pointer"
              onClick={(e) => {
                stopNav(e)
                onCopy(primaryConfig.id, primaryConfig.content)
              }}
              title={zh.aiTools.copy}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ai-tool-card__action cursor-pointer"
              onClick={stopNav}
              title={zh.aiTools.openLink}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <h3 className="ai-tool-card__title">{tool.name}</h3>
      <p className="ai-tool-card__desc">{tool.description}</p>
      <p className="ai-tool-card__meta">{getCategoryLabel(tool.category)}</p>
    </Link>
  )
}
