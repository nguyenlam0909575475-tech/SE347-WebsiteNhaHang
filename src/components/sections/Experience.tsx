import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { experiences } from '../../data/content'
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import { prefillReservation } from '../../lib/events'
import type { PourScene } from '../three/PourScene'
import { createPourState, POUR_POSE, type WineKind } from '../three/pourState'
import SectionHead from '../ui/SectionHead'
import { IconDrag } from '../ui/Icons'

const wineOptions: {
  id: WineKind
  label: string
  vintage: string
  tempTitle: string
  tempText: string
  pair: string
}[] = [
  {
    id: 'red',
    label: 'Vang đỏ',
    vintage: 'Château L’Orme · Bordeaux 2019',
    tempTitle: 'Rót chậm ở 16 – 18°C',
    tempText:
      'Vang đỏ Haut-Médoc được rót đúng một phần ba bầu pha lê để mặt thoáng rộng, hương gỗ sồi và mận chín mở dần theo hơi ấm.',
    pair: 'Hợp thăn bò Wagyu MB6, sườn heo nướng mật ong rừng',
  },
  {
    id: 'rose',
    label: 'Vang hồng',
    vintage: 'Domaine d’Étoile · Provence 2022',
    tempTitle: 'Giữ mát ở 10 – 12°C',
    tempText:
      'Vang hồng Provence giữ lạnh vừa tới để sắc hồng cá hồi trong trẻo, hương bưởi đào tươi mát cân bằng khói than nhẹ.',
    pair: 'Hợp cá chẽm nướng than, salad bơ sáp & đậu gà',
  },
  {
    id: 'white',
    label: 'Vang trắng',
    vintage: 'Clos Sainte-Odile · Alsace 2021',
    tempTitle: 'Ướp lạnh ở 8 – 10°C',
    tempText:
      'Vang trắng Alsace ướp trong xô đá tại bàn, giữ độ chua thanh sắc nét của táo xanh và hậu vị khoáng thanh thoát.',
    pair: 'Hợp cá hồi áp chảo sốt chanh dây, risotto nấm truffle',
  },
]

