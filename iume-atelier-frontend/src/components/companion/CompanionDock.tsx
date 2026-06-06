import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { GripHorizontal, Music } from 'lucide-react'
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
  const { mood, quote, drawer, setDrawer, toggleDrawer, setMood, showQuote, clearQuote } = useCompanionStore()
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

  const dockClass = [
    'companion-dock',
    'companion-dock--with-music',
    'click-particles-ignore',
    isStudioWrite ? 'companion-dock--studio' : '',
    playing ? 'companion-dock--playing' : '',
    dragging ? 'companion-dock--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const dock = (
    <div className={dockClass} style={style}>
      <MusicEngine />

      {quote && (
        <div className="companion-dock__bubble" role="status">
          {quote}
        </div>
      )}

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
      </div>
    </div>
  )

  if (!mounted || hidden) return null
  return (
    <>
      {createPortal(dock, document.body)}
      {drawer === 'music' && <FloatingMusicPlayer onClose={() => setDrawer(null)} />}
    </>
  )
}
