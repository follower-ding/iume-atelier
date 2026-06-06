import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface UseLongPressOptions {
  delay?: number
  moveThreshold?: number
}

export function useLongPress(onLongPress: () => void, options: UseLongPressOptions = {}) {
  const { delay = 550, moveThreshold = 10 } = options
  const timerRef = useRef(0)
  const originRef = useRef({ x: 0, y: 0 })
  const firedRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = 0
  }, [])

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    firedRef.current = false
    originRef.current = { x: e.clientX, y: e.clientY }
    clear()
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true
      onLongPress()
    }, delay)
  }, [clear, delay, onLongPress])

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (!timerRef.current) return
    const dx = e.clientX - originRef.current.x
    const dy = e.clientY - originRef.current.y
    if (Math.hypot(dx, dy) > moveThreshold) clear()
  }, [clear, moveThreshold])

  const onPointerUp = useCallback(() => clear(), [clear])
  const onPointerCancel = useCallback(() => clear(), [clear])

  const consumeLongPress = useCallback(() => {
    if (!firedRef.current) return false
    firedRef.current = false
    return true
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    consumeLongPress,
  }
}
