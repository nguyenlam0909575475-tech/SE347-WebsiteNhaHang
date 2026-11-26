import { useRef, useState } from 'react'
import { gallery, galleryFilters, type GalleryCategory } from '../../data/content'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import SectionHead from '../ui/SectionHead'
import Lightbox from '../ui/Lightbox'

type Filter = 'all' | GalleryCategory

/**
 * Gallery = Aurelia's horizontal scroll + Savoria's filters and lightbox.
 * Desktop: the panel pins and vertical scroll drives the strip sideways
 * (ease "none" so scroll and position stay 1:1); each photo also drifts inside
 * its frame via containerAnimation. Mobile: native swipe with scroll-snap.
 */
export default function Gallery() {
  const root = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const items = gallery.filter((g) => filter === 'all' || g.category === filter)
  const firstRun = useRef(true)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const track = q('.gallery-track')[0] as HTMLElement
      const mm = gsap.matchMedia()

      mm.add(MQ.desktop, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const frames = q('.gallery-frame')
        const skewTo = gsap.quickTo(frames, 'skewX', { duration: 0.35, ease: 'power3.out' })
        const clampSkew = gsap.utils.pipe(gsap.utils.clamp(-2200, 2200), gsap.utils.mapRange(-2200, 2200, 2.8, -2.8))
        let settle: gsap.core.Tween | null = null

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.gallery-pin')[0],
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(q('.gallery-progress-bar'), { scaleX: self.progress })
              skewTo(clampSkew(self.getVelocity()))
              settle?.kill()
              settle = gsap.delayedCall(0.14, () => skewTo(0))
            },
          },
        })

        q('.gallery-item img').forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: scrollTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })

        return () => void settle?.kill()
      })

      mm.add(MQ.motion, () => {
        gsap.from(q('.gallery-item'), {
          y: 40,
          autoAlpha: 0,
          stagger: 0.06,
          duration: 0.8,
          ...(firstRun.current ? { scrollTrigger: { trigger: track, start: 'top 85%', once: true } } : {}),
        })
      })

      if (!firstRun.current) {
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      }
      firstRun.current = false
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  )

  const changeFilter = (f: Filter) => {
    if (f === filter) return
    const pin = root.current?.querySelector('.gallery-pin')
    const st = ScrollTrigger.getAll().find((t) => t.pin === pin)
    if (st && window.scrollY > st.start + 4) scrollToTarget(st.start, true)
    setFilter(f)
  }

  return (
    <section ref={root} id="gallery" className="gallery bg-smoky" aria-labelledby="gallery-title">
      <div className="gallery-pin">
        <div className="container gallery-top">
          <SectionHead
            subtitle="Thư viện ảnh"
            title={<span id="gallery-title">Một ngày ở Grilli</span>}
            align="left"
          />
          <div className="gallery-tools">
            <div className="gallery-filters" role="group" aria-label="Lọc ảnh">
              {galleryFilters.map((f) => (
                <button
                  key={f.id}
                  className={`menu-tag ${filter === f.id ? 'is-active' : ''}`}
                  aria-pressed={filter === f.id}
                  onClick={() => changeFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="gallery-hint" aria-hidden="true">
              <span className="gallery-progress">
                <span className="gallery-progress-bar" />
              </span>
              <span>{items.length} ảnh · cuộn để xem tiếp</span>
            </div>
          </div>
        </div>

        <ul className="gallery-track">
          {items.map((g, i) => (
            <li key={g.id} className={`gallery-item shape-${g.shape}`}>
              <button className="gallery-btn" onClick={() => setLightbox(i)} aria-label={`Xem lớn: ${g.caption}`}>
                <span className="gallery-frame">
                  <img src={g.src} alt={g.caption} loading="lazy" width="1200" height="800" />
                </span>
                <span className="gallery-caption">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  {g.caption}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox items={items} index={lightbox} onChange={setLightbox} />
    </section>
  )
}
