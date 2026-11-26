import { useRef, useState } from 'react'
import { signatureDishes } from '../../data/content'
import { formatPriceFull } from '../../data/menu'
import { gsap, SplitText, useGSAP, MQ, prefersReducedMotion, type ScrollTrigger } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import { openMenuItem } from '../../lib/events'

const ARC_R = 118
const ARC_CIRC = 2 * Math.PI * ARC_R

/**
 * Signature dishes showcase:
 * - Perfectly concentric double-ring plate stage (SVG progress arc + diamond compass ring + circular dish stack)
 * - Clean 3-row layout (Header / Active Dish Copy + Plate / 4-column Bottom Dish Selector) so price & CTA
 *   never collide with navigation at any viewport height.
 */
export default function Signature() {
  const root = useRef<HTMLElement>(null)
  const st = useRef<ScrollTrigger | null>(null)
  const labels = useRef<number[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [active, setActive] = useState(0)
  const n = signatureDishes.length

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const headSplit = SplitText.create(q('#signature-title')[0], { type: 'lines', mask: 'lines' })
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: 'top 78%', once: true } })
          .from(q('.sig-head .section-subtitle'), { y: 14, autoAlpha: 0, duration: 0.6, ease: 'power3.out' })
          .from(headSplit.lines, { yPercent: 110, autoAlpha: 0, stagger: 0.1, duration: 0.85, ease: 'expo.out' }, 0.1)
        return () => headSplit.revert()
      })

      mm.add(MQ.desktop, () => {
        const media = q('.sig-media-item')
        const copies = q('.sig-copy')
        const arc = q('.sig-arc')[0]

        gsap.set(media[0], { clipPath: 'circle(72% at 50% 50%)', zIndex: 1 })
        gsap.set(media.slice(1), { clipPath: 'circle(0% at 50% 50%)' })
        media.slice(1).forEach((el, idx) => gsap.set(el, { zIndex: idx + 2 }))

        gsap.set(
          copies.slice(1).flatMap((c) => Array.from(c.querySelectorAll('.sig-anim'))),
          { autoAlpha: 0, y: 32 },
        )
        gsap.set(arc, { strokeDashoffset: ARC_CIRC * (1 - 1 / n) })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * (n - 1) * 0.95}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const t = self.progress * tl.duration()
              let idx = 0
              labels.current.forEach((l, i) => {
                if (t >= l - 0.55) idx = i
              })
              setActive((prev) => (prev === idx ? prev : idx))
            },
          },
        })

        labels.current = []
        for (let i = 0; i < n; i++) {
          tl.addLabel(`s${i}`)
          labels.current.push(tl.duration())
          tl.to({}, { duration: 0.45 })
          if (i === n - 1) break
          tl.to(copies[i].querySelectorAll('.sig-anim'), {
            y: -28,
            autoAlpha: 0,
            stagger: 0.025,
            duration: 0.34,
            ease: 'power2.in',
          })
            .to(media[i].querySelector('img'), { scale: 1.14, rotate: -16, duration: 0.9 }, '<')
            .to(media[i + 1], { clipPath: 'circle(72% at 50% 50%)', duration: 0.9 }, '<0.08')
            .fromTo(media[i + 1].querySelector('img'), { rotate: 22, scale: 1.18 }, { rotate: 0, scale: 1, duration: 0.9 }, '<')
            .to(q('.sig-ring'), { rotate: `+=${360 / n}`, duration: 0.9 }, '<')
            .to(arc, { strokeDashoffset: ARC_CIRC * (1 - (i + 2) / n), duration: 0.9 }, '<')
            .to(
              copies[i + 1].querySelectorAll('.sig-anim'),
              { y: 0, autoAlpha: 1, stagger: 0.045, duration: 0.44, ease: 'power3.out' },
              '<0.38',
            )
        }

        tlRef.current = tl
        st.current = tl.scrollTrigger ?? null

        gsap.from(q('.sig-plate-box'), {
          scale: 0.88,
          autoAlpha: 0,
          duration: 1.15,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        })

        return () => {
          st.current = null
          tlRef.current = null
          setActive(0)
        }
      })

      mm.add(MQ.mobile, () => {
        const media = q('.sig-media-item')
        const copies = q('.sig-copy')
        gsap.set(media[0], { autoAlpha: 1, clipPath: 'circle(72% at 50% 50%)' })
        gsap.set(media.slice(1), { autoAlpha: 0, clipPath: 'circle(72% at 50% 50%)' })
        gsap.set(copies[0], { autoAlpha: 1 })
        gsap.set(copies.slice(1), { autoAlpha: 0 })
      })
    },
    { scope: root },
  )

  const switchMobile = contextSafe((next: number) => {
    if (next === active || !root.current) return
    const q = gsap.utils.selector(root)
    const media = q('.sig-media-item')
    const copies = q('.sig-copy')
    const arc = q('.sig-arc')[0]
    const dur = prefersReducedMotion() ? 0 : 0.55

    gsap.to(media[active], { autoAlpha: 0, duration: dur * 0.7 })
    gsap.fromTo(
      media[next],
      { autoAlpha: 0, scale: 1.08, rotate: 10 },
      { autoAlpha: 1, scale: 1, rotate: 0, duration: dur, ease: 'power3.out' },
    )
    gsap.to(copies[active], { autoAlpha: 0, y: -12, duration: dur * 0.5 })
    gsap.fromTo(copies[next], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: dur, ease: 'power3.out', delay: dur * 0.2 })
    gsap.to(q('.sig-ring'), { rotate: (360 / n) * next, duration: dur, ease: 'power2.inOut' })
    if (arc) gsap.to(arc, { strokeDashoffset: ARC_CIRC * (1 - (next + 1) / n), duration: dur })
    setActive(next)
  })

  const goTo = (i: number) => {
    const s = st.current
    const tl = tlRef.current
    if (!s || !tl) {
      switchMobile(i)
      return
    }
    const pos = s.start + (s.end - s.start) * (labels.current[i] / tl.duration())
    scrollToTarget(Math.ceil(pos) + 2)
  }

  return (
    <section ref={root} id="signature" className="signature" aria-labelledby="signature-title">
      <div className="container sig-container">
        <div className="sig-head">
          <p className="section-subtitle left">Món đặc trưng</p>
          <h2 id="signature-title" className="title-2 sig-head-title">
            Bốn món làm nên tên tuổi bếp than
          </h2>
        </div>

        <div className="sig-copy-stack">
          {signatureDishes.map((d, i) => {
            const isActive = active === i
            return (
              <article
                className={`sig-copy ${isActive ? 'is-active' : ''}`}
                key={d.id}
                aria-hidden={!isActive}
              >
                <div className="sig-eyebrow sig-anim">
                  <span className="sig-index" aria-hidden="true">
                    {d.index}
                  </span>
                  <span className="sig-eyebrow-line" aria-hidden="true" />
                  <p className="sig-origin">{d.origin}</p>
                </div>

                <h3 className="headline-2 sig-name sig-anim">{d.name}</h3>
                <p className="section-text sig-desc sig-anim">{d.description}</p>

                <ul className="sig-notes sig-anim">
                  {d.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <div className="sig-bottom sig-anim">
                  <div className="sig-price-block">
                    <span className="sig-price-label">Giá phục vụ</span>
                    <span className="sig-price">{formatPriceFull(d.price)}</span>
                  </div>
                  <button
                    type="button"
                    className="sig-detail-btn"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => openMenuItem(d.id)}
                  >
                    <span>Xem chi tiết món</span>
                    <span className="sig-detail-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <div className="sig-plate-col">
          <div className="sig-plate-box">
            <svg className="sig-progress-svg" viewBox="0 0 240 240" aria-hidden="true">
              <circle cx="120" cy="120" r={ARC_R} fill="none" stroke="hsla(38, 61%, 73%, 0.2)" strokeWidth="0.75" />
              <circle
                className="sig-arc"
                cx="120"
                cy="120"
                r={ARC_R}
                fill="none"
                stroke="var(--gold-crayola)"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeDasharray={ARC_CIRC}
                strokeDashoffset={ARC_CIRC * 0.75}
              />
              <circle
                cx="120"
                cy="120"
                r="109"
                fill="none"
                stroke="hsla(38, 61%, 73%, 0.22)"
                strokeWidth="0.75"
                strokeDasharray="2.4 4.4"
              />
            </svg>

            <div className="sig-ring" aria-hidden="true">
              {Array.from({ length: n }).map((_, i) => (
                <span key={i} className="sig-ring-dot" style={{ transform: `rotate(${(360 / n) * i}deg)` }}>
                  <span />
                </span>
              ))}
            </div>

            <div className="sig-media-stack">
              {signatureDishes.map((d) => (
                <div className="sig-media-item" key={d.id}>
                  <img src={d.image} width="1400" height="934" loading="lazy" alt={d.name} className="img-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="sig-nav" aria-label="Chọn món đặc trưng">
          {signatureDishes.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                className={`sig-nav-btn ${active === i ? 'is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-current={active === i ? 'true' : undefined}
              >
                <span className="sig-nav-bar" aria-hidden="true" />
                <span className="num">{d.index}</span>
                <span className="name">{d.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
