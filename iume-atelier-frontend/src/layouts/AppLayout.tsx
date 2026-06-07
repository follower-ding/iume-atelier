import { useLocation } from 'react-router-dom'
import { useUserPrefsSync } from '@/hooks/useUserPrefsSync'
import { useSharedMusicSync } from '@/hooks/useSharedMusicSync'
import SimpleModeEffects from '@/components/common/SimpleModeEffects'
import MobileBottomNav from '@/components/common/MobileBottomNav'
import MobileNav from '@/components/common/MobileNav'
import SiteFooter from '@/components/common/SiteFooter'
import SiteHeader from '@/components/common/SiteHeader'
import CompanionDock from '@/components/companion/CompanionDock'
import ClickParticles from '@/components/interactive/ClickParticles'
import CustomCursor from '@/components/interactive/CustomCursor'
import KonamiEasterEgg from '@/components/interactive/KonamiEasterEgg'
import PageTransition from '@/components/interactive/PageTransition'
import PageViewTracker from '@/components/analytics/PageViewTracker'

export default function AppLayout() {
  const { pathname } = useLocation()
  const isStudioWrite = /^\/studio(\/new|\/\d+\/edit)/.test(pathname)
  const hideBottomNav = isStudioWrite || pathname === '/login' || pathname === '/register'

  useUserPrefsSync()
  useSharedMusicSync()

  return (
    <div className={`min-h-screen flex flex-col site-shell${isStudioWrite ? ' site-shell--studio-write' : ''}${hideBottomNav ? '' : ' site-shell--mobile-nav'}`}>
      <PageViewTracker />
      <SimpleModeEffects />
      <div className="site-grain" aria-hidden="true" />
      <ClickParticles />
      {!isStudioWrite && <CustomCursor />}
      <KonamiEasterEgg />
      <SiteHeader />
      <PageTransition />
      {!isStudioWrite && <SiteFooter />}
      <CompanionDock />
      <MobileNav />
      <MobileBottomNav hidden={hideBottomNav} />
    </div>
  )
}
