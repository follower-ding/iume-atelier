let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

function tone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const audio = getCtx()
  if (!audio) return

  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(audio.currentTime)
  osc.stop(audio.currentTime + duration)
}

export const uiSound = {
  click() {
    tone(520, 0.06, 0.04)
    tone(780, 0.05, 0.025, 'triangle')
  },
  nav() {
    tone(440, 0.05, 0.035)
    tone(660, 0.07, 0.02, 'sine')
  },
  toggle() {
    tone(330, 0.08, 0.04)
    tone(495, 0.12, 0.03, 'triangle')
  },
  hover() {
    tone(880, 0.03, 0.012, 'sine')
  },
  whoosh() {
    tone(220, 0.1, 0.02, 'triangle')
    tone(440, 0.14, 0.015, 'sine')
  },
}
