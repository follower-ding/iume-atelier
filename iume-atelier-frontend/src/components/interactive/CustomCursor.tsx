import { useEffect, useRef, useState } from 'react'
import { useCursorStyleStore } from '@/store/useCursorStyleStore'
import { useUiSound } from '@/hooks/useUiSound'

const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], .key-cap, .character-card'

export default function CustomCursor() {
  const style = useCursorStyleStore((s) => s.style)
  const rootRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const frame = useRef(0)
  const { play } = useUiSound()

  useEffect(() => {
    document.documentElement.dataset.cursorStyle = style
  }, [style])

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduced) return

    setActive(true)
    document.documentElement.classList.add('custom-cursor-on')

    const moveCursor = (x: number, y: number) => {
      pos.current = { x, y }
      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      const el = document.elementFromPoint(x, y)
      const hovering = !!el?.closest(INTERACTIVE)
      document.documentElement.classList.toggle('cursor-hovering', hovering)
    }

    const onMove = (e: MouseEvent) => moveCursor(e.clientX, e.clientY)

    const onDown = () => {
      document.documentElement.classList.add('cursor-clicking')
      play('click')
    }
    const onUp = () => document.documentElement.classList.remove('cursor-clicking')

    const tick = () => {
      const lag = style === 'minimal' ? 0.16 : style === 'ink' ? 0.14 : 0.11
      ring.current.x += (pos.current.x - ring.current.x) * lag
      ring.current.y += (pos.current.y - ring.current.y) * lag
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`
      }
      frame.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    frame.current = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('custom-cursor-on', 'cursor-clicking', 'cursor-hovering')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(frame.current)
    }
  }, [play, style])

  if (!active) return null

  return (
    <>
      <div ref={ringRef} className="custom-cursor custom-cursor--trail" aria-hidden="true">
        <span className="custom-cursor__trail-ring" />
      </div>
      <div ref={rootRef} className="custom-cursor custom-cursor--main" aria-hidden="true">
        <span className="custom-cursor__glow" />
        <span className="custom-cursor__orbit" />
        <span className="custom-cursor__core" />
        <span className="custom-cursor__ink" />
        <span className="custom-cursor__caret" />
        <span className="custom-cursor__spark custom-cursor__spark--1">✦</span>
        <span className="custom-cursor__spark custom-cursor__spark--2">·</span>
      </div>
    </>
  )
}
