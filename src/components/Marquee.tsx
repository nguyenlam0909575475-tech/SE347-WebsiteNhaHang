import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap'

const PHRASES = [
  'Than nhãn & than đước',
  'Chợ sáng Thủ Đức 5:30',
  'Thăn ngoại ủ khô 14 ngày',
  'Tủ vang 140 nhãn',
  'Nướng mới khi khách gọi',
  'Sốt tiêu xanh Phú Quốc',
]

/**
 * Velocity-reactive editorial ribbon:
 * An infinite GSAP `xPercent` loop whose playback speed & direction smoothly respond
 * to `ScrollTrigger.getVelocity()`, piped through `gsap.utils.clamp` + `gsap.quickTo`.
 */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const track = root.current!.querySelector<HTMLElement>('.marquee-track')!
        const loop = gsap.to(track, {
          xPercent: -50,
          duration: 34,
          ease: 'none',
          repeat: -1,
        })

        let dir = 1
        const scaleTo = gsap.quickTo(loop, 'timeScale', { duration: 0.45, ease: 'power2.out' })
        let settleTimer: gsap.core.Tween | null = null

        const clampVel = gsap.utils.clamp(-2600, 2600)

        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const v = clampVel(self.getVelocity())
            if (Math.abs(v) > 25) dir = v > 0 ? 1 : -1
            const boost = 1 + (Math.abs(v) / 2600) * 2.6
            scaleTo(dir * boost)
            settleTimer?.kill()
            settleTimer = gsap.delayedCall(0.18, () => scaleTo(dir))
          },
        })

        return () => {
          settleTimer?.kill()
          loop.kill()
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {PHRASES.map((text) => (
              <span className="marquee-item" key={`${copy}-${text}`}>
                <span className="marquee-text">{text}</span>
                <span className="separator" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
