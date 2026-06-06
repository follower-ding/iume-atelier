import { useMemo } from 'react'
import { defaultPlaylist, type PlaylistTrack } from '@/data/playlist'
import { useMusicStore } from '@/store/useMusicStore'
import { useUserPrefsStore } from '@/store/useUserPrefsStore'
import { resolveAssetUrl } from '@/utils/user'

export function usePlaylist(): PlaylistTrack[] {
  const customTracks = useUserPrefsStore((s) => s.customTracks)
  const hiddenTrackIds = useMusicStore((s) => s.hiddenTrackIds)

  return useMemo(() => {
    const hidden = new Set(hiddenTrackIds)
    const personal: PlaylistTrack[] = customTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      kind: 'audio',
      src: resolveAssetUrl(t.src) || t.src,
      cover: t.cover ? resolveAssetUrl(t.cover) || t.cover : undefined,
    }))
    return [...personal, ...defaultPlaylist].filter((t) => !hidden.has(t.id))
  }, [customTracks, hiddenTrackIds])
}

export function useCustomTrackIds(): Set<string> {
  const customTracks = useUserPrefsStore((s) => s.customTracks)
  return useMemo(() => new Set(customTracks.map((t) => t.id)), [customTracks])
}
