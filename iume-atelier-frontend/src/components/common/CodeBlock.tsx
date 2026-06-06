import { isValidElement, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { useUiSound } from '@/hooks/useUiSound'
import { burstAt } from '@/utils/burstParticles'
import { zh } from '@/locales/zh'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

function extractCodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractCodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractCodeText(node.props.children)
  }
  return ''
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const { play } = useUiSound()
  const raw = extractCodeText(children).replace(/\n$/, '')
  const lines = raw.split('\n')

  const copy = async () => {
    await navigator.clipboard.writeText(raw)
    setCopied(true)
    play('click')
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 14)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block group relative my-6">
      <button
        ref={btnRef}
        type="button"
        onClick={copy}
        aria-label={copied ? zh.editor.copied : zh.editor.copyCode}
        className="code-block__copy click-particles-ignore"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? zh.editor.copied : zh.editor.copyCode}
      </button>
      <div className="code-block__wrap" style={{ background: 'var(--color-code-bg)' }}>
        <div className="code-block__lines" aria-hidden="true">
          {lines.map((_, i) => (
            <span key={i} className="code-block__ln">{i + 1}</span>
          ))}
        </div>
        <pre className={`code-block__pre overflow-x-auto ${className ?? ''}`}>
          {children}
        </pre>
      </div>
    </div>
  )
}
