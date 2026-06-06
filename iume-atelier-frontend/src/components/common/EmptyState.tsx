import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  icon?: ReactNode
}

export default function EmptyState({ title, description, actionLabel, actionTo, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__desc">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-secondary cursor-pointer mt-6 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
