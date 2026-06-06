import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'
import { aiToolApi } from '@/api'
import { zh } from '@/locales/zh'
import type { AiToolRequestDto } from '@/types/ai-tool-api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AiToolChatPanelProps {
  onSaved?: () => void
  /** 侧边栏紧凑模式（AI 工具箱列表页） */
  compact?: boolean
}

export default function AiToolChatPanel({ onSaved, compact = false }: AiToolChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: zh.console.aiToolChatWelcome },
  ])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [draft, setDraft] = useState<AiToolRequestDto | null>(null)
  const [summary, setSummary] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const scrollDown = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || generating) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setGenerating(true)
    scrollDown()

    try {
      const history = nextMessages
        .slice(1, -1)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await aiToolApi.generate({
        message: text,
        context: context.trim() || undefined,
        history,
      })

      setDraft(res.draft)
      setSummary(res.summary)
      const assistantText = `${res.summary}\n\n${zh.console.aiToolChatPreviewHint}`
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : zh.console.aiToolChatError
      setError(msg)
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setGenerating(false)
      scrollDown()
    }
  }

  const handleSave = async () => {
    if (!draft || saving) return
    setSaving(true)
    setError('')
    try {
      await aiToolApi.upsert(draft)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: zh.console.aiToolChatSaved.replace('{name}', draft.name) },
      ])
      setDraft(null)
      setSummary('')
      onSaved?.()
    } catch {
      setError(zh.console.saveFailed)
    } finally {
      setSaving(false)
      scrollDown()
    }
  }

  return (
    <section className={`ai-tool-chat${compact ? ' ai-tool-chat--compact' : ''}`}>
      <header className="ai-tool-chat__head">
        <div className="ai-tool-chat__head-icon" aria-hidden="true">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="ai-tool-chat__title">{zh.console.aiToolChatTitle}</h2>
          <p className="ai-tool-chat__desc">{zh.console.aiToolChatDesc}</p>
        </div>
      </header>

      <div className="ai-tool-chat__messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-tool-chat__msg ai-tool-chat__msg--${m.role}`}>
            <span className="ai-tool-chat__avatar" aria-hidden="true">
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </span>
            <p className="ai-tool-chat__bubble">{m.content}</p>
          </div>
        ))}
        {generating && (
          <div className="ai-tool-chat__msg ai-tool-chat__msg--assistant">
            <span className="ai-tool-chat__avatar"><Loader2 size={14} className="animate-spin" /></span>
            <p className="ai-tool-chat__bubble">{zh.console.aiToolChatThinking}</p>
          </div>
        )}
      </div>

      {draft && (
        <div className="ai-tool-chat__preview">
          <h3 className="ai-tool-chat__preview-title">{zh.console.aiToolChatPreview}</h3>
          {summary && <p className="ai-tool-chat__preview-summary">{summary}</p>}
          <dl className="ai-tool-chat__preview-meta">
            <div><dt>slug</dt><dd><code>{draft.slug}</code></dd></div>
            <div><dt>{zh.console.aiToolName}</dt><dd>{draft.icon} {draft.name}</dd></div>
            <div><dt>{zh.console.aiToolCategory}</dt><dd>{draft.category}</dd></div>
          </dl>
          <p className="ai-tool-chat__preview-desc">{draft.description}</p>
          <div className="ai-tool-chat__preview-actions">
            <button type="button" className="btn-primary cursor-pointer" disabled={saving} onClick={handleSave}>
              {saving ? zh.articles.loading : zh.console.aiToolChatConfirm}
            </button>
            <Link to={`/console/ai-tools/${draft.slug}/edit`} className="btn-secondary cursor-pointer inline-flex items-center">
              {zh.console.aiToolChatEditFirst}
            </Link>
            <Link to={`/tools/${draft.slug}`} target="_blank" className="btn-secondary cursor-pointer inline-flex items-center">
              {zh.aiTools.viewDetail}
            </Link>
          </div>
        </div>
      )}

      <details className="ai-tool-chat__context">
        <summary className="cursor-pointer">{zh.console.aiToolChatPasteDocs}</summary>
        <textarea
          className="console-input w-full mt-2 min-h-[80px]"
          placeholder={zh.console.aiToolQuickImportPlaceholder}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </details>

      {error && <p className="ai-tool-chat__error">{error}</p>}

      <div className="ai-tool-chat__composer">
        <textarea
          className="ai-tool-chat__input"
          rows={2}
          placeholder={zh.console.aiToolChatPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button
          type="button"
          className="ai-tool-chat__send cursor-pointer"
          disabled={generating || !input.trim()}
          onClick={handleSend}
          aria-label={zh.console.aiToolChatSend}
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </section>
  )
}
