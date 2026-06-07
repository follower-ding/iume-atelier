import { useLocation } from 'react-router-dom'
import { usePageView } from '@/hooks/usePageView'

/** Tracks public route changes; article detail is handled in ArticleDetailPage. */
export default function PageViewTracker() {
  const { pathname } = useLocation()
  usePageView(pathname)
  return null
}
