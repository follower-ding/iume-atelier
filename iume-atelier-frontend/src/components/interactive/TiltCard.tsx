import type { CSSProperties, ReactNode } from 'react'
import clsx from 'clsx'
import { useTilt } from '@/hooks/useTilt'

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  maxTilt?: number
  glow?: boolean
}

export default function TiltCard({ children, className, style, maxTilt = 8, glow }: TiltCardProps) {
  const { ref, onMove, onLeave } = useTilt(maxTilt)

  return (
    <div
      ref={ref}
      className={clsx('tilt-card', glow && 'tilt-card--glow', className)}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="tilt-card__shine" aria-hidden="true" />
      {children}
    </div>
  )
}
