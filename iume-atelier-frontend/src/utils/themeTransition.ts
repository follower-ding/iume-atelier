export function runThemeTransition(update: () => void, event?: { clientX: number; clientY: number }) {
  if (typeof document.startViewTransition !== 'function') {
    update()
    return
  }

  const x = event?.clientX ?? window.innerWidth / 2
  const y = event?.clientY ?? window.innerHeight / 2
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${radius}px`)

  document.startViewTransition(update)
}
