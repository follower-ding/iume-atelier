import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { Tag } from '@/types/api'

interface FloatingTagCloudProps {
  tags: Tag[]
  activeTagId?: number
}

interface CircleSlot {
  cx: number
  cy: number
  r: number
}

const ANCHORS = [
  { cx: 28, cy: 10 },
  { cx: 74, cy: 24 },
  { cx: 20, cy: 40 },
  { cx: 80, cy: 54 },
  { cx: 48, cy: 66 },
  { cx: 22, cy: 80 },
  { cx: 76, cy: 92 },
  { cx: 52, cy: 18 },
  { cx: 36, cy: 58 },
  { cx: 64, cy: 74 },
]

function hashSeed(id: number) {
  let h = id * 2654435761
  h ^= h >>> 16
  h = Math.imul(h, 2246822519)
  h ^= h >>> 13
  return h >>> 0
}

function tagHitDiameterRem(name: string) {
  return 2.2 + Math.min(name.length * 0.1, 0.6)
}

function layoutRadius(name: string) {
  return 11 + Math.min(name.length * 0.7, 5)
}

function circlesOverlap(a: CircleSlot, b: CircleSlot, gap = 4) {
  const dx = a.cx - b.cx
  const dy = a.cy - b.cy
  return Math.hypot(dx, dy) < a.r + b.r + gap
}

function scatterLayout(tags: Tag[]) {
  const placed: CircleSlot[] = []

  return tags.map((tag, i) => {
    const seed = hashSeed(tag.id)
    const anchor = ANCHORS[i % ANCHORS.length]
    const r = layoutRadius(tag.name)
    const hitDiameter = tagHitDiameterRem(tag.name)

    let cx = Math.min(86, Math.max(14, anchor.cx + ((seed % 60) - 30) / 10))
    let cy = Math.min(94, Math.max(8, anchor.cy + (((seed >> 8) % 50) - 25) / 10))
    let attempt = 0

    while (attempt < 24 && placed.some((p) => circlesOverlap({ cx, cy, r }, p, 7))) {
      const s = hashSeed(tag.id + attempt * 7919)
      cx = Math.min(86, Math.max(14, anchor.cx + ((s % 50) - 25) / 10))
      cy = Math.min(94, Math.max(8, anchor.cy + (((s >> 8) % 40) - 20) / 10))
      attempt++
    }

    placed.push({ cx, cy, r })

    const depth = 0.6 + ((seed >> 5) % 35) / 100
    const floatDelay = ((seed >> 12) % 2800) / 1000
    const floatDuration = 3.2 + ((seed >> 18) % 1800) / 1000

    return {
      tag,
      cx,
      cy,
      hitDiameter,
      depth,
      floatDelay,
      floatDuration,
      zIndex: 5 + Math.round(depth * 10) + (i % 3),
    }
  })
}

export default function FloatingTagCloud({ tags, activeTagId }: FloatingTagCloudProps) {
  const layout = useMemo(() => scatterLayout(tags), [tags])

  if (tags.length === 0) return null

  const minHeight = Math.max(13, tags.length * 2.6)

  return (
    <div className="floating-tag-cloud" style={{ minHeight: `${minHeight}rem` }}>
      {layout.map(({ tag, cx, cy, hitDiameter, depth, floatDelay, floatDuration, zIndex }) => (
        <div
          key={tag.id}
          className="floating-tag-cloud__node"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            zIndex,
            animationDelay: `${floatDelay}s`,
            animationDuration: `${floatDuration}s`,
          }}
        >
          <Link
            to={`/articles?tag=${tag.id}`}
            className={`floating-tag-cloud__hit click-particles-ignore ${activeTagId === tag.id ? 'floating-tag-cloud__hit--active' : ''}`}
            style={{
              width: `${hitDiameter}rem`,
              height: `${hitDiameter}rem`,
            }}
            aria-label={tag.name}
          />
          <span
            className="floating-tag-cloud__tag"
            style={{
              opacity: 0.65 + depth * 0.35,
              fontSize: `${0.62 + depth * 0.16}rem`,
            }}
          >
            {tag.name}
          </span>
        </div>
      ))}
    </div>
  )
}
