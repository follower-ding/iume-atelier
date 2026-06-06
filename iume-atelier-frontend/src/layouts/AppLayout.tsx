import { useLocation } from 'react-router-dom'
import { useUserPrefsSync } from '@/hooks/useUserPrefsSync'
import SimpleModeEffects from '@/components/common/SimpleModeEffects'
import SiteFooter from '@/components/common/SiteFooter'
import SiteHeader from '@/components/common/SiteHeader'
import CompanionDock from '@/components/companion/CompanionDock'
import ClickParticles from '@/components/interactive/ClickParticles'
import CustomCursor from '@/components/interactive/CustomCursor'
import KonamiEasterEgg from '@/components/interactive/KonamiEasterEgg'
import PageTransition from '@/components/interactive/PageTransition'
export default function AppLayout() {
  const { pathname } = useLocation()
  const isStudioWrite = /^\/studio(\/new|\/\d+\/edit)/.test(pathname)

  useUserPrefsSync()

  return (
    <div className={`min-h-screen flex flex-col site-shell${isStudioWrite ? ' site-shell--studio-write' : ''}`}>
      <SimpleModeEffects />
      <div className="site-grain" aria-hidden="true" />
      <ClickParticles />
      {!isStudioWrite && <CustomCursor />}
      <KonamiEasterEgg />
      <SiteHeader />
      <PageTransition />
      {!isStudioWrite && <SiteFooter />}
      <CompanionDock />
    </div>
  )
}
