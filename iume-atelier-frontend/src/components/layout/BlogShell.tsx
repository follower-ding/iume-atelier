import type { ReactNode } from 'react'
import BlogSidebar from '@/components/business/BlogSidebar'

interface BlogShellProps {
  children: ReactNode
  showSidebars?: boolean
}

export default function BlogShell({ children, showSidebars = true }: BlogShellProps) {
  if (!showSidebars) {
    return <div className="blog-shell blog-shell--single">{children}</div>
  }

  return (
    <div className="blog-shell">
      <aside className="blog-sidebar blog-sidebar--left hidden xl:block">
        <BlogSidebar position="left" />
      </aside>
      <div className="blog-shell__main min-w-0">{children}</div>
      <aside className="blog-sidebar blog-sidebar--right hidden lg:block">
        <BlogSidebar position="right" />
      </aside>
    </div>
  )
}
