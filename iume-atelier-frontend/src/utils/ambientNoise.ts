let ctx: AudioContext | null = null
let gain: GainNode | null = null
let source: AudioBufferSourceNode | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function createNoiseBuffer(audio: AudioContext) {
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

export const ambientNoise = {
  start(volume = 0.04) {
    const audio = getCtx()
    if (audio.state === 'suspended') audio.resume()
    if (source) return

    const buffer = createNoiseBuffer(audio)
    source = audio.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = audio.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800

    gain = audio.createGain()
    gain.gain.value = volume

    source.connect(filter)
    filter.connect(gain)
    gain.connect(audio.destination)
    source.start()
  },

  stop() {
    if (source) {
      source.stop()
      source.disconnect()
      source = null
    }
    gain = null
  },

  setVolume(v: number) {
    if (gain) gain.gain.value = v
  },
}
