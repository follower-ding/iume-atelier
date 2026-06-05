import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { articleApi } from '@/api'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

export default function NavSearch() {
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      setLoading(true)
      articleApi.search(keyword.trim(), 1, 6)
        .then((res) => setResults(res.records))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const goToArticle = (slug: string) => {
    setOpen(false)
    setMobileOpen(false)
    setKeyword('')
    navigate(`/article/${slug}`)
  }

  const goToSearchResults = () => {
    if (!keyword.trim()) return
    setOpen(false)
    setMobileOpen(false)
    navigate(`/articles?q=${encodeURIComponent(keyword.trim())}`)
    setKeyword('')
  }

  const dropdown = open && keyword.trim() && (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden z-50">
      {loading ? (
        <p className="px-4 py-3 text-sm text-zinc-500">搜索中…</p>
      ) : results.length > 0 ? (
        <>
          <ul>
            {results.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => goToArticle(a.slug)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <div className="font-medium text-sm line-clamp-1">{a.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{a.summary}</div>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={goToSearchResults}
            className="w-full px-4 py-2.5 text-xs text-accent hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
          >
            查看全部结果 →
          </button>
        </>
      ) : (
        <p className="px-4 py-3 text-sm text-zinc-500">{zh.search.noResults}</p>
      )}
    </div>
  )

  const searchInput = (
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={15} />
      <input
        type="search"
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); goToSearchResults() }
          if (e.key === 'Escape') { setOpen(false); setKeyword('') }
        }}
        placeholder={zh.search.placeholder}
        className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/60 py-2 pl-9 pr-8 text-sm outline-none transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
      />
      {keyword && (
        <button
          type="button"
          onClick={() => { setKeyword(''); setResults([]); setOpen(false) }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          aria-label="清除"
        >
          <X size={14} />
        </button>
      )}
      {dropdown}
    </div>
  )

  return (
    <div ref={wrapRef} className="flex items-center flex-1 min-w-0 lg:max-w-md lg:mx-4">
      <div className="hidden lg:flex flex-1 w-full">{searchInput}</div>

      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
        aria-label={zh.nav.search}
      >
        <Search size={18} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-4 top-[4.5rem] z-50">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-3 shadow-xl">
            {searchInput}
          </div>
        </div>
      )}
    </div>
  )
}
