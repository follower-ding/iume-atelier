export type PlaylistTrackKind = 'audio' | 'ambient' | 'link'

export interface PlaylistTrack {
  id: string
  title: string
  artist: string
  kind: PlaylistTrackKind
  /** Remote URL or path under public/, e.g. /music/lofi.mp3 */
  src?: string
  /** Cover image URL */
  cover?: string
  /** External music service link */
  href?: string
}

/** Built-in tracks removed — playlist comes from community catalog only. */
export const defaultPlaylist: PlaylistTrack[] = []
