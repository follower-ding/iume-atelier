import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ChevronUp, GripHorizontal, Music, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompanionAvatar from '@/components/companion/CompanionAvatar'
import FloatingMusicPlayer, { MusicMiniToggle } from '@/components/companion/FloatingMusicPlayer'
import MusicEngine from '@/components/companion/MusicEngine'
import { randomQuote } from '@/data/companion-quotes'
import { useCompanionDrag } from '@/hooks/useCompanionDrag'
import { useUiSound } from '@/hooks/useUiSound'
import { useAuthStore, useCompanionStore, useMusicStore } from '@/store'
import { zh } from '@/locales/zh'

export default function CompanionDock() {
  const { pathname } = useLocation()
  const { play } = useUiSound()
  const user = useAuthStore((s) => s.user)
  const {
    mood,
    quote,
    drawer,
    collapsed,
    dismissed,
    setDrawer,
    toggleDrawer,
    toggleCollapsed,
    setDismissed,
    setMood,
    showQuote,
    clearQuote,
  } = useCompanionStore()
  const playing = useMusicStore((s) => s.playing)
  const displayName = user?.nickname || user?.username || '你'
  const { style, dragging, dragHandleProps, consumeDragClick, resetPosition } = useCompanionDrag()
  const [mounted, setMounted] = useState(false)

  const isStudioWrite = /^\/studio(\/new|\/\d+\/edit)/.test(pathname)
  const isSettings = pathname.startsWith('/settings')
  const isArticleRead = pathname.startsWith('/article/')
  const hidden = isStudioWrite || isSettings

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (hidden) {
      setDrawer(null)
      return
    }
    if (isArticleRead) setMood('reading')
    else setMood('idle')
  }, [hidden, isArticleRead, setMood, setDrawer])

  useEffect(() => {
    if (!quote) return
    const timer = setTimeout(clearQuote, 4500)
    return () => clearTimeout(timer)
  }, [quote, clearQuote])

  const handleAvatarClick = () => {
    if (consumeDragClick()) return
    play('hover')
    showQuote(randomQuote())
  }

  const handleAvatarDoubleClick = () => {
    resetPosition()
    play('click')
    showQuote(zh.companion.resetPosition)
  }

  const handleHide = () => {
    play('click')
    setDismissed(true)
  }

  const handleRestore = () => {
    play('click')
    setDismissed(false)
    setDrawer(null)
  }

  const dockClass = [
    'companion-dock',
    'companion-dock--with-music',
    'click-particles-ignore',
    isStudioWrite ? 'companion-dock--studio' : '',
    playing ? 'companion-dock--playing' : '',
    dragging ? 'companion-dock--dragging' : '',
    collapsed ? 'companion-dock--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const restoreDock = (
    <button
      type="button"
      className="companion-dock-restore cursor-pointer"
      style={style}
      onClick={handleRestore}
      title={zh.companion.expand}
      aria-label={zh.companion.expand}
    >
      <span className="companion-dock-restore__avatar" aria-hidden="true">
        {(displayName || '你').trim()[0]?.toUpperCase() || '你'}
      </span>
      {playing && <span className="companion-dock-restore__eq" aria-hidden="true"><span /><span /><span /></span>}
    </button>
  )

  const dock = (
    <div className={dockClass} style={style}>
      <MusicEngine />

      {quote && !collapsed && (
        <div className="companion-dock__bubble" role="status">
          {quote}
        </div>
      )}

      {collapsed ? (
        <button
          type="button"
          className="companion-dock__expand cursor-pointer"
          onClick={() => {
            play('click')
            toggleCollapsed()
          }}
          title={zh.companion.expand}
          aria-label={zh.companion.expand}
        >
          <ChevronUp size={18} />
        </button>
      ) : (
        <>
          <div className="companion-dock__avatar-wrap">
            <span className="companion-dock__grip" aria-hidden="true">
              <GripHorizontal size={12} />
            </span>
            <CompanionAvatar
              avatarUrl={user?.avatar}
              displayName={displayName}
              mood={mood}
              playing={playing}
              dragHandleProps={dragHandleProps}
              onClick={handleAvatarClick}
              onDoubleClick={handleAvatarDoubleClick}
            />
          </div>

          <div className="companion-dock__toolbar">
            <Link
              to="/tools"
              className="companion-dock__btn cursor-pointer"
              onClick={() => play('click')}
              title={zh.nav.toolsPage}
              aria-label={zh.nav.toolsPage}
            >
              <Sparkles size={16} />
            </Link>
            <button
              type="button"
              className={`companion-dock__btn cursor-pointer ${drawer === 'music' ? 'companion-dock__btn--active' : ''}`}
              onClick={() => {
                play('click')
                toggleDrawer('music')
              }}
              title={zh.companion.music}
              aria-label={zh.companion.music}
              aria-expanded={drawer === 'music'}
            >
              <Music size={16} />
            </button>
            <MusicMiniToggle />
            <button
              type="button"
              className="companion-dock__btn companion-dock__btn--hide cursor-pointer"
              onClick={handleHide}
              title={zh.companion.hide}
              aria-label={zh.companion.hide}
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )

  if (!mounted || hidden) return null

  return (
    <>
      {createPortal(dismissed ? restoreDock : dock, document.body)}
      {drawer === 'music' && !dismissed && <FloatingMusicPlayer onClose={() => setDrawer(null)} />}
    </>
  )
}
