import { sharedMusicApi, type SharedMusicTrack } from '@/api'
import type { MediaAsset } from '@/api'

export function stripAudioExt(name: string): string {
  return name.replace(/\.[^.]+$/, '') || '未命名'
}

export function normalizeMusicSrc(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname
  } catch {
    return url.trim()
  }
}

/** 用媒体库公开 URL 直接写入社区曲库（不依赖 from-media 接口） */
export async function publishMediaToShared(
  asset: MediaAsset,
  artist = 'iume ambient',
): Promise<SharedMusicTrack> {
  return sharedMusicApi.create({
    title: stripAudioExt(asset.originalName || asset.storedName),
    artist,
    src: asset.publicUrl,
  })
}
