import { useCallback, useEffect, useRef } from 'react'
import { usePlaylist } from '@/hooks/usePlaylist'
import { useMusicStore } from '@/store'
import { ambientNoise } from '@/utils/ambientNoise'

/** Headless audio engine — stays mounted while companion dock is visible. */
export default function MusicEngine() {
  const playlist = usePlaylist()
  const audioRef = useRef<HTMLAudioElement>(null)

  const trackIndex = useMusicStore((s) => s.trackIndex)
  const playing = useMusicStore((s) => s.playing)
  const volume = useMusicStore((s) => s.volume)
  const seekTarget = useMusicStore((s) => s.seekTarget)
  const setPlaying = useMusicStore((s) => s.setPlaying)
  const setPlaybackProgress = useMusicStore((s) => s.setPlaybackProgress)
  const clearSeek = useMusicStore((s) => s.clearSeek)

  const track = playlist[trackIndex] ?? playlist[0]
  const isAmbient = track?.kind === 'ambient'
  const isLink = track?.kind === 'link'

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  const stopAll = useCallback(() => {
    ambientNoise.stop()
    stopAudio()
    setPlaybackProgress(0, 0)
  }, [setPlaybackProgress, stopAudio])

  useEffect(() => {
    if (!track || !playing || isLink) {
      stopAll()
      return
    }

    if (isAmbient) {
      stopAudio()
      ambientNoise.start(volume * 0.12)
      setPlaybackProgress(0, 0)
      return
    }

    ambientNoise.stop()
    const audio = audioRef.current
    if (!audio || !track.src) return

    audio.volume = volume
    audio.play().catch(() => setPlaying(false))
  }, [track, trackIndex, playing, isAmbient, isLink, volume, stopAll, stopAudio, setPlaying, setPlaybackProgress])

  useEffect(() => {
    if (!playing) return
    if (isAmbient) {
      ambientNoise.setVolume(volume * 0.12)
      return
    }
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume, playing, isAmbient])

  useEffect(() => {
    if (seekTarget == null || isAmbient) return
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seekTarget
    setPlaybackProgress(seekTarget, audio.duration || 0)
    clearSeek()
  }, [seekTarget, isAmbient, setPlaybackProgress, clearSeek])

  useEffect(() => () => stopAll(), [stopAll])

  if (!track || isAmbient || isLink || !track.src) return null

  return (
    <audio
      ref={audioRef}
      src={track.src}
      preload="metadata"
      hidden
      onTimeUpdate={() => {
        const audio = audioRef.current
        if (!audio) return
        setPlaybackProgress(audio.currentTime, audio.duration || 0)
      }}
      onLoadedMetadata={() => {
        const audio = audioRef.current
        if (!audio) return
        setPlaybackProgress(audio.currentTime, audio.duration || 0)
      }}
      onEnded={() => {
        const result = useMusicStore.getState().onTrackEnded(playlist.length)
        if (result === 'replay') {
          const audio = audioRef.current
          if (audio) {
            audio.currentTime = 0
            audio.play().catch(() => setPlaying(false))
          }
        }
      }}
    />
  )
}
