import { useEffect, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, X } from 'lucide-react'
import AiToolsBrowser from '@/components/ai-tools/AiToolsBrowser'
import { zh } from '@/locales/zh'

interface AiToolsPanelProps {
  onClose: () => void
  style?: CSSProperties
}

export default function AiToolsPanel({ onClose, style }: AiToolsPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`companion-panel companion-panel--tools${style ? ' companion-panel--floating' : ''}`}
      style={style}
      role="dialog"
      aria-label={zh.companion.tools}
    >
      <div className="companion-panel__head">
        <h3 className="companion-panel__title">{zh.companion.tools}</h3>
        <div className="companion-panel__head-actions">
          <Link
            to="/tools"
            className="companion-panel__link cursor-pointer"
            onClick={onClose}
            title={zh.aiTools.openFullPage}
          >
            <ExternalLink size={14} />
          </Link>
          <button type="button" className="companion-panel__close cursor-pointer" onClick={onClose} aria-label={zh.companion.close}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="companion-panel__body">
        <AiToolsBrowser compact />
      </div>
    </div>
  )
}
