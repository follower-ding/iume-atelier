import { useTilt } from '@/hooks/useTilt'

export default function OrbScene() {
  const { ref, onMove, onLeave } = useTilt(14)

  return (
    <div
      ref={ref}
      className="orb-scene"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden="true"
    >
      <div className="orb-scene__stage">
        <span className="orb-scene__ring orb-scene__ring--1" />
        <span className="orb-scene__ring orb-scene__ring--2" />
        <span className="orb-scene__ring orb-scene__ring--3" />
        <span className="orb-scene__particle orb-scene__particle--1" />
        <span className="orb-scene__particle orb-scene__particle--2" />
        <span className="orb-scene__particle orb-scene__particle--3" />
        <div className="orb-scene__sphere">
          <span className="orb-scene__face">
            <span className="orb-scene__eye" />
            <span className="orb-scene__eye" />
            <span className="orb-scene__smile" />
          </span>
        </div>
      </div>
    </div>
  )
}
