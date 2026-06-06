import { useState, type ReactNode } from 'react'
import { LayoutList } from 'lucide-react'
import BlogSidebar from '@/components/business/BlogSidebar'
import MobileCatalogDrawer from '@/components/layout/MobileCatalogDrawer'
import { zh } from '@/locales/zh'

interface BlogShellProps {
  children: ReactNode
  showSidebars?: boolean
}

export default function BlogShell({ children, showSidebars = true }: BlogShellProps) {
  const [catalogOpen, setCatalogOpen] = useState(false)

  if (!showSidebars) {
    return <div className="blog-shell blog-shell--single">{children}</div>
  }

  return (
    <div className="blog-shell">
      <aside className="blog-sidebar blog-sidebar--left hidden xl:block">
        <BlogSidebar position="left" />
      </aside>
      <div className="blog-shell__main min-w-0">
        <button
          type="button"
          className="blog-catalog-trigger xl:hidden cursor-pointer"
          onClick={() => setCatalogOpen(true)}
          aria-expanded={catalogOpen}
        >
          <LayoutList size={16} aria-hidden="true" />
          <span>{zh.sidebar.openCatalog}</span>
        </button>
        {children}
      </div>
      <aside className="blog-sidebar blog-sidebar--right hidden lg:block">
        <BlogSidebar position="right" />
      </aside>
      <MobileCatalogDrawer open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </div>
  )
}
