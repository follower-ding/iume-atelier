import { CloudRain, Disc3, ExternalLink, Music2 } from 'lucide-react'
import type { PlaylistTrackKind } from '@/data/playlist'
import { getTrackArt } from '@/data/musicCovers'

interface MusicVinylProps {
  trackId: string
  kind: PlaylistTrackKind
  cover?: string
  playing?: boolean
  size?: 'hero' | 'thumb'
  className?: string
}

function KindIcon({ kind, size }: { kind: PlaylistTrackKind; size: number }) {
  if (kind === 'ambient') return <CloudRain size={size} strokeWidth={1.5} />
  if (kind === 'link') return <ExternalLink size={size} strokeWidth={1.5} />
  return <Disc3 size={size} strokeWidth={1.5} />
}

export default function MusicVinyl({
  trackId,
  kind,
  cover,
  playing = false,
  size = 'hero',
  className = '',
}: MusicVinylProps) {
  const art = getTrackArt({ id: trackId, kind, cover })
  const isHero = size === 'hero'
  const iconSize = isHero ? 22 : 12

  return (
    <div
      className={`music-vinyl music-vinyl--${size} ${playing ? 'music-vinyl--spinning' : ''} ${className}`.trim()}
      aria-hidden={isHero ? undefined : true}
    >
      <div className="music-vinyl__disc">
        <span className="music-vinyl__rim" />
        <span className="music-vinyl__groove music-vinyl__groove--1" />
        <span className="music-vinyl__groove music-vinyl__groove--2" />
        <div
          className="music-vinyl__label"
          style={art.cover ? undefined : { background: art.gradient }}
        >
          {art.cover ? (
            <img src={art.cover} alt="" className="music-vinyl__cover" loading="lazy" />
          ) : (
            <span className="music-vinyl__fallback">
              <KindIcon kind={kind} size={iconSize} />
            </span>
          )}
        </div>
        <span className="music-vinyl__spindle" />
      </div>
      {isHero && playing && (
        <span className="music-vinyl__tonearm" aria-hidden="true" />
      )}
    </div>
  )
}

export function TrackThumb({
  trackId,
  kind,
  cover,
  playing,
  active,
}: {
  trackId: string
  kind: PlaylistTrackKind
  cover?: string
  playing?: boolean
  active?: boolean
}) {
  const art = getTrackArt({ id: trackId, kind, cover })

  return (
    <span className={`music-track-thumb ${active ? 'music-track-thumb--active' : ''}`}>
      {active && playing ? (
        <Music2 size={12} className="music-track-thumb__icon" />
      ) : (
        <span
          className="music-track-thumb__art"
          style={art.cover ? { backgroundImage: `url(${art.cover})` } : { background: art.gradient }}
        />
      )}
    </span>
  )
}
