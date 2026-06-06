import { useEffect } from 'react'
import { X } from 'lucide-react'
import BlogSidebar from '@/components/business/BlogSidebar'
import { zh } from '@/locales/zh'

interface MobileCatalogDrawerProps {
  open: boolean
  onClose: () => void
}

export default function MobileCatalogDrawer({ open, onClose }: MobileCatalogDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="mobile-catalog-drawer xl:hidden" role="dialog" aria-modal="true" aria-label={zh.sidebar.mobileCatalog}>
      <button
        type="button"
        className="mobile-catalog-drawer__backdrop cursor-pointer"
        aria-label={zh.companion.close}
        onClick={onClose}
      />
      <div className="mobile-catalog-drawer__panel">
        <div className="mobile-catalog-drawer__head">
          <h2 className="mobile-catalog-drawer__title">{zh.sidebar.mobileCatalog}</h2>
          <button type="button" className="header-icon-btn cursor-pointer" onClick={onClose} aria-label={zh.companion.close}>
            <X size={20} />
          </button>
        </div>
        <div className="mobile-catalog-drawer__body">
          <BlogSidebar position="left" />
        </div>
      </div>
    </div>
  )
}
