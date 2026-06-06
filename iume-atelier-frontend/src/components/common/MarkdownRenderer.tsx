import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import CodeBlock from '@/components/common/CodeBlock'
import 'highlight.js/styles/github.css'

interface MarkdownRendererProps {
  content: string
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h2: ({ children }) => {
          const text = String(children)
          return <h2 id={slugify(text)}>{children}</h2>
        },
        h3: ({ children }) => {
          const text = String(children)
          return <h3 id={slugify(text)}>{children}</h3>
        },
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        code: ({ className, children, ...props }) => {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
          return (
            <code
              className="rounded px-1.5 py-0.5 text-sm font-mono text-accent"
              style={{ background: 'var(--color-code-bg)' }}
              {...props}
            >
              {children}
            </code>
          )
        },
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ''}
            className="my-6 w-full max-w-full rounded-lg"
            loading="lazy"
          />
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="prose-link cursor-pointer">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border text-sm" style={{ borderColor: 'var(--color-border)' }}>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className="border px-4 py-2 text-left font-semibold"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-code-bg)' }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border px-4 py-2" style={{ borderColor: 'var(--color-border)' }}>
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
