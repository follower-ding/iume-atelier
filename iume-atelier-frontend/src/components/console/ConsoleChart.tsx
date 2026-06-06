import type { ReactNode } from 'react'
import type { TrendPoint } from '@/api'
import { zh } from '@/locales/zh'

interface ConsoleTrendChartProps {
  title: string
  data: TrendPoint[]
  color?: string
}

export default function ConsoleTrendChart({ title, data, color = '#6366f1' }: ConsoleTrendChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="console-chart" data-testid="console-trend-chart">
      <h3 className="console-chart__title">{title}</h3>
      <div className="console-chart__bars">
        {data.map((point) => (
          <div key={point.date} className="console-chart__bar-wrap" title={`${point.date}: ${point.count}`}>
            <div
              className="console-chart__bar"
              style={{ height: `${(point.count / max) * 100}%`, background: color }}
            />
            <span className="console-chart__label">{point.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConsoleBatchBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: ReactNode
}) {
  if (count <= 0) return null
  return (
    <div className="console-batch-bar" data-testid="console-batch-bar">
      <span>{zh.console.batchSelected.replace('{n}', String(count))}</span>
      <div className="console-batch-bar__actions">{children}</div>
      <button type="button" className="btn-ghost cursor-pointer" onClick={onClear}>
        {zh.console.batchClear}
      </button>
    </div>
  )
}