/**
 * Pinned Three.js + ScrollTrigger showcase:
 * Scrolling lifts the bespoke Bordeaux/Burgundy/Alsace bottle, tilts it over the
 * double-walled crystal stemware, pours a tapered gravity stream, ripples the meniscus,
 * and returns smoothly to the walnut table beside a flickering brass candelabra.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PourScene | null>(null)
  const state = useRef(createPourState())
  const [wine, setWine] = useState<WineKind>('red')
  const [stepIdx, setStepIdx] = useState(0)
  const [noWebGL, setNoWebGL] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const expTilts = useRef<{ rx: gsap.QuickToFunc; ry: gsap.QuickToFunc }[]>([])

  const current = wineOptions.find((w) => w.id === wine)!

  const steps = [
    {
      title: 'Chọn chai theo món nướng',
      text: 'Tủ vang giữ 140 nhãn ở hai vùng nhiệt độ độc lập. Sommelier hỏi bạn gọi món gì trước, rồi mới mang chai ra mở nút tại bàn.',
    },
    {
      title: current.tempTitle,
      text: current.tempText,
    },
    {
      title: 'Xoay nhẹ ly & thưởng cùng món',
      text: 'Mỗi tối thứ Sáu bếp lên thực đơn 5 ly rót thử, đi kèm 5 phần nướng nhỏ vừa rời vỉ than.',
    },
  ]

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const s = state.current
      const stepsEl = q('.pour-step')
      const mm = gsap.matchMedia()

      const build = (tl: gsap.core.Timeline) => {
        gsap.set(stepsEl[0], { autoAlpha: 1, y: 0 })
        gsap.set(stepsEl.slice(1), { autoAlpha: 0, y: 20 })

        tl
          // Phase 1: Lift bottle from walnut table & arc over crystal glass while keeping full bottle & punt inside frame
          .to(s, { camX: 0.048, camY: 0.252, camZ: 0.96, lookX: 0.034, lookY: 0.172, duration: 1.0, ease: 'power2.inOut' }, 0)
          .to(s, { px: POUR_POSE.px, py: POUR_POSE.py, roll: POUR_POSE.roll, duration: 0.95, ease: 'power2.inOut' }, 0.08)
          .to(s, { tilt: POUR_POSE.tilt, duration: 0.95, ease: 'power2.inOut' }, 0.2)

          // Phase 2: Stream leaves open lip, fills crystal bowl, ripples meniscus
          .addLabel('pour', 1.05)
          .to(stepsEl[0], { autoAlpha: 0, y: -18, duration: 0.24, ease: 'power2.in' }, 'pour-=0.12')
          .to(stepsEl[1], { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 'pour+=0.08')
          .to(s, { streamHead: 1, duration: 0.28, ease: 'power1.in' }, 'pour')
          .to(s, { fill: 1, glow: 1.25, swirl: 0.9, duration: 1.45, ease: 'sine.inOut' }, 'pour+=0.15')

          // Phase 3: Sommelier wrist twist stops drip, bottle settles back upright with front label crisp toward viewer
          .addLabel('poured', 2.55)
          .to(s, { streamTail: 1, duration: 0.26, ease: 'power1.in' }, 'poured')
          .to(s, { tilt: 0, py: 0.18, px: 0.128, roll: -0.12, swirl: 0.25, duration: 1.05, ease: 'power2.inOut' }, 'poured+=0.12')
          .to(s, { camX: 0.036, camY: 0.222, camZ: 0.78, lookX: 0.032, lookY: 0.145, glow: 1.0, duration: 1.1, ease: 'power2.inOut' }, 'poured+=0.22')
          .to(stepsEl[1], { autoAlpha: 0, y: -18, duration: 0.24, ease: 'power2.in' }, 'poured+=0.25')
          .to(stepsEl[2], { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 'poured+=0.45')
          .to(s, { swirl: 0, duration: 0.45 }, 'poured+=0.85')

        return tl
      }

      mm.add(MQ.desktop, () => {
        const tl = build(
          gsap.timeline({
            scrollTrigger: {
              trigger: q('.pour-pin')[0],
              start: 'top top',
              end: () => `+=${window.innerHeight * 2.35}`,
              pin: true,
              scrub: 0.85,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(q('.pour-rail-fill'), { scaleY: self.progress })
                const nextIdx = self.progress < 0.31 ? 0 : self.progress < 0.72 ? 1 : 2
                setStepIdx((prev) => (prev === nextIdx ? prev : nextIdx))
              },
            },
          }),
        )
        return () => tl.kill()
      })

      mm.add(MQ.mobile, () => {
        const tl = build(gsap.timeline({ paused: true }))
        ScrollTrigger.create({
          trigger: q('.pour-pin')[0],
          start: 'top 58%',
          once: true,
          onEnter: () => {
            tl.play()
            gsap.to(q('.pour-rail-fill'), { scaleY: 1, duration: tl.duration(), ease: 'none' })
          },
        })
      })

      mm.add(MQ.reduced, () => {
        Object.assign(s, {
          fill: 1,
          tilt: 0,
          roll: -0.12,
          px: 0.128,
          py: 0.18,
          camX: 0.036,
          camY: 0.222,
          camZ: 0.78,
          lookX: 0.032,
          lookY: 0.145,
          glow: 1,
        })
        gsap.set(stepsEl[0], { autoAlpha: 0 })
        gsap.set(stepsEl[1], { autoAlpha: 0 })
        gsap.set(stepsEl[2], { autoAlpha: 1, y: 0 })
      })

      mm.add(MQ.motion, () => {
        const expHeadSplit = SplitText.create(q('#exp-list-title')[0], { type: 'lines', mask: 'lines' })

        gsap
          .timeline({ scrollTrigger: { trigger: q('.exp-list .section-head')[0], start: 'top 82%', once: true } })
          .from(q('.exp-list .section-subtitle'), { y: 14, autoAlpha: 0, duration: 0.55, ease: 'power3.out' })
          .from(expHeadSplit.lines, { yPercent: 112, autoAlpha: 0, duration: 0.85, ease: 'expo.out' }, 0.08)
          .from(q('.exp-list .section-head .section-text'), { y: 16, autoAlpha: 0, duration: 0.65, ease: 'power3.out' }, 0.22)

        const cards = q('.exp-card') as HTMLElement[]
        gsap
          .timeline({ scrollTrigger: { trigger: q('.exp-grid')[0], start: 'top 82%', once: true } })
          .fromTo(
            cards,
            { y: 50, autoAlpha: 0, clipPath: 'inset(14% 0% 0% 0%)' },
            {
              y: 0,
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
              stagger: 0.11,
              duration: 0.95,
              ease: 'expo.out',
              clearProps: 'clipPath',
            },
          )
          .from(
            q('.exp-media img'),
            { scale: 1.18, stagger: 0.11, duration: 1.25, ease: 'expo.out', clearProps: 'transform' },
            0.04,
          )
          .from(
            q('.exp-meta'),
            { y: -12, autoAlpha: 0, stagger: 0.11, duration: 0.55, ease: 'power3.out' },
            0.35,
          )

        // Subtle inner-photo depth parallax while scrolling past the 4 experience cards
        gsap.fromTo(
          q('.exp-media-parallax'),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: q('.exp-grid')[0], start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )

        // Smooth 3D tilt per card via gsap.quickTo
        expTilts.current = cards.map((card) => {
          gsap.set(card, { transformPerspective: 950 })
          return {
            rx: gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3.out' }),
            ry: gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3.out' }),
          }
        })

        return () => {
          expHeadSplit.revert()
          expTilts.current = []
        }
      })
    },
    { scope: root },
  )

  useEffect(() => {
    const wrap = canvasWrap.current
    if (!wrap) return
    let scene: PourScene | null = null
    let cancelled = false
    let visibleObs: IntersectionObserver | null = null

    const init = async () => {
      try {
        const mod = await import('../three/PourScene')
        if (cancelled) return
        if (!mod.webglAvailable()) {
          setNoWebGL(true)
          return
        }
        scene = new mod.PourScene(wrap, state.current)
        sceneRef.current = scene
        setLoaded(true)
        visibleObs = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? scene?.start() : scene?.stop()),
          { rootMargin: '250px' },
        )
        visibleObs.observe(wrap)
      } catch (err) {
        console.error('[PourScene init error]', err)
        setNoWebGL(true)
      }
    }

    let started = false
    const startOnce = () => {
      if (started) return
      started = true
      loadObs.disconnect()
      window.clearTimeout(idleTimer)
      void init()
    }

    const loadObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startOnce()
      },
      { rootMargin: '2200px 0px' },
    )
    loadObs.observe(wrap)

    const idleTimer = window.setTimeout(startOnce, 1600)

    return () => {
      cancelled = true
      window.clearTimeout(idleTimer)
      loadObs.disconnect()
      visibleObs?.disconnect()
      scene?.dispose()
      sceneRef.current = null
    }
  }, [])

  const chooseWine = (w: WineKind) => {
    setWine(w)
    sceneRef.current?.setWine(w, prefersReducedMotion())
  }

  const onExpCardMove = (idx: number, e: PointerEvent<HTMLLIElement>) => {
    const t = expTilts.current[idx]
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--ex', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--ey', `${e.clientY - r.top}px`)
    if (!t || prefersReducedMotion()) return
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    t.ry(nx * 8)
    t.rx(-ny * 7)
  }

  const onExpCardLeave = (idx: number) => {
    const t = expTilts.current[idx]
    if (!t) return
    t.rx(0)
    t.ry(0)
  }

  const reserveExperience = (id: string, title: string) => {
    prefillReservation({
      experience: title,
      area: id === 'private' ? 'private' : id === 'acoustic' ? 'balcony' : 'indoor',
      guests: id === 'private' ? 8 : 2,
    })
    scrollToTarget('reservation')
  }

  return (
    <section ref={root} id="experience" className="experience" aria-labelledby="experience-title">
      <div className="pour-pin">
        <div className="container pour-grid">
          <div className="pour-copy">
            <SectionHead
              subtitle="Trải nghiệm tại bàn"
              title={<span id="experience-title">Một ly vang, rót đúng lúc</span>}
              align="left"
            />

            <div className="pour-stepper-wrap">
              <div className="pour-rail" aria-hidden="true">
                <span className="pour-rail-fill" />
                {steps.map((_, i) => (
                  <span key={i} className={`pour-rail-dot ${stepIdx >= i ? 'is-on' : ''}`} />
                ))}
              </div>

              <div className="pour-steps" aria-live="polite">
                {steps.map((s, i) => (
                  <div className="pour-step" key={i}>
                    <span className="pour-step-num">Bước 0{i + 1} / 03</span>
                    <h3 className="title-2">{s.title}</h3>
                    <p className="section-text">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pour-wines">
              <div className="pour-wines-head">
                <p className="modal-label">Đổi chai vang trên bàn</p>
                <span className="pour-vintage">{current.vintage}</span>
              </div>
              <div className="pour-wine-btns" role="radiogroup" aria-label="Loại vang">
                {wineOptions.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    role="radio"
                    aria-checked={wine === w.id}
                    className={`menu-tag wine-${w.id} ${wine === w.id ? 'is-active' : ''}`}
                    onClick={() => chooseWine(w.id)}
                  >
                    <span className="wine-dot" aria-hidden="true" />
                    {w.label}
                  </button>
                ))}
              </div>
              <p className="body-4 muted pour-pair">{current.pair}</p>
            </div>
          </div>

          <div className="pour-stage">
            <div
              ref={canvasWrap}
              className={`pour-canvas-wrap ${loaded ? 'is-loaded' : ''}`}
              aria-label="Không gian 3D bàn tiệc với chai vang, ly pha lê và nến đồng — kéo ngang để xoay góc nhìn"
              role="img"
            >
              {noWebGL && <img src="images/exp-wine.webp" alt="Tủ vang của Grilli" className="img-cover pour-fallback" />}
            </div>
            {!noWebGL && (
              <div className="pour-controls">
                <button type="button" className="pour-rot-btn" aria-label="Xoay sang trái" onClick={() => sceneRef.current?.rotateBy(-0.45)}>
                  ‹
                </button>
                <p className="pour-hint label-2">
                  <IconDrag size={16} /> Kéo để xoay 360°
                </p>
                <button type="button" className="pour-rot-btn" aria-label="Xoay sang phải" onClick={() => sceneRef.current?.rotateBy(0.45)}>
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section exp-list">
        <div className="container">
          <SectionHead
            subtitle="Dành cho dịp đặc biệt"
            title={<span id="exp-list-title">Bốn cách để ở lại lâu hơn</span>}
            text="Các trải nghiệm dưới đây cần đặt trước ít nhất 24 giờ. Lễ tân sẽ gọi lại để chốt thực đơn và số khách."
          />
          <ul className="exp-grid">
            {experiences.map((e, idx) => (
              <li
                key={e.id}
                className="exp-card"
                onPointerMove={(ev) => onExpCardMove(idx, ev)}
                onPointerLeave={() => onExpCardLeave(idx)}
              >
                <span className="exp-card-bar" aria-hidden="true" />
                <figure className="exp-media img-holder has-shine">
                  <div className="exp-media-parallax">
                    <img src={e.image} width="1000" height="1250" loading="lazy" alt={e.title} className="img-cover" />
                  </div>
                </figure>
                <span className="exp-meta label-2">{e.meta}</span>
                <div className="exp-body">
                  <h3 className="title-2 exp-card-title">{e.title}</h3>
                  <p className="body-4 exp-text">{e.text}</p>
                  <div className="exp-foot">
                    <span className="exp-price">{e.price}</span>
                    <button type="button" className="exp-cta-btn" onClick={() => reserveExperience(e.id, e.title)}>
                      <span>Đặt trải nghiệm này</span>
                      <span className="exp-cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
