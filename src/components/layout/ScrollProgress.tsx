import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'

/** Thin gold bar at the very top: scaleX tied to page progress (scrub). */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const setX = gsap.quickSetter(ref.current, 'scaleX')
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setX(self.progress),
    })
  })
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
