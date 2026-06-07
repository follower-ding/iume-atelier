import { useEffect, useMemo, useState } from 'react'
import { Copy, Music2, Trash2 } from 'lucide-react'
import { mediaApi, sharedMusicApi, type MediaAsset } from '@/api'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'
import { zh } from '@/locales/zh'

const PAGE_SIZE = 20

function normalizeSrc(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname
  } catch {
    return url.trim()
  }
}

export default function ConsoleMediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<number | null>(null)
  const [publishing, setPublishing] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  const fetchShared = useSharedMusicStore((s) => s.fetch)
  const upsertTrack = useSharedMusicStore((s) => s.upsertTrack)

  const sharedSrcSet = useMemo(
    () => new Set(sharedTracks.map((t) => normalizeSrc(t.src))),
    [sharedTracks],
  )

  const load = () => {
    setLoading(true)
    mediaApi.list(page, PAGE_SIZE)
      .then((res) => { setItems(res.records); setTotal(res.total) })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])
  useEffect(() => { fetchShared().catch(() => {}) }, [fetchShared])

  const copyUrl = async (asset: MediaAsset) => {
    await navigator.clipboard.writeText(asset.publicUrl)
    setCopied(asset.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const remove = async (id: number) => {
    if (!confirm(zh.console.mediaDeleteConfirm)) return
    await mediaApi.remove(id)
    load()
  }

  const publishToShared = async (asset: MediaAsset) => {
    setPublishing(asset.id)
    setMsg('')
    try {
      const track = await sharedMusicApi.createFromMedia(asset.id)
      upsertTrack(track)
      setMsg(zh.console.sharedMusicAdded)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.prefsSyncFailed)
    } finally {
      setPublishing(null)
    }
  }

  const isAudioInShared = (asset: MediaAsset) =>
    asset.contentType.startsWith('audio/') && sharedSrcSet.has(normalizeSrc(asset.publicUrl))

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header">
        <h1>{zh.console.media}</h1>
        <p>{zh.console.mediaDesc}</p>
      </header>

      {msg && <p className="text-sm text-accent mb-4">{msg}</p>}

      <div className="console-table-wrap console-table-wrap--fill">
        <table className="console-table">
          <thead>
            <tr>
              <th>{zh.console.mediaPreview}</th>
              <th>{zh.console.mediaName}</th>
              <th>{zh.console.mediaType}</th>
              <th>{zh.console.mediaSize}</th>
              <th>{zh.console.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="console-table__empty">{zh.articles.loading}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="console-table__empty">{zh.console.mediaEmpty}</td></tr>
            ) : items.map((asset) => (
              <tr key={asset.id}>
                <td>
                  {asset.contentType.startsWith('image/') ? (
                    <img src={asset.publicUrl} alt="" className="console-media-thumb" loading="lazy" />
                  ) : (
                    <span className="console-badge">audio</span>
                  )}
                </td>
                <td className="console-table__col-title">{asset.originalName || asset.storedName}</td>
                <td><code className="console-code">{asset.contentType}</code></td>
                <td>{(asset.sizeBytes / 1024).toFixed(1)} KB</td>
                <td>
                  <div className="console-row-actions">
                    {asset.contentType.startsWith('audio/') && (
                      <button
                        type="button"
                        className={`console-icon-btn cursor-pointer${isAudioInShared(asset) ? ' console-icon-btn--active' : ''}`}
                        onClick={() => publishToShared(asset)}
                        disabled={isAudioInShared(asset) || publishing === asset.id}
                        title={isAudioInShared(asset) ? zh.console.sharedMusicPublished : zh.console.sharedMusicPublish}
                      >
                        <Music2 size={15} />
                      </button>
                    )}
                    <button type="button" className="console-icon-btn cursor-pointer" onClick={() => copyUrl(asset)} title={zh.console.mediaCopy}>
                      <Copy size={15} />
                    </button>
                    {copied === asset.id && <span className="text-xs text-accent">{zh.aiTools.copied}</span>}
                    <button type="button" className="console-icon-btn console-icon-btn--danger cursor-pointer" onClick={() => remove(asset.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="console-pagination">
          <button type="button" className="console-pagination__btn cursor-pointer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{zh.articles.prevPage}</button>
          <span>{page} / {totalPages}</span>
          <button type="button" className="console-pagination__btn cursor-pointer" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>{zh.articles.nextPage}</button>
        </div>
      )}
    </div>
  )
}
