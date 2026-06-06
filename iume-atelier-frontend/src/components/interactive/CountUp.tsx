import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface CountUpProps {
  value: string
  duration?: number
  className?: string
}

function parseValue(raw: string): { num: number; prefix: string; suffix: string } | null {
  const match = raw.match(/^([^0-9]*)([0-9][0-9,]*)(.*)$/)
  if (!match) return null
  return {
    prefix: match[1],
    num: Number(match[2].replace(/,/g, '')),
    suffix: match[3],
  }
}

export default function CountUp({ value, duration = 1200, className }: CountUpProps) {
  const { ref, visible } = useInView()
  const parsed = parseValue(value)
  const [display, setDisplay] = useState(parsed ? '0' : value)

  useEffect(() => {
    if (!visible || !parsed) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      setDisplay(Math.round(parsed.num * eased).toLocaleString())
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, parsed, duration])

  if (!parsed) {
    return <span className={className}>{value}</span>
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}{display}{parsed.suffix}
    </span>
  )
}
