import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'

export default function PageTransition() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.classList.remove('page-transition--enter')
    void el.offsetWidth
    el.classList.add('page-transition--enter')
  }, [location.pathname])

  return (
    <main ref={mainRef} className="flex-1 page-transition">
      <Suspense
        fallback={(
          <section className="page-container py-10 lg:py-14">
            <ArticleListSkeleton count={3} />
          </section>
        )}
      >
        <Outlet />
      </Suspense>
    </main>
  )
}
