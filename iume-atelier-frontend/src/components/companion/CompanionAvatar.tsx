import { useTilt } from '@/hooks/useTilt'
import type { CompanionMood } from '@/store/useCompanionStore'
import { resolveAssetUrl } from '@/utils/user'

interface CompanionAvatarProps {
  avatarUrl?: string | null
  displayName?: string
  mood?: CompanionMood
  playing?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  dragHandleProps?: Record<string, unknown>
}

export default function CompanionAvatar({
  avatarUrl,
  displayName = '你',
  mood = 'idle',
  playing = false,
  onClick,
  onDoubleClick,
  dragHandleProps,
}: CompanionAvatarProps) {
  const { ref, onMove, onLeave } = useTilt(10)
  const photo = resolveAssetUrl(avatarUrl)
  const initial = (displayName || '?').trim()[0]?.toUpperCase() || '?'

  return (
    <button
      type="button"
      className={[
        'companion-avatar',
        'companion-avatar--photo',
        `companion-avatar--${mood}`,
        playing ? 'companion-avatar--playing' : '',
        'cursor-grab',
      ].join(' ')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label="个人陪伴头像"
      title={dragHandleProps ? '拖动陪伴 · 点击说话 · 双击重置位置' : undefined}
      {...dragHandleProps}
    >
      <div
        ref={ref}
        className="companion-avatar__inner"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="companion-avatar__stage">
          <span className="companion-avatar__aura" aria-hidden="true" />
          <span className="companion-avatar__ring companion-avatar__ring--1" />
          <span className="companion-avatar__ring companion-avatar__ring--2" />

          {playing && (
            <>
              <span className="companion-avatar__note companion-avatar__note--1" aria-hidden="true">♪</span>
              <span className="companion-avatar__note companion-avatar__note--2" aria-hidden="true">♫</span>
              <span className="companion-avatar__headphones" aria-hidden="true" />
            </>
          )}

          <div className="companion-avatar__photo-shell">
            {photo ? (
              <img src={photo} alt="" className="companion-avatar__photo" draggable={false} />
            ) : (
              <span className="companion-avatar__fallback">{initial}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
