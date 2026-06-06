import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
  as?: 'span' | 'p' | 'h1'
}

export default function TypewriterText({
  text,
  className,
  speed = 55,
  delay = 400,
  as: Tag = 'span',
}: TypewriterTextProps) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplay('')
    setDone(false)
    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const start = setTimeout(() => {
      const tick = () => {
        i += 1
        setDisplay(text.slice(0, i))
        if (i >= text.length) {
          setDone(true)
          return
        }
        timer = setTimeout(tick, speed)
      }
      tick()
    }, delay)

    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [text, speed, delay])

  return (
    <Tag className={className}>
      {display}
      {!done && <span className="typewriter-cursor" aria-hidden="true">|</span>}
    </Tag>
  )
}
