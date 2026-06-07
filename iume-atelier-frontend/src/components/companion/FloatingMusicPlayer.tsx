import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import MusicVinyl, { TrackThumb } from '@/components/companion/MusicVinyl'
import { useCustomTrackIds, usePlaylist, useSharedTrackIds } from '@/hooks/usePlaylist'
import { zh } from '@/locales/zh'
import { useAuthStore, useMusicStore } from '@/store'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'
import { useUserPrefsStore } from '@/store/useUserPrefsStore'
import { useUiSound } from '@/hooks/useUiSound'
import { sharedMusicApi } from '@/api'
import { isAdmin } from '@/utils/user'
import { syncUserPrefsToCloud } from '@/utils/syncUserPrefs'
import type { RepeatMode } from '@/store/useMusicStore'

interface FloatingMusicPlayerProps {
  onClose: () => void
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function repeatLabel(mode: RepeatMode) {
  if (mode === 'all') return zh.companion.repeatAll
  if (mode === 'one') return zh.companion.repeatOne
  return zh.companion.repeatOff
}

function useDrawerScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

export default function FloatingMusicPlayer({ onClose }: FloatingMusicPlayerProps) {
  const playlist = usePlaylist()
  const customIds = useCustomTrackIds()
  const sharedIds = useSharedTrackIds()
  const user = useAuthStore((s) => s.user)
  const admin = isAdmin(user)
  const removeCustomTrack = useUserPrefsStore((s) => s.removeCustomTrack)
  const removeSharedById = useSharedMusicStore((s) => s.removeById)
  const { play: uiPlay } = useUiSound()
  const {
    trackIndex,
    playing,
    volume,
    currentTime,
    duration,
    shuffle,
    repeat,
    setPlaying,
    setVolume,
    requestSeek,
    togglePlaying,
    toggleShuffle,
    cycleRepeat,
    hideTrack,
    clampTrackIndex,
    goNext,
    goPrev,
    setTrackIndex,
  } = useMusicStore()

  useDrawerScrollLock(true)

  useEffect(() => {
    clampTrackIndex(playlist.length)
  }, [playlist.length, clampTrackIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const track = playlist[trackIndex] ?? playlist[0]
  const isAmbient = track?.kind === 'ambient'
  const isLink = track?.kind === 'link'
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleClose = () => {
    uiPlay('click')
    onClose()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    requestSeek(Number(e.target.value))
  }

  const handleRemoveTrack = (trackId: string, index: number) => {
    uiPlay('click')
    const isCustom = customIds.has(trackId)
    const isShared = sharedIds.has(trackId)
    const sharedTrack = isShared ? useSharedMusicStore.getState().tracks.find(
      (t) => `shared-${t.id}` === trackId,
    ) : undefined
    const canDeleteShared = isShared && (admin || (user && sharedTrack?.uploaderId === user.id))

    if (isCustom) {
      removeCustomTrack(trackId)
      if (user) syncUserPrefsToCloud().catch(() => {})
    } else if (canDeleteShared && sharedTrack) {
      sharedMusicApi.remove(sharedTrack.id).then(() => removeSharedById(sharedTrack.id)).catch(() => {})
    } else {
      hideTrack(trackId)
    }
    const nextLength = playlist.length - 1
    if (nextLength <= 0) {
      setPlaying(false)
      setTrackIndex(0)
      return
    }
    if (index < trackIndex) setTrackIndex(trackIndex - 1)
    else if (index === trackIndex) setTrackIndex(Math.min(trackIndex, nextLength - 1))
  }

  if (!track) {
    return createPortal(
      <div className="companion-music-drawer click-particles-ignore">
        <button type="button" className="companion-music-drawer__backdrop cursor-pointer" onClick={handleClose} aria-label={zh.companion.close} />
        <aside className="companion-panel companion-panel--music companion-music-drawer__panel" role="dialog" aria-label={zh.companion.music}>
          <div className="companion-panel__head">
            <h3 className="companion-panel__title">{zh.companion.music}</h3>
            <button type="button" className="companion-panel__close cursor-pointer" onClick={handleClose} aria-label={zh.companion.close}>
              <X size={16} />
            </button>
          </div>
          <p className="companion-panel__empty">{zh.companion.playlistEmpty}</p>
        </aside>
      </div>,
      document.body,
    )
  }

  const panel = (
    <div className="companion-music-drawer click-particles-ignore">
      <button
        type="button"
        className="companion-music-drawer__backdrop cursor-pointer"
        onClick={handleClose}
        aria-label={zh.companion.close}
      />
      <aside
        className="companion-panel companion-panel--music companion-music-drawer__panel"
        role="dialog"
        aria-label={zh.companion.music}
        aria-modal="true"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="companion-panel__head">
          <h3 className="companion-panel__title">{zh.companion.music}</h3>
          <button type="button" className="companion-panel__close cursor-pointer" onClick={handleClose} aria-label={zh.companion.close}>
            <X size={16} />
          </button>
        </div>

        <div className="companion-music">
          <div className="companion-music__body">
            <div className="companion-music__hero">
              <MusicVinyl
                trackId={track.id}
                kind={track.kind}
                cover={track.cover}
                playing={playing && !isLink}
                size="hero"
              />
              <div className="companion-music__meta companion-music__meta--center">
                <p className="companion-music__track">{track.title}</p>
                <p className="companion-music__artist">{track.artist}</p>
                {playing && !isLink && (
                  <div className="companion-music__eq companion-music__eq--center" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                  </div>
                )}
              </div>
            </div>

            {!isAmbient && !isLink && (
              <div className="companion-music__progress">
                <span className="companion-music__time">{formatTime(currentTime)}</span>
                <div className="companion-music__progress-track">
                  <div className="companion-music__progress-fill" style={{ width: `${progressPct}%` }} />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="companion-music__seek"
                    aria-label={zh.companion.seek}
                  />
                </div>
                <span className="companion-music__time">{formatTime(duration)}</span>
              </div>
            )}

            {isAmbient && (
              <p className="companion-music__ambient-hint">{zh.companion.ambientHint}</p>
            )}

            {isLink && track.href && (
              <div className="companion-music__link-block">
                <p className="companion-music__ambient-hint">{zh.companion.linkHint}</p>
                <a
                  href={track.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="companion-music__link-btn cursor-pointer"
                  onClick={() => uiPlay('click')}
                >
                  <ExternalLink size={14} />
                  {zh.companion.openExternalMusic}
                </a>
              </div>
            )}

            {!isLink && (
              <>
                <div className="companion-music__modes">
                  <button
                    type="button"
                    className={`companion-music__mode-btn cursor-pointer ${shuffle ? 'companion-music__mode-btn--active' : ''}`}
                    onClick={() => { uiPlay('click'); toggleShuffle() }}
                    title={zh.companion.shuffle}
                    aria-label={zh.companion.shuffle}
                    aria-pressed={shuffle}
                  >
                    <Shuffle size={15} />
                  </button>
                  <button
                    type="button"
                    className={`companion-music__mode-btn cursor-pointer ${repeat !== 'off' ? 'companion-music__mode-btn--active' : ''}`}
                    onClick={() => { uiPlay('click'); cycleRepeat() }}
                    title={repeatLabel(repeat)}
                    aria-label={repeatLabel(repeat)}
                  >
                    {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
                    {repeat === 'all' && <span className="companion-music__mode-dot" />}
                  </button>
                </div>

                <div className="companion-music__controls">
                  <button type="button" className="companion-music__btn cursor-pointer" onClick={() => { uiPlay('click'); goPrev(playlist.length) }} aria-label={zh.companion.prev}>
                    <SkipBack size={16} />
                  </button>
                  <button
                    type="button"
                    className="companion-music__btn companion-music__btn--main cursor-pointer"
                    onClick={() => { uiPlay('click'); togglePlaying() }}
                    aria-label={playing ? zh.companion.pause : zh.companion.play}
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button type="button" className="companion-music__btn cursor-pointer" onClick={() => { uiPlay('click'); goNext(playlist.length) }} aria-label={zh.companion.next}>
                    <SkipForward size={16} />
                  </button>
                </div>
              </>
            )}

            {!isLink && (
              <div className="companion-music__volume">
                <button
                  type="button"
                  className="companion-music__btn cursor-pointer"
                  onClick={() => { uiPlay('click'); setVolume(volume > 0 ? 0 : 0.45) }}
                  aria-label={volume > 0 ? zh.companion.mute : zh.companion.unmute}
                >
                  {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="companion-music__seek"
                  aria-label={zh.companion.volume}
                />
              </div>
            )}
          </div>

          <div className="companion-music__playlist">
            <p className="companion-music__playlist-label">{zh.companion.playlist}</p>
            <div className="companion-music__playlist-scroll">
              {playlist.map((t, i) => (
                <div
                  key={t.id}
                  className={`companion-music__track-row ${i === trackIndex ? 'companion-music__track-row--active' : ''}`}
                >
                  <button
                    type="button"
                    className={`companion-music__track-btn cursor-pointer ${i === trackIndex ? 'companion-music__track-btn--active' : ''}`}
                    onClick={() => {
                      uiPlay('click')
                      setTrackIndex(i)
                      if (t.kind === 'link' && t.href) {
                        window.open(t.href, '_blank', 'noopener,noreferrer')
                        setPlaying(false)
                      } else {
                        setPlaying(true)
                      }
                    }}
                  >
                    <span className="companion-music__track-index">
                      <TrackThumb
                        trackId={t.id}
                        kind={t.kind}
                        cover={t.cover}
                        playing={i === trackIndex && playing}
                        active={i === trackIndex}
                      />
                    </span>
                    <span className="companion-music__track-info">
                      <span>{t.title}</span>
                      <span className="companion-music__track-meta">{t.artist}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="companion-music__track-remove cursor-pointer"
                    onClick={() => handleRemoveTrack(t.id, i)}
                    aria-label={zh.companion.removeTrack}
                    title={zh.companion.removeTrack}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="button" className="companion-panel__collapse companion-music-drawer__collapse cursor-pointer" onClick={handleClose}>
          <ChevronRight size={14} />
          {zh.companion.collapseKeepPlaying}
        </button>
      </aside>
    </div>
  )

  return createPortal(panel, document.body)
}

export function MusicMiniToggle() {
  const playlist = usePlaylist()
  const { playing, togglePlaying, trackIndex, setPlaying } = useMusicStore()
  const { play } = useUiSound()
  const track = playlist[trackIndex] ?? playlist[0]
  const isLink = track?.kind === 'link'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    play('click')
    if (!track) return
    if (isLink && track.href) {
      window.open(track.href, '_blank', 'noopener,noreferrer')
      return
    }
    if (!playing && !isLink) {
      setPlaying(true)
    } else {
      togglePlaying()
    }
  }

  if (!track) return null

  return (
    <button
      type="button"
      className={`companion-dock__btn companion-dock__btn--now-playing cursor-pointer ${playing && !isLink ? 'companion-dock__btn--active companion-dock__btn--playing' : ''}`}
      onClick={handleClick}
      title={isLink ? zh.companion.openNetease : (playing ? zh.companion.pause : zh.companion.play)}
      aria-label={isLink ? zh.companion.openNetease : (playing ? zh.companion.pause : zh.companion.play)}
    >
      {isLink ? (
        <ExternalLink size={16} />
      ) : playing ? (
        <>
          <Pause size={16} />
          <span className="companion-dock__eq" aria-hidden="true">
            <span /><span /><span />
          </span>
        </>
      ) : (
        <Play size={16} />
      )}
      <span className="companion-dock__btn-label">{track.title}</span>
    </button>
  )
}
