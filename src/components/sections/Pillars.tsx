import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import SectionHead from '../ui/SectionHead'

const pillars = [
  {
    id: 'fire',
    label: 'Lửa bếp',
    title: 'Than nhãn & than đước',
    text: 'Nhóm lò từ 9 giờ sáng để than đượm hồng không khói đen, giữ trọn vị ngọt tự nhiên của từng thớ thịt.',
    image: 'images/pillar-1.webp',
    target: 'signature',
    cta: 'Xem món đặc trưng',
  },
  {
    id: 'seafood',
    label: 'Chợ sớm',
    title: 'Nguyên liệu về lúc 6 giờ',
    text: 'Cá chẽm Vũng Tàu, tôm sú Phan Thiết và rau mầm Củ Chi nhận mới mỗi sáng, hết trong ngày là tạm ngưng.',
    image: 'images/pillar-2.webp',
    target: 'menu',
    cta: 'Xem thực đơn',
  },
  {
    id: 'cellar',
    label: 'Hầm vang & Quầy bar',
    title: '140 nhãn vang & khói gỗ',
    text: 'Vang mở theo ly đổi mỗi tuần và những ly cocktail xông khói gỗ sồi pha ngay tại bàn.',
    image: 'images/pillar-3.webp',
    target: 'experience',
    cta: 'Khám phá tủ vang',
  },
]

/**
 * Grilli's signature 3-column architectural showcase (#service in original template),
 * upgraded with:
 *  - Staggered clip-path curtain reveal + scale settle
 *  - Differential ScrollTrigger scrub parallax (outer cards vs center card)
 *  - Subtle 60fps pointer 3D tilt via `gsap.quickTo` on fine-pointer desktops
 */
export default function Pillars() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const cards = q('.pillar-card') as HTMLElement[]
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: q('.pillars-grid')[0], start: 'top 80%', once: true },
          })
          .fromTo(
            q('.pillar-banner'),
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, stagger: 0.14, ease: 'power4.inOut' },
          )
          .from(q('.pillar-banner img'), { scale: 1.22, duration: 1.4, stagger: 0.14, ease: 'power3.out' }, 0)
          .from(q('.pillar-pattern'), { scaleY: 0, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out' }, 0.35)
          .from(q('.pillar-body > *'), { y: 18, autoAlpha: 0, duration: 0.65, stagger: 0.06 }, 0.5)

        gsap.to(q('.shape-pillar-1'), {
          y: -70,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
        gsap.to(q('.shape-pillar-2'), {
          y: 65,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      mm.add(MQ.desktop, () => {
        // Differential column scrub depth: center column floats counter to outer columns
        cards.forEach((card, i) => {
          const yShift = i === 1 ? 28 : -24
          gsap.fromTo(
            card,
            { y: -yShift },
            {
              y: yShift,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          )
        })

        // Fine-pointer subtle 3D tilt using gsap.quickTo (zero GC per mousemove)
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        const cleanups = cards.map((card) => {
          const inner = card.querySelector<HTMLElement>('.pillar-figure-wrap')
          if (!inner) return () => {}
          gsap.set(inner, { transformPerspective: 900 })
          const rx = gsap.quickTo(inner, 'rotationX', { duration: 0.45, ease: 'power3.out' })
          const ry = gsap.quickTo(inner, 'rotationY', { duration: 0.45, ease: 'power3.out' })

          const onMove = (e: PointerEvent) => {
            const r = inner.getBoundingClientRect()
            const nx = (e.clientX - r.left) / r.width - 0.5
            const ny = (e.clientY - r.top) / r.height - 0.5
            ry(nx * 7)
            rx(-ny * 7)
          }
          const onLeave = () => {
            rx(0)
            ry(0)
          }
          inner.addEventListener('pointermove', onMove)
          inner.addEventListener('pointerleave', onLeave)
          return () => {
            inner.removeEventListener('pointermove', onMove)
            inner.removeEventListener('pointerleave', onLeave)
          }
        })
        return () => cleanups.forEach((fn) => fn())
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section pillars bg-black-10 text-center" aria-labelledby="pillars-title">
      <div className="container">
        <SectionHead
          subtitle="Ba điều giữ lửa"
          title={<span id="pillars-title">Từ chợ sớm đến bàn ăn tối</span>}
          text="Ba thói quen được căn bếp số 102 Đường số 9 giữ nguyên suốt mười bốn năm qua."
        />

        <ul className="pillars-grid">
          {pillars.map((p) => (
            <li key={p.id} className="pillar-card">
              <div className="pillar-figure-wrap">
                <span className="pillar-pattern" aria-hidden="true" />
                <figure className="pillar-banner img-holder has-shine">
                  <img src={p.image} width="570" height="672" loading="lazy" alt={p.title} className="img-cover" />
                </figure>
              </div>
              <div className="pillar-body">
                <p className="label-2 gold pillar-label">{p.label}</p>
                <h3 className="title-2 pillar-title">{p.title}</h3>
                <p className="body-4 muted pillar-text">{p.text}</p>
                <button type="button" className="btn-text hover-underline" onClick={() => scrollToTarget(p.target)}>
                  {p.cta}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <img src="images/grilli/shape-1.png" width="246" height="412" loading="lazy" alt="" className="shape shape-pillar-1" aria-hidden="true" />
      <img src="images/grilli/shape-2.png" width="343" height="345" loading="lazy" alt="" className="shape shape-pillar-2" aria-hidden="true" />
    </section>
  )
}
