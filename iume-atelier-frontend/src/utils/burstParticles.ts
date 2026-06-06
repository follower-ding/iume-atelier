interface BurstParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  shape: 'circle' | 'star'
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: BurstParticle[] = []
let running = false

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.className = 'click-particles-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  const resize = () => {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
}

function drawStar(x: number, y: number, r: number, alpha: number, hue: number) {
  if (!ctx) return
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${alpha})`
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2
    const b = a + Math.PI / 5
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    ctx.lineTo(Math.cos(b) * r * 0.45, Math.sin(b) * r * 0.45)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function tick() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter((p) => {
    p.life -= 0.018
    if (p.life <= 0) return false
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.04
    p.vx *= 0.98
    const alpha = p.life / p.maxLife
    if (p.shape === 'star') {
      drawStar(p.x, p.y, p.size * 1.4, alpha * 0.9, p.hue)
    } else {
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx!.fillStyle = `hsla(${p.hue}, 90%, 68%, ${alpha * 0.85})`
      ctx!.fill()
    }
    return true
  })
  if (particles.length > 0 || running) {
    requestAnimationFrame(tick)
  } else {
    running = false
  }
}

export function burstAt(x: number, y: number, count = 16, stars = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ensureCanvas()
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 1.2 + Math.random() * 2.8
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.55 + Math.random() * 0.45,
      size: 2 + Math.random() * 3.5,
      hue: 320 + Math.random() * 60,
      shape: stars || Math.random() > 0.6 ? 'star' : 'circle',
    })
  }
  if (!running) {
    running = true
    requestAnimationFrame(tick)
  }
}

export function initParticleLoop() {
  ensureCanvas()
}
