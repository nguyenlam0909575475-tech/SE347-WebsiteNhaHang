import { useEffect, useRef, useState } from 'react'
import { testimonials } from '../../data/content'
import { gsap, SplitText, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import { IconChevron, IconStar } from '../ui/Icons'

const AUTOPLAY = 8

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/**
 * Guest stories on Grilli's photo background, card layout from Savoria.
 * Outgoing quote fades up, incoming quote is split into words and settles in.
 * The gold line under the dots is the autoplay timer (pauses on hover/focus).
 */
export default function Testimonials() {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const timer = useRef<gsap.core.Tween | null>(null)
  const busy = useRef(false)
  const t = testimonials[index]

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(q('.testi-card'), {
          y: 60,
          autoAlpha: 0,
          duration: 1.1,
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
        gsap.fromTo(
          q('.testi-bg'),
          { yPercent: -10 },
          { yPercent: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  // animate the new quote in + restart the autoplay timer
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      timer.current?.kill()
      // undo the "out" tween from go() before animating in
      gsap.set(q('.testi-quote, .testi-profile, .testi-rating'), { autoAlpha: 1, y: 0 })
      if (!prefersReducedMotion()) {
        const split = SplitText.create(q('.testi-quote')[0], { type: 'words' })
        gsap.from(split.words, { autoAlpha: 0, y: 14, stagger: 0.015, duration: 0.6, ease: 'power3.out' })
        gsap.from(q('.testi-profile, .testi-rating'), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08, delay: 0.15 })
        timer.current = gsap.fromTo(
          q('.testi-timer-bar'),
          { scaleX: 0 },
          { scaleX: 1, duration: AUTOPLAY, ease: 'none', onComplete: () => go((index + 1) % testimonials.length) },
        )
      }
      busy.current = false
    },
    { scope: root, dependencies: [index], revertOnUpdate: true },
  )

  const go = contextSafe((next: number) => {
    if (busy.current || next === index) return
    if (prefersReducedMotion()) return setIndex(next)
    busy.current = true
    const q = gsap.utils.selector(root)
    gsap.to(q('.testi-quote, .testi-profile, .testi-rating'), {
      autoAlpha: 0,
      y: -14,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => setIndex(next),
    })
  })

  // pause autoplay while the section is off screen
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? timer.current?.resume() : timer.current?.pause()))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pause = () => timer.current?.pause()
  const resume = () => timer.current?.resume()

  return (
    <section ref={root} className="section testi" aria-labelledby="testi-title">
      <div className="testi-bg has-bg-image" style={{ backgroundImage: "url('images/testimonial-bg.webp')" }} aria-hidden="true" />
      <div className="container">
        <div className="testi-head text-center">
          <p className="section-subtitle">Khách nói gì</p>
          <h2 id="testi-title" className="headline-2">
            4,8 / 5 từ 1.240 <span className="nowrap">đánh giá</span> trên <span className="nowrap">Google Maps</span>
          </h2>
        </div>

        <div
          className="testi-card"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          aria-roledescription="carousel"
        >
          <button className="testi-arrow prev" onClick={() => go((index - 1 + testimonials.length) % testimonials.length)} aria-label="Đánh giá trước">
            <IconChevron dir="left" size={20} />
          </button>

          <div className="testi-inner" aria-live="polite">
            <div className="testi-rating" aria-label={`${t.rating} trên 5 sao`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} filled={i < t.rating} />
              ))}
            </div>
            <blockquote>
              <p className="testi-quote title-1" key={t.id}>
                “{t.quote}”
              </p>
            </blockquote>
            <div className="testi-profile">
              <span className="testi-avatar" aria-hidden="true">
                {initials(t.name)}
              </span>
              <div>
                <p className="testi-name">{t.name}</p>
                <p className="testi-role">
                  {t.role} · {t.source}, {t.date}
                </p>
              </div>
            </div>
          </div>

          <button className="testi-arrow next" onClick={() => go((index + 1) % testimonials.length)} aria-label="Đánh giá tiếp theo">
            <IconChevron dir="right" size={20} />
          </button>
        </div>

        <div className="testi-dots" role="tablist" aria-label="Chọn đánh giá">
          {testimonials.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Đánh giá ${i + 1}`}
              className={`testi-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className="testi-timer" aria-hidden="true">
          <span className="testi-timer-bar" />
        </div>
      </div>
    </section>
  )
}
