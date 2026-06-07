import { useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, Music2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mediaApi, type MediaAsset } from '@/api'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'
import { normalizeMusicSrc, publishMediaToShared } from '@/utils/sharedMusic'
import { zh } from '@/locales/zh'

const PAGE_SIZE = 20

export default function ConsoleMediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<number | null>(null)
  const [publishing, setPublishing] = useState<number | null>(null)
  const [batchPublishing, setBatchPublishing] = useState(false)
  const [msg, setMsg] = useState('')

  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  const fetchShared = useSharedMusicStore((s) => s.fetch)
  const upsertTrack = useSharedMusicStore((s) => s.upsertTrack)

  const sharedSrcSet = useMemo(
    () => new Set(sharedTracks.map((t) => normalizeMusicSrc(t.src))),
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

  const isAudioInShared = (asset: MediaAsset) =>
    asset.contentType.startsWith('audio/') && sharedSrcSet.has(normalizeMusicSrc(asset.publicUrl))

  const publishToShared = async (asset: MediaAsset) => {
    if (isAudioInShared(asset)) return
    setPublishing(asset.id)
    setMsg('')
    try {
      const track = await publishMediaToShared(asset)
      upsertTrack(track)
      setMsg(zh.console.sharedMusicAdded)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.prefsSyncFailed)
    } finally {
      setPublishing(null)
    }
  }

  const publishAllAudio = async () => {
    setBatchPublishing(true)
    setMsg('')
    const seenSrc = new Set(sharedSrcSet)
    let added = 0
    let p = 1
    try {
      while (true) {
        const res = await mediaApi.list(p, 50)
        const candidates = res.records.filter(
          (a) => a.contentType.startsWith('audio/') && !seenSrc.has(normalizeMusicSrc(a.publicUrl)),
        )
        for (const asset of candidates) {
          try {
            const track = await publishMediaToShared(asset)
            upsertTrack(track)
            seenSrc.add(normalizeMusicSrc(asset.publicUrl))
            added++
          } catch {
            // 可能已被他人加入或重复 URL
          }
        }
        if (p * 50 >= res.total) break
        p++
      }
      setMsg(zh.console.sharedMusicBatchAdded.replace('{count}', String(added)))
      await fetchShared()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.prefsSyncFailed)
    } finally {
      setBatchPublishing(false)
    }
  }

  const pendingAudioCount = items.filter(
    (a) => a.contentType.startsWith('audio/') && !isAudioInShared(a),
  ).length

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.media}</h1>
          <p>{zh.console.mediaDesc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
            onClick={publishAllAudio}
            disabled={batchPublishing}
          >
            {batchPublishing ? <Loader2 size={16} className="animate-spin" /> : <Music2 size={16} />}
            {zh.console.sharedMusicBatchPublish}
          </button>
          <Link to="/console/shared-music" className="btn-ghost cursor-pointer">
            {zh.console.sharedMusicGoManage}
          </Link>
        </div>
      </header>

      {msg && <p className="text-sm text-accent mb-4">{msg}</p>}
      {pendingAudioCount > 0 && (
        <p className="text-sm text-secondary mb-4">
          {zh.console.sharedMusicPendingHint.replace('{count}', String(pendingAudioCount))}
        </p>
      )}

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
                        className={`console-text-btn cursor-pointer${isAudioInShared(asset) ? ' console-text-btn--muted' : ''}`}
                        onClick={() => publishToShared(asset)}
                        disabled={isAudioInShared(asset) || publishing === asset.id || batchPublishing}
                        title={isAudioInShared(asset) ? zh.console.sharedMusicPublished : zh.console.sharedMusicPublish}
                      >
                        {publishing === asset.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Music2 size={14} />
                        )}
                        <span>{isAudioInShared(asset) ? zh.console.sharedMusicPublished : zh.console.sharedMusicPublishBtn}</span>
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
