import { useState, type ReactNode } from 'react'
import { ChevronDown, LayoutList } from 'lucide-react'
import BlogSidebar from '@/components/business/BlogSidebar'
import { zh } from '@/locales/zh'

interface BlogShellProps {
  children: ReactNode
  showSidebars?: boolean
}

function defaultCatalogOpen() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 1279px)').matches
}

export default function BlogShell({ children, showSidebars = true }: BlogShellProps) {
  const [catalogOpen, setCatalogOpen] = useState(defaultCatalogOpen)

  if (!showSidebars) {
    return <div className="blog-shell blog-shell--single">{children}</div>
  }

  return (
    <div className="blog-shell">
      <aside className="blog-sidebar blog-sidebar--left hidden xl:block">
        <BlogSidebar position="left" />
      </aside>
      <div className="blog-shell__main min-w-0">
        <div className="mobile-catalog-bar xl:hidden">
          <button
            type="button"
            className="blog-catalog-trigger cursor-pointer"
            onClick={() => setCatalogOpen((v) => !v)}
            aria-expanded={catalogOpen}
          >
            <LayoutList size={16} aria-hidden="true" />
            <span>{catalogOpen ? zh.sidebar.closeCatalog : zh.sidebar.openCatalog}</span>
            <ChevronDown
              size={16}
              className={`blog-catalog-trigger__chevron${catalogOpen ? ' blog-catalog-trigger__chevron--open' : ''}`}
              aria-hidden="true"
            />
          </button>
          {catalogOpen && (
            <nav className="mobile-catalog-inline" aria-label={zh.sidebar.mobileCatalog}>
              <BlogSidebar position="left" />
            </nav>
          )}
        </div>
        {children}
      </div>
      <aside className="blog-sidebar blog-sidebar--right hidden lg:block">
        <BlogSidebar position="right" />
      </aside>
    </div>
  )
}
