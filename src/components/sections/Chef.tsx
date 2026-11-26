import { useRef, useState, type PointerEvent } from 'react'
import { chef } from '../../data/content'
import { gsap, SplitText, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'

/**
 * Meet the Chef:
 * - Rising-flame curtain reveal + opposite-direction gold frame scrub + interactive 3D firelight tilt on photo
 * - Word-by-word scrubbed quote illumination
 * - Dedicated masked line reveal on `.chef-bio` ("Hơn 18 năm đứng bếp...")
 * - Progressive scroll-linked rail + diamond nodes lighting up Principles 01, 02, 03 as the reader scrolls
 */
export default function Chef() {
  const root = useRef<HTMLElement>(null)
  const [litIdx, setLitIdx] = useState(0)
  const tiltFns = useRef<{
    rx: gsap.QuickToFunc
    ry: gsap.QuickToFunc
    frameX: gsap.QuickToFunc
    frameY: gsap.QuickToFunc
  } | null>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        // 1. Header + Quote word-by-word scrubbed illumination
        const nameSplit = SplitText.create(q('#chef-title')[0], { type: 'lines', mask: 'lines' })
        const quoteSplit = SplitText.create(q('.chef-quote p')[0], { type: 'words' })
        const bioSplit = SplitText.create(q('.chef-bio')[0], { type: 'lines', mask: 'lines' })
        const principleSplits = q('.principle-text').map((el) => SplitText.create(el, { type: 'lines', mask: 'lines' }))

        gsap
          .timeline({ scrollTrigger: { trigger: q('.chef-meta')[0], start: 'top 82%', once: true } })
          .from(q('.chef-meta .section-subtitle'), { y: 14, autoAlpha: 0, duration: 0.55, ease: 'power3.out' })
          .from(nameSplit.lines, { yPercent: 112, autoAlpha: 0, duration: 0.85, ease: 'expo.out' }, 0.08)
          .from(q('.chef-role'), { y: 14, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.24)

        gsap.fromTo(
          quoteSplit.words,
          { opacity: 0.18, y: 5 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: { trigger: q('.chef-quote')[0], start: 'top 78%', end: 'bottom 48%', scrub: 0.4 },
          },
        )

        // 2. Live-fire Chef photo: upward flame curtain reveal + decoupled parallax + 3D tilt
        const photoEl = q('.chef-photo')[0] as HTMLElement
        const tiltEl = q('.chef-photo-tilt')[0] as HTMLElement
        const frameInner = q('.chef-frame-inner')[0] as HTMLElement

        gsap
          .timeline({ scrollTrigger: { trigger: photoEl, start: 'top 78%', once: true } })
          .fromTo(
            q('.chef-photo-inner'),
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' },
          )
          .fromTo(
            q('.chef-curtain'),
            { scaleY: 1 },
            { scaleY: 0, transformOrigin: 'top center', duration: 0.95, ease: 'expo.inOut' },
            0.32,
          )
          .from(q('.chef-photo-inner img'), { scale: 1.22, duration: 1.65, ease: 'expo.out' }, 0.05)
          .from(q('.chef-frame'), { x: -26, y: 26, autoAlpha: 0, duration: 0.95, ease: 'power3.out' }, 0.45)
          .from(q('.chef-caption'), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.7)

        gsap.fromTo(
          q('.chef-photo-parallax'),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: photoEl, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.fromTo(
          q('.chef-frame'),
          { y: 24 },
          {
            y: -24,
            ease: 'none',
            scrollTrigger: { trigger: photoEl, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )

        gsap.set(photoEl, { transformPerspective: 1000 })
        tiltFns.current = {
          rx: gsap.quickTo(tiltEl, 'rotationX', { duration: 0.5, ease: 'power3.out' }),
          ry: gsap.quickTo(tiltEl, 'rotationY', { duration: 0.5, ease: 'power3.out' }),
          frameX: gsap.quickTo(frameInner, 'x', { duration: 0.55, ease: 'power3.out' }),
          frameY: gsap.quickTo(frameInner, 'y', { duration: 0.55, ease: 'power3.out' }),
        }

        // 3. Dedicated masked line reveal on `.chef-bio` ("Hơn 18 năm đứng bếp...")
        gsap.from(bioSplit.lines, {
          yPercent: 110,
          autoAlpha: 0,
          stagger: 0.09,
          duration: 0.82,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.chef-bio')[0], start: 'top 86%', once: true },
        })

        // 4. Individual scroll-triggered entrance + scrubbed rail lighting up 01, 02, 03
        q('.principle').forEach((item, idx) => {
          const el = item as HTMLElement
          const lines = principleSplits[idx]?.lines ?? []
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
            .from(el.querySelector('.principle-num'), { y: 18, autoAlpha: 0, duration: 0.6, ease: 'expo.out' })
            .from(el.querySelector('.principle-title'), { x: 14, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.08)
            .from(lines, { yPercent: 105, autoAlpha: 0, stagger: 0.06, duration: 0.72, ease: 'power3.out' }, 0.16)
        })

        gsap.fromTo(
          q('.principles-rail-fill'),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.principles')[0],
              start: 'top 80%',
              end: 'bottom 52%',
              scrub: 0.45,
              onUpdate: (self) => {
                const p = self.progress
                const next = p >= 0.72 ? 3 : p >= 0.36 ? 2 : p >= 0.04 ? 1 : 0
                setLitIdx((prev) => (prev === next ? prev : next))
              },
            },
          },
        )

        gsap.to(q('.shape-chef'), {
          y: -80,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        return () => {
          nameSplit.revert()
          quoteSplit.revert()
          bioSplit.revert()
          principleSplits.forEach((s) => s.revert())
          tiltFns.current = null
        }
      })
    },
    { scope: root },
  )

  const onPhotoMove = (e: PointerEvent<HTMLElement>) => {
    if (!tiltFns.current || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--fx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--fy', `${e.clientY - r.top}px`)
    tiltFns.current.ry(nx * 7)
    tiltFns.current.rx(-ny * 6)
    tiltFns.current.frameX(-nx * 14)
    tiltFns.current.frameY(-ny * 14)
  }

  const onPhotoLeave = () => {
    if (!tiltFns.current) return
    tiltFns.current.rx(0)
    tiltFns.current.ry(0)
    tiltFns.current.frameX(0)
    tiltFns.current.frameY(0)
  }

  return (
    <section ref={root} id="chef" className="section chef bg-black-10" aria-labelledby="chef-title">
      <div className="container chef-grid">
        <figure className="chef-photo" onPointerMove={onPhotoMove} onPointerLeave={onPhotoLeave}>
          <div className="chef-frame" aria-hidden="true">
            <span className="chef-frame-inner" />
          </div>
          <div className="chef-photo-tilt">
            <div className="chef-photo-inner img-holder has-shine">
              <span className="chef-curtain" aria-hidden="true" />
              <div className="chef-photo-parallax">
                <img
                  src={chef.image}
                  width="1000"
                  height="1500"
                  loading="lazy"
                  alt={`Khu bếp than rực lửa của bếp trưởng ${chef.name}`}
                  className="img-cover"
                />
              </div>
              <span className="chef-fire-glow" aria-hidden="true" />
            </div>
          </div>
          <figcaption className="chef-caption label-2">
            <span className="chef-ember-dot" aria-hidden="true" />
            Ca tối thứ Bảy, khu bếp than tầng trệt
          </figcaption>
        </figure>

        <div className="chef-content">
          <div className="chef-meta">
            <p className="section-subtitle left">Bếp trưởng</p>
            <h2 id="chef-title" className="headline-1">
              {chef.name}
            </h2>
            <p className="chef-role">{chef.role}</p>
          </div>

          <blockquote className="chef-quote">
            <p className="title-1">“{chef.quote}”</p>
          </blockquote>

          <p className="section-text chef-bio">{chef.bio}</p>

          <ol className="principles">
            <span className="principles-rail" aria-hidden="true">
              <span className="principles-rail-fill" />
            </span>
            {chef.principles.map((p, i) => {
              const isLit = litIdx >= i + 1
              return (
                <li className={`principle ${isLit ? 'is-lit' : ''}`} key={p.title}>
                  <span className="principle-dot" aria-hidden="true" />
                  <span className="principle-num">0{i + 1}</span>
                  <div className="principle-body">
                    <h3 className="title-3 principle-title">{p.title}</h3>
                    <p className="body-4 muted principle-text">{p.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <img src="images/grilli/shape-9.png" width="351" height="462" loading="lazy" alt="" className="shape shape-chef" aria-hidden="true" />
    </section>
  )
}
