import { useEffect, useState } from 'react'

export function useActiveTocItem(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    if (!ids.length) {
      setActiveId('')
      return
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
          return
        }

        const scrollY = window.scrollY + 120
        let current = ids[0]
        for (const el of elements) {
          if (el.offsetTop <= scrollY) current = el.id
        }
        setActiveId(current)
      },
      { rootMargin: '-12% 0px -68% 0px', threshold: [0, 0.1, 0.5, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids.join('|')])

  return activeId
}
