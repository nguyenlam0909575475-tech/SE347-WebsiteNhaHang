import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { GalleryItem } from '../../data/content'
import { gsap, useGSAP } from '../../lib/gsap'
import { lockScroll } from '../../lib/scroll'
import { IconChevron, IconClose } from './Icons'

type Props = { items: GalleryItem[]; index: number | null; onChange: (i: number | null) => void }

export default function Lightbox({ items, index, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const open = index !== null
  const prevIndex = useRef<number | null>(null)
  const dir = useRef(1)

  // open / close + image swap animation
  useGSAP(
    () => {
      if (index === null || !ref.current) return
      const el = ref.current
      if (prevIndex.current === null) {
        gsap.fromTo(el.querySelector('.lightbox-backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
        gsap.fromTo(el.querySelector('.lightbox-figure'), { scale: 0.94, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'power3.out' })
      } else {
        gsap.fromTo(
          el.querySelector('.lightbox-figure img'),
          { xPercent: 6 * dir.current, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
        )
        gsap.fromTo(el.querySelector('.lightbox-caption'), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, delay: 0.1 })
      }
      prevIndex.current = index
    },
    { dependencies: [index], scope: ref },
  )

  const go = (d: 1 | -1) => {
    if (index === null) return
    dir.current = d
    onChange((index + d + items.length) % items.length)
  }

  const close = () => {
    const el = ref.current
    if (!el) return onChange(null)
    gsap.to(el.querySelector('.lightbox-figure'), { scale: 0.96, autoAlpha: 0, duration: 0.25 })
    gsap.to(el.querySelector('.lightbox-backdrop'), {
      autoAlpha: 0,
      duration: 0.3,
      onComplete: () => {
        prevIndex.current = null
        onChange(null)
      },
    })
  }

  const handlers = useRef({ go, close })
  handlers.current = { go, close }

  useEffect(() => {
    if (!open) return
    lockScroll(true)
    ref.current?.querySelector<HTMLElement>('.lightbox-close')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlers.current.close()
      if (e.key === 'ArrowRight') handlers.current.go(1)
      if (e.key === 'ArrowLeft') handlers.current.go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [open])

  if (index === null) return null
  const item = items[index]
  if (!item) return null

  return createPortal(
    <div ref={ref} className="lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh lớn">
      <div className="lightbox-backdrop" onClick={close} />
      <button className="lightbox-close" onClick={close} aria-label="Đóng">
        <IconClose size={24} />
      </button>
      <button className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Ảnh trước">
        <IconChevron dir="left" size={26} />
      </button>
      <figure className="lightbox-figure">
        <img src={item.src} alt={item.caption} />
        <figcaption className="lightbox-caption">
          <span className="gold">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          {item.caption}
        </figcaption>
      </figure>
      <button className="lightbox-nav next" onClick={() => go(1)} aria-label="Ảnh tiếp theo">
        <IconChevron dir="right" size={26} />
      </button>
    </div>,
    document.body,
  )
}
