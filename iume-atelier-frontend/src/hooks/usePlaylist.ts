import { useMemo } from 'react'
import { defaultPlaylist, type PlaylistTrack } from '@/data/playlist'
import { useMusicStore } from '@/store/useMusicStore'
import { useSharedMusicStore } from '@/store/useSharedMusicStore'
import { useUserPrefsStore } from '@/store/useUserPrefsStore'
import { resolveAssetUrl } from '@/utils/user'

function normalizeSrc(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname
  } catch {
    return url.trim()
  }
}

function toPlaylistTrack(
  id: string,
  title: string,
  artist: string,
  src: string,
  cover?: string | null,
): PlaylistTrack {
  return {
    id,
    title,
    artist,
    kind: 'audio',
    src: resolveAssetUrl(src) || src,
    cover: cover ? resolveAssetUrl(cover) || cover : undefined,
  }
}

export function usePlaylist(): PlaylistTrack[] {
  const customTracks = useUserPrefsStore((s) => s.customTracks)
  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  const hiddenTrackIds = useMusicStore((s) => s.hiddenTrackIds)

  return useMemo(() => {
    const hidden = new Set(hiddenTrackIds)
    const shared: PlaylistTrack[] = sharedTracks.map((t) =>
      toPlaylistTrack(`shared-${t.id}`, t.title, t.artist, t.src, t.cover),
    )
    const sharedSrcSet = new Set(sharedTracks.map((t) => normalizeSrc(t.src)))
    const legacyPersonal: PlaylistTrack[] = customTracks
      .filter((t) => !sharedSrcSet.has(normalizeSrc(t.src)))
      .map((t) => toPlaylistTrack(t.id, t.title, t.artist, t.src, t.cover))
    return [...shared, ...legacyPersonal, ...defaultPlaylist].filter((t) => !hidden.has(t.id))
  }, [customTracks, sharedTracks, hiddenTrackIds])
}

export function useCustomTrackIds(): Set<string> {
  const customTracks = useUserPrefsStore((s) => s.customTracks)
  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  return useMemo(() => {
    const sharedSrcSet = new Set(sharedTracks.map((t) => normalizeSrc(t.src)))
    return new Set(
      customTracks.filter((t) => !sharedSrcSet.has(normalizeSrc(t.src))).map((t) => t.id),
    )
  }, [customTracks, sharedTracks])
}

export function useSharedTrackIds(): Set<string> {
  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  return useMemo(() => new Set(sharedTracks.map((t) => `shared-${t.id}`)), [sharedTracks])
}

export function useSharedTrackByPlaylistId(trackId: string) {
  const sharedTracks = useSharedMusicStore((s) => s.tracks)
  return useMemo(() => {
    if (!trackId.startsWith('shared-')) return undefined
    const id = Number(trackId.replace(/^shared-/, ''))
    return sharedTracks.find((t) => t.id === id)
  }, [sharedTracks, trackId])
}
