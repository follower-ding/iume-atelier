import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

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
        pre: ({ children }) => (
          <pre className="!bg-zinc-900 !text-zinc-100 rounded-xl overflow-x-auto my-6 text-sm leading-relaxed p-4 lg:p-5">
            {children}
          </pre>
        ),
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
            <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-sm text-accent font-mono" {...props}>
              {children}
            </code>
          )
        },
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ''}
            className="rounded-xl my-6 w-full max-w-full shadow-md"
            loading="lazy"
          />
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80 cursor-pointer">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-700 text-sm">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-zinc-200 dark:border-zinc-700 px-4 py-2">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
