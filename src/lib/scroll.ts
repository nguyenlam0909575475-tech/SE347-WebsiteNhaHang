import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

// One Lenis instance for the whole page, driven by gsap.ticker (skill: lenis-gsap).
let lenis: Lenis | null = null

export const HEADER_OFFSET = 84

export function initLenis() {
  if (lenis || prefersReducedMotion()) return () => {}

  lenis = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.95 })
  const instance = lenis
  const unsubscribe = instance.on('scroll', ScrollTrigger.update)
  // GSAP ticker time is in seconds, Lenis expects milliseconds.
  const update = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(update)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(update)
    unsubscribe()
    instance.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.classList.toggle('is-locked', locked)
}

export function scrollToTarget(target: string | number, immediate = false) {
  if (typeof target === 'string') {
    const el = document.getElementById(target.replace('#', ''))
    if (!el) return
    if (lenis) {
      lenis.scrollTo(el, { offset: target === 'home' ? 0 : -HEADER_OFFSET + 10, duration: 1.4, immediate })
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - (target === 'home' ? 0 : HEADER_OFFSET - 10)
      window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
    }
    return
  }
  if (lenis) lenis.scrollTo(target, { duration: 1.4, immediate })
  else window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
}
