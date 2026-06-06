import type { ReactNode } from 'react'

import FloatingDecor from '@/components/interactive/FloatingDecor'



interface HeroBannerProps {

  children: ReactNode

  centered?: boolean

  compact?: boolean

  decorative?: boolean

}



export default function HeroBanner({ children, centered = true, compact, decorative }: HeroBannerProps) {

  return (

    <div className={`hero-banner ${compact ? 'hero-banner--compact' : ''}`}>

      <div className="hero-shapes" aria-hidden="true">

        <span className="hero-blob hero-blob--1" />

        <span className="hero-blob hero-blob--2" />

        <span className="hero-blob hero-blob--3" />

        <span className="hero-blob hero-blob--4" />

      </div>

      {decorative && <FloatingDecor />}

      <div className={`page-container hero-banner__inner animate-fade-up ${centered ? 'text-center' : ''}`}>

        {children}

      </div>

    </div>

  )

}

