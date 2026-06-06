import type { PlaylistTrackKind } from '@/data/playlist'

const TRACK_COVERS: Record<string, string> = {
  rain: 'https://images.unsplash.com/photo-1421032519721-93eb376b93cc?w=480&q=80&auto=format&fit=crop',
  'lofi-demo': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=480&q=80&auto=format&fit=crop',
}

const TRACK_GRADIENTS: Record<string, string> = {
  rain: 'linear-gradient(145deg, #0f2744 0%, #2563eb 55%, #7dd3fc 100%)',
  'lofi-demo': 'linear-gradient(145deg, #3b0764 0%, #a855f7 50%, #e91e8c 100%)',
  netease: 'linear-gradient(145deg, #7f1d1d 0%, #c20c0c 45%, #e91e8c 100%)',
}

const KIND_GRADIENTS: Record<PlaylistTrackKind, string> = {
  ambient: 'linear-gradient(145deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
  audio: 'linear-gradient(145deg, #312e81 0%, #7c3aed 50%, #f472b6 100%)',
  link: 'linear-gradient(145deg, #7f1d1d 0%, #dc2626 50%, #fb7185 100%)',
}

function hashGradient(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(145deg, hsl(${hue} 55% 22%) 0%, hsl(${(hue + 40) % 360} 65% 42%) 50%, hsl(${(hue + 80) % 360} 70% 58%) 100%)`
}

export function getTrackArt(track: { id: string; kind: PlaylistTrackKind; cover?: string }) {
  const cover = track.cover || TRACK_COVERS[track.id]
  const gradient = TRACK_GRADIENTS[track.id] || KIND_GRADIENTS[track.kind] || hashGradient(track.id)
  return { cover, gradient }
}
