import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

// Register every plugin once, in one place (seminar: "registerPlugin before use").
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)

// House easing: soft deceleration, close to Grilli's 500ms "ease" transitions.
gsap.defaults({ ease: 'power3.out', duration: 0.9 })

// Breakpoints shared by every gsap.matchMedia() call so desktop-only effects
// (pinning, horizontal scroll) never run on phones or for reduced-motion users.
export const MQ = {
  desktop: '(min-width: 992px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 991px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ.reduced).matches

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
