import { useEffect, useState } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { sharedMusicApi, uploadApi, type SharedMusicTrack } from '@/api'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'
import { useAuthStore } from '@/store'
import { stripAudioExt } from '@/utils/sharedMusic'
import { zh } from '@/locales/zh'

export default function ConsoleSharedMusicPage() {
  const user = useAuthStore((s) => s.user)
  const tracks = useSharedMusicStore((s) => s.tracks)
  const fetchShared = useSharedMusicStore((s) => s.fetch)
  const upsertTrack = useSharedMusicStore((s) => s.upsertTrack)
  const removeById = useSharedMusicStore((s) => s.removeById)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [msg, setMsg] = useState('')

  const displayName = user?.nickname || user?.username || 'Admin'

  useEffect(() => {
    fetchShared()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [fetchShared])

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setMsg('')
    let ok = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`${i + 1} / ${files.length}`)
        const { url, filename } = await uploadApi.uploadAudio(file)
        const track = await sharedMusicApi.create({
          title: stripAudioExt(filename || file.name),
          artist: displayName,
          src: url,
        })
        upsertTrack(track)
        ok++
      }
      setMsg(zh.console.sharedMusicBatchAdded.replace('{count}', String(ok)))
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.musicUploadFailed)
    } finally {
      setUploading(false)
      setUploadProgress('')
      e.target.value = ''
    }
  }

  const handleFieldBlur = async (track: SharedMusicTrack, patch: { title?: string; artist?: string }) => {
    try {
      const updated = await sharedMusicApi.update(track.id, {
        title: patch.title ?? track.title,
        artist: patch.artist ?? track.artist,
        src: track.src,
        cover: track.cover,
        sortOrder: track.sortOrder,
      })
      upsertTrack(updated)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.prefsSyncFailed)
    }
  }

  const handleRemove = async (id: number) => {
    if (!confirm(zh.console.sharedMusicDeleteConfirm)) return
    try {
      await sharedMusicApi.remove(id)
      removeById(id)
      setMsg(zh.console.sharedMusicRemoved)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : zh.settings.prefsSyncFailed)
    }
  }

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header">
        <h1>{zh.console.sharedMusic}</h1>
        <p>{zh.console.sharedMusicDesc}</p>
      </header>

      <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer mb-2">
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        <span>{zh.console.sharedMusicBatchUpload}</span>
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
          multiple
          className="hidden"
          onChange={handleBatchUpload}
          disabled={uploading}
        />
      </label>
      {uploading && uploadProgress && (
        <p className="text-sm text-secondary mb-4">{zh.console.sharedMusicUploading.replace('{progress}', uploadProgress)}</p>
      )}

      {msg && <p className="text-sm text-accent mb-4">{msg}</p>}

      <div className="console-table-wrap console-table-wrap--fill">
        <table className="console-table">
          <thead>
            <tr>
              <th>{zh.settings.trackTitle}</th>
              <th>{zh.settings.trackArtist}</th>
              <th>{zh.console.mediaName}</th>
              <th>{zh.console.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="console-table__empty">{zh.articles.loading}</td></tr>
            ) : tracks.length === 0 ? (
              <tr><td colSpan={4} className="console-table__empty">{zh.console.sharedMusicEmpty}</td></tr>
            ) : tracks.map((track) => (
              <tr key={track.id}>
                <td>
                  <input
                    className="console-input w-full"
                    defaultValue={track.title}
                    onBlur={(e) => {
                      if (e.target.value !== track.title) {
                        handleFieldBlur(track, { title: e.target.value })
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    className="console-input w-full"
                    defaultValue={track.artist}
                    onBlur={(e) => {
                      if (e.target.value !== track.artist) {
                        handleFieldBlur(track, { artist: e.target.value })
                      }
                    }}
                  />
                </td>
                <td><code className="console-code">{track.src.split('/').pop()}</code></td>
                <td>
                  <button type="button" className="console-icon-btn console-icon-btn--danger cursor-pointer" onClick={() => handleRemove(track.id)}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
