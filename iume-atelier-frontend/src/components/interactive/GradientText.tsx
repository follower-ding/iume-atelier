import type { ReactNode } from 'react'
import clsx from 'clsx'

interface GradientTextProps {
  children: ReactNode
  as?: 'span' | 'h1' | 'h2' | 'p'
  className?: string
  animate?: boolean
}

export default function GradientText({ children, as: Tag = 'span', className, animate = true }: GradientTextProps) {
  return (
    <Tag className={clsx(animate ? 'text-gradient-animated' : 'text-gradient', className)}>
      {children}
    </Tag>
  )
}
