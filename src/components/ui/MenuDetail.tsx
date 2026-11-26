import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatPriceFull, tagLabels, type MenuItem } from '../../data/menu'
import { gsap, useGSAP } from '../../lib/gsap'
import { lockScroll, scrollToTarget } from '../../lib/scroll'
import { prefillReservation } from '../../lib/events'
import Button from './Button'
import { IconClose } from './Icons'

type Props = { item: MenuItem | null; onClose: () => void }

/** Dish detail dialog: ingredients, allergens and a drink pairing (Ember & Olive idea, per dish). */
export default function MenuDetail({ item, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const { contextSafe } = useGSAP({ scope: ref })

  useGSAP(
    () => {
      if (!item) return
      gsap
        .timeline()
        .fromTo('.modal-backdrop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
        .fromTo(
          '.modal-panel',
          { y: 40, autoAlpha: 0, clipPath: 'inset(8% 4% 8% 4%)' },
          { y: 0, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.out' },
          0.05,
        )
        .from('.modal-media img', { scale: 1.15, duration: 1, ease: 'power3.out' }, 0.1)
        .from('.modal-body > *', { y: 16, autoAlpha: 0, stagger: 0.05, duration: 0.45 }, 0.25)
    },
    { scope: ref, dependencies: [item], revertOnUpdate: true },
  )

  const close = contextSafe(() => {
    const el = ref.current
    if (!el) return onClose()
    gsap
      .timeline({ onComplete: onClose })
      .to(el.querySelector('.modal-panel'), { y: 24, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .to(el.querySelector('.modal-backdrop'), { autoAlpha: 0, duration: 0.25 }, '<0.1')
  })

  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => {
    if (!item) return
    lockScroll(true)
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, a[href]')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [item])

  if (!item) return <div ref={ref} hidden />

  const reserve = () => {
    prefillReservation({ dishId: item.id })
    onClose()
    setTimeout(() => scrollToTarget('reservation'), 60)
  }

  return createPortal(
    <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby="dish-title">
      <div className="modal-backdrop" onClick={close} />
      <div className="modal-panel" data-lenis-prevent>
        <button ref={closeBtn} className="modal-close" onClick={close} aria-label="Đóng">
          <IconClose size={22} />
        </button>
        <figure className="modal-media">
          <img src={item.image} width="800" height="600" alt={item.name} className="img-cover" />
        </figure>
        <div className="modal-body">
          <p className="section-subtitle left">{item.portion ? `Khẩu phần: ${item.portion}` : 'Đồ uống'}</p>
          <h3 id="dish-title" className="headline-2">
            {item.name}
          </h3>
          <p className="modal-price">{formatPriceFull(item.price)}</p>
          {item.tags.length > 0 && (
            <ul className="card-tags">
              {item.tags.map((t) => (
                <li key={t} className={`badge badge-${t}`}>
                  {tagLabels[t]}
                </li>
              ))}
            </ul>
          )}
          <p className="section-text">{item.description}</p>

          <div className="modal-block">
            <h4 className="modal-label">Nguyên liệu chính</h4>
            <ul className="chip-list">
              {item.ingredients.map((i) => (
                <li key={i} className="chip">
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-block">
            <h4 className="modal-label">Chất gây dị ứng</h4>
            <p className="body-4 muted">
              {item.allergens.length ? `${item.allergens.join(', ')}.` : 'Không có nhóm dị ứng phổ biến.'} Báo lễ tân nếu bạn cần bếp điều chỉnh.
            </p>
          </div>

          {item.pairing && (
            <div className="modal-pairing">
              <h4 className="modal-label">Gọi kèm</h4>
              <p className="title-3">{item.pairing.name}</p>
              <p className="body-4 muted">{item.pairing.note}</p>
            </div>
          )}

          <Button variant="secondary" onClick={reserve}>
            Đặt bàn & giữ món này
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
