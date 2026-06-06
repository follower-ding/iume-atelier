import { useUiSound } from '@/hooks/useUiSound'

interface CharacterCardProps {
  src?: string
  alt?: string
}

const DEFAULT_SRC = '/assets/mascot-girl.png'

export default function CharacterCard({ src = DEFAULT_SRC, alt = 'iume mascot' }: CharacterCardProps) {
  const { play } = useUiSound()

  return (
    <button
      type="button"
      className="character-card"
      onClick={() => play('toggle')}
      aria-label="互动角色"
    >
      <div className="character-card__glow" aria-hidden="true" />
      <img src={src} alt={alt} className="character-card__img" loading="lazy" />
      <span className="character-card__spark character-card__spark--1" aria-hidden="true">✦</span>
      <span className="character-card__spark character-card__spark--2" aria-hidden="true">◇</span>
    </button>
  )
}
