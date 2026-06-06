import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { zh } from '@/locales/zh'

interface ShareCardGeneratorProps {
  title: string
  summary?: string
  author?: string
  slug: string
  coverImage?: string
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    const url = src.startsWith('http') ? src : `${window.location.origin}${src}`
    img.src = url
  })
}

export default function ShareCardGenerator({ title, summary, author, slug, coverImage }: ShareCardGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/article/${slug}` : ''

  const drawCard = async () => {
    setGenerating(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 630
      const ctx = canvas.getContext('2d')!

      const cover = coverImage ? await loadImage(coverImage) : null

      if (cover) {
        const scale = Math.max(1200 / cover.width, 630 / cover.height)
        const w = cover.width * scale
        const h = cover.height * scale
        ctx.drawImage(cover, (1200 - w) / 2, (630 - h) / 2, w, h)
        ctx.fillStyle = 'rgba(11, 15, 23, 0.72)'
        ctx.fillRect(0, 0, 1200, 630)
      } else {
        const grad = ctx.createLinearGradient(0, 0, 1200, 630)
        grad.addColorStop(0, '#1a1030')
        grad.addColorStop(0.5, '#2d1b4e')
        grad.addColorStop(1, '#0b0f17')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 1200, 630)

        ctx.fillStyle = 'rgba(214, 64, 141, 0.15)'
        ctx.beginPath()
        ctx.arc(1000, 120, 200, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(168, 85, 247, 0.12)'
        ctx.beginPath()
        ctx.arc(200, 500, 180, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = '#ff6b9d'
      ctx.font = '600 28px Syne, sans-serif'
      ctx.fillText('iume·atelier', 64, 72)

      ctx.fillStyle = '#ffffff'
      ctx.font = '700 52px Syne, sans-serif'
      wrapText(ctx, title, 64, 180, 1070, 62)

      if (summary) {
        ctx.fillStyle = 'rgba(232, 234, 237, 0.75)'
        ctx.font = '400 28px "Plus Jakarta Sans", sans-serif'
        wrapText(ctx, summary.slice(0, 120), 64, 340, 1070, 38)
      }

      ctx.fillStyle = 'rgba(232, 234, 237, 0.5)'
      ctx.font = '400 24px "Plus Jakarta Sans", sans-serif'
      ctx.fillText(author ? `${author} · ${link}` : link, 64, 560)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-share.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, text: summary, url: link })
    } else {
      await navigator.clipboard.writeText(link)
    }
  }

  return (
    <div className="share-card-actions">
      <button type="button" className="btn-ghost text-sm py-2 px-4 click-particles-ignore" onClick={drawCard} disabled={generating}>
        <Download size={15} className="inline mr-1.5" />
        {generating ? zh.share.generating : zh.share.downloadCard}
      </button>
      <button type="button" className="btn-ghost text-sm py-2 px-4 click-particles-ignore" onClick={shareNative}>
        <Share2 size={15} className="inline mr-1.5" />
        {zh.share.shareLink}
      </button>
    </div>
  )
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = [...text]
  let line = ''
  let cy = y
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = ch
      cy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cy)
}
