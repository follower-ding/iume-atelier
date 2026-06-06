const SHAPES = ['✦', '◇', '◆', '○', '△', '☆'] as const

interface FloatingDecorProps {
  count?: number
  className?: string
}

export default function FloatingDecor({ count = 6, className }: FloatingDecorProps) {
  return (
    <div className={`floating-decor ${className ?? ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="floating-decor__item"
          style={{
            left: `${8 + (i * 17) % 84}%`,
            top: `${12 + (i * 23) % 70}%`,
            animationDelay: `${i * -2.4}s`,
            animationDuration: `${14 + (i % 4) * 3}s`,
          }}
        >
          {SHAPES[i % SHAPES.length]}
        </span>
      ))}
    </div>
  )
}
