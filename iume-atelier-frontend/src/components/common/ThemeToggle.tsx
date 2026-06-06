import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useUiSound } from '@/hooks/useUiSound'
import { useThemeStore } from '@/store'
import { zh } from '@/locales/zh'

interface ThemeToggleProps {
  showLabel?: boolean
}

export default function ThemeToggle({ showLabel }: ThemeToggleProps) {
  const { theme, toggle, setTheme } = useThemeStore()
  const { play } = useUiSound()

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  const label = theme === 'light' ? zh.theme.dark : zh.theme.light

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    play('toggle')
    toggle(e)
  }

  const btnClass = showLabel
    ? 'inline-flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer transition-colors duration-200 hover:text-accent'
    : 'header-icon-btn'

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      className={btnClass}
    >
      <span
        className="inline-block transition-transform duration-500"
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        key={theme}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="animate-spin-slow" />}
      </span>
      {showLabel && <span className="nav-link">{label}</span>}
    </button>
  )
}
