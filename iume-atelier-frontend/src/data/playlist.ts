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

export const defaultPlaylist: PlaylistTrack[] = [
  {
    id: 'rain',
    title: '雨声白噪音',
    artist: 'iume ambient',
    kind: 'ambient',
  },
  {
    id: 'lofi-demo',
    title: 'Lofi Demo',
    artist: 'SoundHelix',
    kind: 'audio',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
]
