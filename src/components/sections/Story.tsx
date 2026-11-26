import { useRef, type PointerEvent } from 'react'
import { story } from '../../data/content'
import { site } from '../../data/site'
import { gsap, SplitText, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import SectionHead from '../ui/SectionHead'

const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN')

export default function Story() {
  const root = useRef<HTMLElement>(null)
  const bannerRef = useRef<HTMLElement>(null)
  const quickFns = useRef<{
    mainRX: gsap.QuickToFunc
    mainRY: gsap.QuickToFunc
    subX: gsap.QuickToFunc
    subY: gsap.QuickToFunc
    badgeX: gsap.QuickToFunc
    badgeY: gsap.QuickToFunc
  } | null>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        // 1. Editorial SplitText masked line reveal for title & paragraphs + scrubbed quote illumination
        const titleSplit = SplitText.create(q('#story-title')[0], { type: 'lines', mask: 'lines' })
        const paraSplits = q('.story-para').map((el) => SplitText.create(el, { type: 'lines', mask: 'lines' }))
        const quoteSplit = SplitText.create(q('.story-quote p')[0], { type: 'words' })

        const copyTl = gsap.timeline({
          scrollTrigger: { trigger: q('.story-copy')[0], start: 'top 78%', once: true },
        })

        copyTl
          .from(q('.story-copy .section-subtitle'), { y: 16, autoAlpha: 0, duration: 0.65, ease: 'power3.out' })
          .from(
            titleSplit.lines,
            { yPercent: 112, autoAlpha: 0, stagger: 0.11, duration: 0.95, ease: 'expo.out' },
            0.12,
          )
          .from(
            paraSplits.flatMap((s) => s.lines),
            { yPercent: 105, autoAlpha: 0, stagger: 0.045, duration: 0.78, ease: 'power3.out' },
            0.34,
          )
          .fromTo(
            q('.story-quote-bar'),
            { scaleY: 0 },
            { scaleY: 1, duration: 0.75, ease: 'expo.out' },
            0.55,
          )
          .from(q('.story-quote cite, .story-call'), { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, 0.7)

        // Word-by-word ember glow on the chef's story quote as the user reads down
        gsap.fromTo(
          quoteSplit.words,
          { opacity: 0.24, y: 6 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: q('.story-quote')[0],
              start: 'top 84%',
              end: 'bottom 58%',
              scrub: 0.45,
            },
          },
        )

        // 2. Layered collage reveal: golden curtain sweep + decoupled parallax wrappers (zero tween conflict!)
        const banner = q('.story-banner')[0]
        gsap
          .timeline({ scrollTrigger: { trigger: banner, start: 'top 78%', once: true } })
          .fromTo(
            q('.story-main'),
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' },
          )
          .fromTo(
            q('.story-curtain'),
            { scaleY: 1 },
            { scaleY: 0, transformOrigin: 'top center', duration: 0.95, ease: 'expo.inOut' },
            0.32,
          )
          .from(q('.story-main img'), { scale: 1.24, duration: 1.65, ease: 'expo.out' }, 0.05)
          .fromTo(
            q('.abs-img-1-inner'),
            { clipPath: 'inset(100% 0% 0% 0%)', y: 28 },
            { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.05, ease: 'expo.out' },
            0.52,
          )
          .from(q('.abs-img-1 img'), { scale: 1.2, duration: 1.25, ease: 'power3.out' }, 0.52)
          .from(q('.abs-img-1-pattern'), { scaleY: 0, autoAlpha: 0, duration: 0.85, ease: 'power3.out' }, 0.62)
          .from(q('.abs-img-2'), { scale: 0.55, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.72)

        // Continuous ambient badge spin + scroll-driven acceleration on separate wrapper
        gsap.to(q('.badge-ring'), { rotation: 360, duration: 24, ease: 'none', repeat: -1 })
        gsap.to(q('.badge-scroll-wrap'), {
          rotation: 160,
          ease: 'none',
          scrollTrigger: { trigger: banner, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        })

        // Smooth depth parallax on decoupled wrappers while scrolling past
        gsap.fromTo(
          q('.story-main-parallax'),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: banner, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.fromTo(
          q('.abs-img-1'),
          { y: 24 },
          {
            y: -38,
            ease: 'none',
            scrollTrigger: { trigger: banner, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.to(q('.shape-story'), {
          y: -90,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        // Interactive pointer 3D depth across the 3-layer Story collage
        const mainTilt = q('.story-main-tilt')[0] as HTMLElement
        const subLayer = q('.abs-img-1-inner')[0] as HTMLElement
        const badgeLayer = q('.abs-img-2')[0] as HTMLElement
        gsap.set(banner, { transformPerspective: 1000 })

        quickFns.current = {
          mainRX: gsap.quickTo(mainTilt, 'rotationX', { duration: 0.55, ease: 'power3.out' }),
          mainRY: gsap.quickTo(mainTilt, 'rotationY', { duration: 0.55, ease: 'power3.out' }),
          subX: gsap.quickTo(subLayer, 'x', { duration: 0.55, ease: 'power3.out' }),
          subY: gsap.quickTo(subLayer, 'y', { duration: 0.55, ease: 'power3.out' }),
          badgeX: gsap.quickTo(badgeLayer, 'x', { duration: 0.5, ease: 'power3.out' }),
          badgeY: gsap.quickTo(badgeLayer, 'y', { duration: 0.5, ease: 'power3.out' }),
        }

        return () => {
          titleSplit.revert()
          paraSplits.forEach((s) => s.revert())
          quoteSplit.revert()
          quickFns.current = null
        }
      })

      // Counters
      q('.stat-number').forEach((el) => {
        const target = Number(el.dataset.value)
        const suffix = el.dataset.suffix ?? ''
        if (window.matchMedia(MQ.reduced).matches) {
          el.textContent = fmt(target) + suffix
          return
        }
        const obj = { v: 0 }
        el.textContent = '0' + suffix
        gsap.to(obj, {
          v: target,
          duration: target > 1000 ? 2.4 : 1.8,
          ease: 'power2.out',
          snap: { v: 1 },
          onUpdate: () => (el.textContent = fmt(obj.v) + suffix),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
      gsap.from(q('.stat'), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        scrollTrigger: { trigger: q('.stats')[0], start: 'top 88%', once: true },
      })
    },
    { scope: root },
  )

  const onBannerMove = (e: PointerEvent<HTMLElement>) => {
    if (!quickFns.current || prefersReducedMotion()) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    quickFns.current.mainRY(nx * 6)
    quickFns.current.mainRX(-ny * 5)
    quickFns.current.subX(nx * 16)
    quickFns.current.subY(ny * 14)
    quickFns.current.badgeX(-nx * 12)
    quickFns.current.badgeY(-ny * 12)
  }

  const onBannerLeave = () => {
    if (!quickFns.current) return
    quickFns.current.mainRX(0)
    quickFns.current.mainRY(0)
    quickFns.current.subX(0)
    quickFns.current.subY(0)
    quickFns.current.badgeX(0)
    quickFns.current.badgeY(0)
  }

  return (
    <section ref={root} id="story" className="section about" aria-labelledby="story-title">
      <div className="container">
        <div className="about-grid">
          <div className="story-copy">
            <SectionHead
              subtitle={story.subtitle}
              title={
                <span id="story-title">
                  {story.title[0]} <br className="br-lg" />
                  {story.title[1]}
                </span>
              }
              align="left"
            />
            {story.paragraphs.map((p) => (
              <p key={p.slice(0, 16)} className="section-text story-para">
                {p}
              </p>
            ))}

            <blockquote className="story-quote">
              <span className="story-quote-bar" aria-hidden="true" />
              <p>“{story.quote}”</p>
              <cite>— {story.quoteBy}</cite>
            </blockquote>

            <div className="story-call">
              <span className="contact-label">Đặt bàn qua điện thoại</span>
              <a href={site.phoneHref} className="body-1 contact-number hover-underline">
                {site.phone}
              </a>
            </div>
          </div>

          <figure
            ref={bannerRef}
            className="story-banner"
            onPointerMove={onBannerMove}
            onPointerLeave={onBannerLeave}
          >
            <div className="story-main-tilt">
              <div className="story-main img-holder has-shine">
                <span className="story-curtain" aria-hidden="true" />
                <div className="story-main-parallax">
                  <img
                    src="images/story-main.webp"
                    width="900"
                    height="1200"
                    loading="lazy"
                    alt="Thịt nướng xèo trên vỉ than hồng rực tại bếp Grilli"
                    className="img-cover"
                  />
                </div>
              </div>
            </div>

            <div className="abs-img abs-img-1">
              <span className="abs-img-1-pattern" aria-hidden="true" />
              <div className="abs-img-1-inner has-shine">
                <img
                  src="images/story-small.webp"
                  width="285"
                  height="285"
                  loading="lazy"
                  alt="Đầu bếp bày thăn bò nướng ra đĩa tại bàn pass"
                  className="w-100"
                />
              </div>
            </div>

            <div className="abs-img abs-img-2" aria-hidden="true">
              <span className="badge-scroll-wrap">
                <svg viewBox="0 0 140 140" className="badge-ring">
                  <defs>
                    <path id="badge-circle" d="M70,70 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0" />
                  </defs>
                  <text>
                    <textPath href="#badge-circle" textLength="340" lengthAdjust="spacing">
                      BẾP THAN HOA · NGUYÊN LIỆU TRONG NGÀY ·
                    </textPath>
                  </text>
                </svg>
              </span>
              <span className="badge-text">
                <span className="small">Từ</span>
                <span className="big">2012</span>
              </span>
            </div>
          </figure>
        </div>

        <ul className="stats" aria-label="Một vài con số">
          {story.stats.map((s) => (
            <li className="stat" key={s.label}>
              <span className="stat-number" data-value={s.value} data-suffix={s.suffix}>
                {fmt(s.value)}
                {s.suffix}
              </span>
              <span className="stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <img
        src="images/grilli/shape-3.png"
        width="615"
        height="1009"
        loading="lazy"
        alt=""
        className="shape shape-story"
        aria-hidden="true"
      />
    </section>
  )
}
