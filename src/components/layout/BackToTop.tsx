import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import { IconArrowUp } from '../ui/Icons'

/**
 * Appears only after the hero has scrolled away, so it can never sit on top of
 * the hero "Đặt bàn" badge (a bug we saw on the original Grilli at ~860px).
 */
export default function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null)
  useGSAP(() => {
    gsap.set(ref.current, { autoAlpha: 0, y: 16 })
    ScrollTrigger.create({
      trigger: '#home',
      start: 'bottom 40%',
      onEnter: () => gsap.to(ref.current, { autoAlpha: 1, y: 0, duration: 0.4 }),
      onLeaveBack: () => gsap.to(ref.current, { autoAlpha: 0, y: 16, duration: 0.3 }),
    })
  })
  return (
    <button ref={ref} className="back-top-btn" aria-label="Lên đầu trang" onClick={() => scrollToTarget('home')}>
      <IconArrowUp size={22} />
    </button>
  )
}
