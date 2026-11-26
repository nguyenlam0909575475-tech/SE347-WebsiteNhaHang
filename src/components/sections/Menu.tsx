import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { categories, menu, tagLabels, formatPrice, type MenuCategory, type MenuItem, type MenuTag } from '../../data/menu'
import { gsap, Flip, ScrollTrigger, SplitText, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import { EVT_OPEN_MENU_ITEM } from '../../lib/events'
import SectionHead from '../ui/SectionHead'
import MenuDetail from '../ui/MenuDetail'

type Filter = 'all' | MenuCategory
const filterTags: MenuTag[] = ['signature', 'vegetarian', 'spicy', 'gluten-free']

/**
 * Interactive menu:
 * - SplitText header entrance + ScrollTrigger.batch row-by-row reveal with animated price-leader lines
 * - Cursor-tracked warm champagne spotlight & micro-interactions on each dish card
 * - Conflict-free GSAP Flip filtering (`absoluteOnLeave` + synchronized height tween, `overlap: false`)
 */
export default function Menu() {
  const root = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [tag, setTag] = useState<MenuTag | null>(null)
  const [openItem, setOpenItem] = useState<MenuItem | null>(null)
  const flipState = useRef<Flip.FlipState | null>(null)
  const prevHeight = useRef<number | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)
  const batchTriggers = useRef<ScrollTrigger[]>([])

  const visible = (item: MenuItem) => (filter === 'all' || item.category === filter) && (!tag || item.tags.includes(tag))
  const count = menu.filter(visible).length

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const headSplit = SplitText.create(q('#menu-title')[0], { type: 'lines', mask: 'lines' })
        gsap
          .timeline({ scrollTrigger: { trigger: q('.section-head')[0], start: 'top 82%', once: true } })
          .from(q('.section-head .section-subtitle'), { y: 14, autoAlpha: 0, duration: 0.55, ease: 'power3.out' })
          .from(headSplit.lines, { yPercent: 110, autoAlpha: 0, duration: 0.85, ease: 'expo.out' }, 0.08)
          .from(q('.section-head .section-text'), { y: 16, autoAlpha: 0, duration: 0.65, ease: 'power3.out' }, 0.22)

        gsap.from(q('.menu-controls'), {
          y: 22,
          autoAlpha: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: q('.menu-controls')[0], start: 'top 86%', once: true },
        })

        // Row-by-row batched reveal + horizontal price-leader line draw as user scrolls down the menu
        const initialCards = q('.menu-card:not(.is-hidden)')
        gsap.set(initialCards, { autoAlpha: 0, y: 26 })
        gsap.set(q('.menu-card:not(.is-hidden) .title-wrapper .line'), { scaleX: 0, transformOrigin: 'left center' })

        batchTriggers.current = ScrollTrigger.batch(initialCards, {
          interval: 0.08,
          batchMax: 2,
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.68,
              ease: 'power3.out',
              overwrite: true,
              clearProps: 'transform',
            })
            const lines = batch.flatMap((el) => Array.from((el as HTMLElement).querySelectorAll('.title-wrapper .line')))
            const imgs = batch.flatMap((el) => Array.from((el as HTMLElement).querySelectorAll('.card-banner img')))
            gsap.to(lines, {
              scaleX: 1,
              stagger: 0.08,
              duration: 0.75,
              delay: 0.14,
              ease: 'expo.out',
            })
            gsap.fromTo(
              imgs,
              { scale: 1.16 },
              { scale: 1, stagger: 0.08, duration: 0.85, ease: 'power3.out', clearProps: 'transform' },
            )
          },
        })

        gsap.to(q('.shape-menu-1'), {
          y: -110,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
        gsap.to(q('.shape-menu-2'), {
          y: 75,
          rotation: 10,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        return () => {
          headSplit.revert()
          batchTriggers.current.forEach((t) => t.kill())
          batchTriggers.current = []
        }
      })
    },
    { scope: root },
  )

  // Sliding underline under the active tab
  useGSAP(
    () => {
      const tabs = root.current!.querySelector<HTMLElement>('.menu-tabs')!
      const btn = tabs.querySelector<HTMLElement>(`[data-filter="${filter}"]`)
      if (!btn) return
      const line = tabs.querySelector('.menu-tab-line')
      const x = btn.offsetLeft
      const w = btn.offsetWidth
      gsap.to(line, { x, width: w, duration: 0.45, ease: 'power3.out' })
    },
    { scope: root, dependencies: [filter] },
  )

  // Flip after React has applied the new display states — keep grid height smoothly tweened
  // and only detach leaving cards (`absoluteOnLeave`) so `.menu-text` & `<Marquee />` never jump up over cards.
  useGSAP(
    () => {
      const state = flipState.current
      if (!state) return
      flipState.current = null
      const grid = root.current!.querySelector<HTMLElement>('.menu-grid')!
      const countEl = root.current!.querySelector<HTMLElement>('.menu-count')
      const fromH = prevHeight.current
      prevHeight.current = null

      gsap.set(grid, { clearProps: 'height' })
      const toH = grid.offsetHeight

      const ease = 'power3.out'
      const dur = 0.48

      if (countEl && !prefersReducedMotion()) {
        gsap.fromTo(countEl, { y: -6, autoAlpha: 0.35 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: 'power2.out' })
      }

      Flip.from(state, {
        duration: dur,
        ease,
        absoluteOnLeave: true,
        nested: true,
        prune: true,
        onEnter: (els) => {
          const lines = els.flatMap((el) => Array.from(el.querySelectorAll('.title-wrapper .line')))
          gsap.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.5, delay: 0.08, ease: 'expo.out' })
          return gsap.fromTo(
            els,
            { autoAlpha: 0, scale: 0.95 },
            { autoAlpha: 1, scale: 1, duration: 0.38, ease, clearProps: 'transform' },
          )
        },
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.95, duration: 0.22, ease: 'power2.in' }),
      })

      if (fromH !== null && Math.abs(fromH - toH) > 2) {
        gsap.fromTo(
          grid,
          { height: fromH },
          {
            height: toH,
            duration: dur,
            ease,
            overwrite: 'auto',
            clearProps: 'height',
            onComplete: () => ScrollTrigger.refresh(),
          },
        )
      } else {
        gsap.delayedCall(dur + 0.03, () => ScrollTrigger.refresh())
      }
    },
    { scope: root, dependencies: [filter, tag] },
  )

  const captureThen = contextSafe((fn: () => void) => {
    // Settle any pending scroll-batch reveals immediately so Flip captures clean resting boxes
    if (batchTriggers.current.length) {
      batchTriggers.current.forEach((t) => t.kill())
      batchTriggers.current = []
    }
    const grid = root.current!.querySelector<HTMLElement>('.menu-grid')!
    const cards = root.current!.querySelectorAll<HTMLElement>('.menu-card')
    const lines = root.current!.querySelectorAll<HTMLElement>('.title-wrapper .line')
    gsap.killTweensOf([grid, ...Array.from(cards), ...Array.from(lines)])
    gsap.set(cards, { autoAlpha: 1, clearProps: 'transform' })
    gsap.set(lines, { scaleX: 1 })
    prevHeight.current = grid.offsetHeight
    flipState.current = Flip.getState(cards)
    fn()
  })

  // Delegated cursor spotlight coordinates on hovered `.menu-card`
  const onGridPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.menu-card')
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  // Open from other sections (Signature "Xem chi tiết món")
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const item = menu.find((m) => m.id === id)
      if (item) {
        lastTrigger.current = document.activeElement as HTMLElement
        setOpenItem(item)
      }
    }
    window.addEventListener(EVT_OPEN_MENU_ITEM, onOpen)
    return () => window.removeEventListener(EVT_OPEN_MENU_ITEM, onOpen)
  }, [])

  return (
    <section ref={root} id="menu" className="section menu bg-smoky" aria-labelledby="menu-title">
      <div className="container">
        <SectionHead
          subtitle="Thực đơn chính"
          title={<span id="menu-title">Món ngon từ lửa than</span>}
          text="Giá đã gồm VAT, chưa gồm 5% phí phục vụ. Chạm vào từng món để xem chi tiết nguyên liệu, lưu ý dị ứng và rượu vang gợi ý dùng kèm."
        />

        <div className="menu-controls">
          <div className="menu-tabs" role="tablist" aria-label="Nhóm món">
            {categories.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={filter === c.id}
                data-filter={c.id}
                className={`menu-tab ${filter === c.id ? 'is-active' : ''}`}
                onClick={() => filter !== c.id && captureThen(() => setFilter(c.id))}
              >
                {c.label}
              </button>
            ))}
            <span className="menu-tab-line" aria-hidden="true" />
          </div>

          <div className="menu-tags" aria-label="Lọc theo đặc điểm">
            {filterTags.map((t) => (
              <button
                key={t}
                className={`menu-tag ${tag === t ? 'is-active' : ''}`}
                aria-pressed={tag === t}
                onClick={() => captureThen(() => setTag(tag === t ? null : t))}
              >
                {tagLabels[t]}
              </button>
            ))}
            <span className="menu-count" aria-live="polite">
              {count} món
            </span>
          </div>
        </div>

        <ul className="menu-grid" onPointerMove={onGridPointerMove}>
          {menu.map((item) => (
            <li key={item.id} className={`menu-card ${visible(item) ? '' : 'is-hidden'}`} data-flip-id={item.id}>
              <button
                type="button"
                className="menu-card-btn"
                onClick={(e) => {
                  lastTrigger.current = e.currentTarget
                  setOpenItem(item)
                }}
              >
                <figure className="card-banner img-holder">
                  <img src={item.image} width="200" height="200" loading="lazy" alt={item.name} className="img-cover" />
                </figure>
                <div className="menu-card-body">
                  <div className="title-wrapper">
                    <h3 className="title-3 card-title">{item.name}</h3>
                    <span className="line" aria-hidden="true" />
                    <span className="price">{formatPrice(item.price)}</span>
                  </div>
                  <p className="card-text">{item.short}</p>
                  <div className="card-foot">
                    {item.tags.length > 0 ? (
                      <ul className="card-tags" aria-label="Đặc điểm">
                        {item.tags.map((t) => (
                          <li key={t} className={`badge badge-${t}`}>
                            {tagLabels[t]}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span />
                    )}
                    <span className="card-more" aria-hidden="true">
                      Chi tiết →
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {count === 0 && (
          <p className="menu-empty">
            Chưa có món nào khớp cả hai bộ lọc này.{' '}
            <button
              type="button"
              className="btn-text hover-underline"
              onClick={() =>
                captureThen(() => {
                  setFilter('all')
                  setTag(null)
                })
              }
            >
              Xem lại toàn bộ thực đơn
            </button>
          </p>
        )}

        <p className="menu-text text-center">
          Phục vụ <span className="span">11:00 – 14:00</span> và <span className="span">17:30 – 22:00</span>. Bữa sáng 8:00 – 10:30 có thực đơn riêng.
        </p>
      </div>

      <img src="images/grilli/shape-5.png" width="921" height="1036" loading="lazy" alt="" className="shape shape-menu-1" aria-hidden="true" />
      <img src="images/grilli/shape-6.png" width="343" height="345" loading="lazy" alt="" className="shape shape-menu-2" aria-hidden="true" />

      <MenuDetail
        item={openItem}
        onClose={() => {
          setOpenItem(null)
          requestAnimationFrame(() => lastTrigger.current?.focus())
        }}
      />
    </section>
  )
}
