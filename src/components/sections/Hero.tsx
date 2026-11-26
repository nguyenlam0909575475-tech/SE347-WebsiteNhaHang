import { useEffect, useRef, useState } from 'react'
import { heroSlides } from '../../data/site'
import { gsap, ScrollTrigger, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import Button from '../ui/Button'
import { IconChevron, IconTable } from '../ui/Icons'

const SLIDE_SECONDS = 7

/**
 * Grilli hero, rebuilt with one GSAP timeline per slide change:
 *  - background crossfade + slow zoom (Grilli's smoothScale, now tweened)
 *  - title lines rise from behind a mask, then text and button
 *  - the gold progress line IS the autoplay timer, so pausing it pauses autoplay
 * Fixes from the audit: arrows live inside the viewport and above the slides.
 */
export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const busy = useRef(false)
  const timer = useRef<gsap.core.Tween | null>(null)
  const started = useRef(false)

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.slider-bg'), { autoAlpha: 0 })
      gsap.set(q('.slide-content'), { autoAlpha: 0 })
      gsap.set(q('.hero-ui'), { autoAlpha: 0 })

      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        // scroll-out parallax: photo drifts slower than the page, copy lifts and fades
        gsap.to(q('.hero-bgs'), {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to(q('.hero-contents'), {
          y: -110,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '65% top', scrub: true },
        })

        // Fine-pointer subtle depth parallax on background plate
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const bgsWrap = q('.hero-bgs')[0]
          const xTo = gsap.quickTo(bgsWrap, 'x', { duration: 0.9, ease: 'power3.out' })
          const yTo = gsap.quickTo(bgsWrap, 'y', { duration: 0.9, ease: 'power3.out' })
          const onMove = (ev: PointerEvent) => {
            const nx = ev.clientX / window.innerWidth - 0.5
            const ny = ev.clientY / window.innerHeight - 0.5
            xTo(-nx * 18)
            yTo(-ny * 12)
          }
          const el = root.current!
          el.addEventListener('pointermove', onMove)
          return () => el.removeEventListener('pointermove', onMove)
        }
      })

      // stop autoplay while the hero is off screen
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        onLeave: () => timer.current?.pause(),
        onEnterBack: () => timer.current?.resume(),
      })
    },
    { scope: root },
  )

  const show = contextSafe((next: number, first = false) => {
    if (busy.current && !first) return
    const q = gsap.utils.selector(root)
    const items = q('.slide-content')
    const bgs = q('.slider-bg')
    const prev = indexRef.current
    const reduced = prefersReducedMotion()
    busy.current = true
    timer.current?.kill()

    const tl = gsap.timeline({ onComplete: () => void (busy.current = false) })
    const changing = prev !== next && !first
    if (changing) {
      tl.to(items[prev].querySelectorAll('.reveal, .line-inner'), {
        y: -22,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: 'power2.in',
      })
        .set(items[prev], { autoAlpha: 0 })
        .to(bgs[prev], { autoAlpha: 0, duration: 1.2, ease: 'power2.inOut' }, 0.1)
    }

    const at = changing ? 0.45 : 0
    tl.set(items[next], { autoAlpha: 1 }, at)
      .fromTo(bgs[next], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power2.inOut' }, changing ? 0.1 : 0)
      .fromTo(
        items[next].querySelector('.section-subtitle'),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
        at + 0.1,
      )
      .fromTo(
        items[next].querySelectorAll('.line-inner'),
        { yPercent: 110, y: 0, autoAlpha: 1 },
        { yPercent: 0, duration: 1.15, stagger: 0.12, ease: 'power4.out' },
        at + 0.25,
      )
      .fromTo(
        items[next].querySelectorAll('.hero-text, .hero-actions'),
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12 },
        at + 0.75,
      )

    if (!reduced) gsap.fromTo(bgs[next], { scale: 1.14 }, { scale: 1, duration: SLIDE_SECONDS + 2, ease: 'none' })

    indexRef.current = next
    setIndex(next)

    if (!reduced) {
      timer.current = gsap.fromTo(
        q('.hero-progress-bar'),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: SLIDE_SECONDS,
          ease: 'none',
          delay: 0.8,
          onComplete: () => show((indexRef.current + 1) % heroSlides.length),
        },
      )
    }
  })

  // Intro: starts while the preloader panel slides away.
  useEffect(() => {
    if (!ready || started.current) return
    started.current = true
    show(0, true)
    gsap.to(root.current!.querySelectorAll('.hero-ui'), { autoAlpha: 1, duration: 0.9, delay: 0.8, stagger: 0.08 })
  }, [ready, show])

  const step = (dir: 1 | -1) => show((indexRef.current + dir + heroSlides.length) % heroSlides.length)

  // magnetic "Đặt bàn" badge
  const badgeRef = useRef<HTMLAnchorElement>(null)
  const onBadgeMove = contextSafe((e: React.MouseEvent) => {
    const el = badgeRef.current!
    const r = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.25,
      y: (e.clientY - (r.top + r.height / 2)) * 0.25,
      duration: 0.4,
      ease: 'power3.out',
    })
  })
  const onBadgeLeave = contextSafe(() => gsap.to(badgeRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }))

  return (
    <section ref={root} id="home" className="hero" aria-roledescription="carousel" aria-label="Giới thiệu Grilli">
      <h1 className="sr-only">Grilli — nhà hàng nướng than và ẩm thực Âu–Việt tại TP. Thủ Đức</h1>

      <div className="hero-bgs" aria-hidden="true">
        {heroSlides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            width="1880"
            height="950"
            alt=""
            className="slider-bg img-cover"
            fetchPriority={i === 0 ? 'high' : 'auto'}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-contents">
        {heroSlides.map((s, i) => (
          <div
            key={s.subtitle}
            className="slide-content text-center"
            aria-hidden={index !== i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${heroSlides.length}`}
          >
            <p className="label-2 section-subtitle">{s.subtitle}</p>
            <p className="display-1 hero-title">
              {s.title.map((line) => (
                <span className="line-mask" key={line}>
                  <span className="line-inner">{line}</span>
                </span>
              ))}
            </p>
            <p className="body-2 hero-text reveal">{s.text}</p>
            <div className="hero-actions reveal">
              <Button href="#menu" onClick={() => scrollToTarget('menu')} tabIndex={index === i ? 0 : -1}>
                Xem thực đơn
              </Button>
            </div>
          </div>
        ))}
      </div>

      <button className="slider-btn prev hero-ui" aria-label="Ảnh trước" onClick={() => step(-1)}>
        <IconChevron dir="left" size={20} />
      </button>
      <button className="slider-btn next hero-ui" aria-label="Ảnh tiếp theo" onClick={() => step(1)}>
        <IconChevron dir="right" size={20} />
      </button>

      <div className="hero-counter hero-ui" aria-hidden="true">
        <span className="current">{String(index + 1).padStart(2, '0')}</span>
        <span className="hero-progress">
          <span className="hero-progress-bar" />
        </span>
        <span>{String(heroSlides.length).padStart(2, '0')}</span>
      </div>

      <a
        ref={badgeRef}
        href="#reservation"
        className="hero-btn hero-ui"
        onClick={(e) => (e.preventDefault(), scrollToTarget('reservation'))}
        onMouseMove={onBadgeMove}
        onMouseLeave={onBadgeLeave}
      >
        <IconTable size={40} />
        <span className="label-2 span">Đặt bàn</span>
      </a>

      <div className="hero-scroll hero-ui" aria-hidden="true">
        <span>Cuộn xuống</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  )
}
