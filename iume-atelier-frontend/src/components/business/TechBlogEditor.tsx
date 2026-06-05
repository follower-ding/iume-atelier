import { useCallback, useRef, useState } from 'react'
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  Loader2,
  Quote,
  SplitSquareHorizontal,
} from 'lucide-react'
import { zh } from '@/locales/zh'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'
import { uploadApi } from '@/api'

interface TechBlogEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type ViewMode = 'write' | 'preview' | 'split'

function detectLanguage(text: string): string {
  if (/public class|import java|@Override|@SpringBootApplication/.test(text)) return 'java'
  if (/interface \w+|type \w+ =|import .* from/.test(text)) return 'typescript'
  if (/import React|const .* =|=>|function \w+|console\.log/.test(text)) return 'javascript'
  if (/def \w+|import |print\(|if __name__/.test(text)) return 'python'
  if (/SELECT |INSERT |CREATE TABLE|UPDATE |DELETE FROM/i.test(text)) return 'sql'
  if (/^#!\/bin\/|^\s*(echo|sudo|cd|npm|git)\s/m.test(text)) return 'bash'
  if (/^\s*[\[{]/.test(text.trim()) && /"\w+":/.test(text)) return 'json'
  if (/^\w+:\s/m.test(text) && !text.includes('{')) return 'yaml'
  return 'plain'
}

function isLikelyCode(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return false
  const lines = trimmed.split('\n')
  if (lines.length >= 2) {
    const codePattern = /[{}();=]|function |const |import |class |public |private |def |SELECT |#include|=>|console\.|System\.|@Override/
    if (codePattern.test(trimmed)) return true
  }
  if (/^(\s{2,}|\t)/m.test(trimmed) && lines.length >= 2) return true
  return false
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = ''
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end) || placeholder
  const newValue =
    textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end)
  return { newValue, cursorStart: start + before.length, cursorEnd: start + before.length + selected.length }
}

export default function TechBlogEditor({ value, onChange, placeholder }: TechBlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const applyChange = useCallback(
    (newValue: string, cursorStart?: number, cursorEnd?: number) => {
      onChange(newValue)
      requestAnimationFrame(() => {
        const ta = textareaRef.current
        if (ta && cursorStart !== undefined) {
          ta.focus()
          ta.setSelectionRange(cursorStart, cursorEnd ?? cursorStart)
        }
      })
    },
    [onChange]
  )

  const wrapSelection = (before: string, after: string, placeholderText = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const { newValue, cursorStart, cursorEnd } = insertAtCursor(ta, before, after, placeholderText)
    applyChange(newValue, cursorStart, cursorEnd)
  }

  const insertCodeBlock = (lang: string) => {
    const label = lang === 'plain' ? '' : lang
    wrapSelection(`\n\`\`\`${label}\n`, '\n```\n', '// 在此粘贴或编写代码')
  }

  const insertImageMarkdown = (url: string, alt = '图片') => {
    const ta = textareaRef.current
    if (!ta) {
      onChange(value + `\n![${alt}](${url})\n`)
      return
    }
    const { newValue, cursorStart } = insertAtCursor(ta, `\n![${alt}](${url})\n`, '')
    applyChange(newValue, cursorStart)
  }

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    setStatusMsg(zh.editor.uploading)
    try {
      const url = await uploadApi.uploadImage(file)
      insertImageMarkdown(url, file.name.replace(/\.[^.]+$/, ''))
      setStatusMsg('')
    } catch {
      setStatusMsg(zh.editor.uploadFailed)
    } finally {
      setUploading(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) await handleUploadFile(file)
        return
      }
    }

    const text = e.clipboardData.getData('text/plain')
    if (text && isLikelyCode(text)) {
      e.preventDefault()
      const lang = detectLanguage(text)
      const fence = lang === 'plain' ? '```' : `\`\`\`${lang}`
      const ta = textareaRef.current
      if (!ta) {
        onChange(value + `\n${fence}\n${text.trim()}\n\`\`\`\n`)
        return
      }
      const { newValue, cursorStart, cursorEnd } = insertAtCursor(
        ta,
        `\n${fence}\n`,
        '\n```\n',
        text.trim()
      )
      applyChange(newValue, cursorStart, cursorEnd)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) {
      await handleUploadFile(file)
    }
  }

  const wordCount = value.replace(/\s/g, '').length

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">{zh.editor.markdownMode}</span>
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="text-xs text-zinc-500 hover:text-accent cursor-pointer transition-colors"
        >
          {showHelp ? '收起' : zh.editor.markdownHelp}
        </button>
      </div>

      {showHelp && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/30 px-4 py-3">
          <ul className="text-xs text-zinc-500 space-y-1 font-mono">
            {zh.editor.markdownHelpItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2">
        <ToolbarBtn icon={<Heading2 size={16} />} title={zh.editor.h2} onClick={() => wrapSelection('\n## ', '\n', '标题')} />
        <ToolbarBtn icon={<Heading3 size={16} />} title={zh.editor.h3} onClick={() => wrapSelection('\n### ', '\n', '小标题')} />
        <ToolbarBtn icon={<Bold size={16} />} title={zh.editor.bold} onClick={() => wrapSelection('**', '**', '粗体')} />
        <ToolbarBtn icon={<Italic size={16} />} title={zh.editor.italic} onClick={() => wrapSelection('*', '*', '斜体')} />
        <ToolbarBtn icon={<Code size={16} />} title={zh.editor.inlineCode} onClick={() => wrapSelection('`', '`', 'code')} />
        <ToolbarBtn icon={<Quote size={16} />} title={zh.editor.quote} onClick={() => wrapSelection('\n> ', '\n', '引用内容')} />
        <ToolbarBtn icon={<List size={16} />} title={zh.editor.list} onClick={() => wrapSelection('\n- ', '\n', '列表项')} />
        <ToolbarBtn icon={<Link size={16} />} title={zh.editor.link} onClick={() => wrapSelection('[', '](url)', '链接文字')} />

        <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

        {/* Code block languages */}
        {(['java', 'javascript', 'typescript', 'python', 'sql', 'bash', 'json'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            title={`${zh.editor.insertCode} - ${zh.editor.languages[lang]}`}
            onClick={() => insertCodeBlock(lang)}
            className="rounded px-2 py-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            {lang}
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />

        <ToolbarBtn
          icon={uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          title={zh.editor.insertImage}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUploadFile(file)
            e.target.value = ''
          }}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <ViewBtn active={viewMode === 'write'} onClick={() => setViewMode('write')} icon={<Code size={14} />} label={zh.editor.write} />
          <ViewBtn active={viewMode === 'split'} onClick={() => setViewMode('split')} icon={<SplitSquareHorizontal size={14} />} label={zh.editor.split} />
          <ViewBtn active={viewMode === 'preview'} onClick={() => setViewMode('preview')} icon={<Eye size={14} />} label={zh.editor.preview} />
        </div>
      </div>

      <p className="px-4 py-1.5 text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800">
        {statusMsg || zh.editor.pasteHint}
        <span className="float-right">{zh.editor.wordCount}：{wordCount}</span>
      </p>

      {/* Editor area */}
      <div className={`grid ${viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {(viewMode === 'write' || viewMode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder={placeholder || '在此用 Markdown 编写正文…\n\n## 示例标题\n\n正文段落，**粗体** 与 `行内代码`。\n\n```java\npublic class Hello {\n  public static void main(String[] args) {}\n}\n```\n\n直接 Ctrl+V 粘贴截图或从 IDE 粘贴代码即可。'}
            rows={viewMode === 'split' ? 24 : 20}
            className="w-full resize-y bg-white dark:bg-zinc-950 px-4 py-4 font-mono text-sm leading-relaxed outline-none border-r border-zinc-200 dark:border-zinc-800"
            spellCheck={false}
          />
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="article-prose max-h-[600px] overflow-y-auto px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-zinc-400 text-sm">预览区域</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarBtn({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-50"
    >
      {icon}
    </button>
  )
}

function ViewBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer transition-colors ${
        active ? 'bg-accent text-white' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
      }`}
    >
      {icon} {label}
    </button>
  )
}
