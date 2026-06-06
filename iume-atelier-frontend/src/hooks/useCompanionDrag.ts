import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useCompanionStore, type CompanionPosition } from '@/store'

const DOCK_W = 108
const DOCK_H = 148
const PANEL_W = 320

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function defaultCompanionPosition(): CompanionPosition {
  if (typeof window === 'undefined') return { x: 16, y: 16 }
  return {
    x: Math.max(16, window.innerWidth - DOCK_W - 20),
    y: Math.max(16, window.innerHeight - DOCK_H - 88),
  }
}

export function sanitizeCompanionPosition(p: CompanionPosition): CompanionPosition {
  if (typeof window === 'undefined') return p
  const maxX = Math.max(8, window.innerWidth - DOCK_W - 8)
  const maxY = Math.max(8, window.innerHeight - DOCK_H - 8)
  const sane = {
    x: clamp(p.x, 8, maxX),
    y: clamp(p.y, 8, maxY),
  }
  // 坐标异常（换屏、旧数据）时回退默认右下角
  if (
    !Number.isFinite(p.x)
    || !Number.isFinite(p.y)
    || p.x > window.innerWidth
    || p.y > window.innerHeight
    || p.x < -DOCK_W
    || p.y < -DOCK_H
  ) {
    return defaultCompanionPosition()
  }
  return sane
}

export function panelPositionStyle(
  dock: CompanionPosition,
  panelHeight = 380,
): CSSProperties {
  const panelWidth = Math.min(PANEL_W, window.innerWidth - 16)
  const left = clamp(
    dock.x + DOCK_W - panelWidth,
    8,
    window.innerWidth - panelWidth - 8,
  )
  const top = clamp(dock.y - panelHeight - 8, 8, window.innerHeight - panelHeight - 8)
  return {
    position: 'fixed',
    left,
    top,
    width: panelWidth,
    zIndex: 39,
    maxHeight: `min(24rem, ${window.innerHeight - top - 16}px)`,
  }
}

export function useCompanionDrag() {
  const position = useCompanionStore((s) => s.position)
  const setPosition = useCompanionStore((s) => s.setPosition)
  const resetPosition = useCompanionStore((s) => s.resetPosition)
  const [dragging, setDragging] = useState(false)
  const movedRef = useRef(false)
  const originRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 })

  const applyPosition = useCallback((next: CompanionPosition | null) => {
    if (next == null) {
      setPosition(defaultCompanionPosition())
      return
    }
    setPosition(sanitizeCompanionPosition(next))
  }, [setPosition])

  useEffect(() => {
    const init = () => {
      const p = useCompanionStore.getState().position
      applyPosition(p)
    }
    init()
    const unsub = useCompanionStore.persist?.onFinishHydration?.(() => init())
    return () => unsub?.()
  }, [applyPosition])

  useEffect(() => {
    const onResize = () => {
      const p = useCompanionStore.getState().position
      if (!p) return
      applyPosition(p)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [applyPosition])

  const onDragStart = useCallback((e: ReactPointerEvent) => {
    const p = useCompanionStore.getState().position ?? defaultCompanionPosition()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    movedRef.current = false
    originRef.current = { px: e.clientX, py: e.clientY, ox: p.x, oy: p.y }
  }, [])

  const onDragMove = useCallback((e: ReactPointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - originRef.current.px
    const dy = e.clientY - originRef.current.py
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true
    applyPosition({
      x: originRef.current.ox + dx,
      y: originRef.current.oy + dy,
    })
  }, [dragging, applyPosition])

  const onDragEnd = useCallback(() => {
    setDragging(false)
  }, [])

  const consumeDragClick = useCallback(() => {
    if (movedRef.current) {
      movedRef.current = false
      return true
    }
    return false
  }, [])

  const resolved = position ?? defaultCompanionPosition()
  const style: CSSProperties = {
    left: resolved.x,
    top: resolved.y,
    right: 'auto',
    bottom: 'auto',
  }

  const dragHandleProps = {
    onPointerDown: onDragStart,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragEnd,
  }

  return {
    style,
    position,
    dragging,
    dragHandleProps,
    consumeDragClick,
    resetPosition: () => resetPosition(defaultCompanionPosition()),
  }
}
