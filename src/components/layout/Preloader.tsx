import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'

type Props = { onDone: () => void }

const MIN_MS = 950
const MAX_MS = 2200

function waitForImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
  })
}

/**
 * Grilli's gold preloader (spinning ring + outlined wordmark) with a real
 * percentage, the way Dialed Coffee masks its start-up. It waits for fonts and
 * the first hero photos, never longer than MAX_MS, and runs once per visit
 * (Savoria re-ran its loader on every page — we don't).
 */
export default function Preloader({ onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const [percent, setPercent] = useState(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (started.current) return // StrictMode runs effects twice in dev
    started.current = true
    document.body.classList.add('preloading')

    const counter = { value: 0 }
    const start = performance.now()
    const tasks = [
      Promise.allSettled([
        document.fonts.load('500 48px "Cormorant Garamond"'),
        document.fonts.load('400 16px "Be Vietnam Pro"'),
      ]).then(() => undefined),
      waitForImage('images/hero-1.webp'),
      waitForImage('images/hero-2.webp'),
    ]
    let finished = 0
    tasks.forEach((t) =>
      t.then(() => {
        finished++
        gsap.to(counter, {
          value: (finished / tasks.length) * 100,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => setPercent(Math.round(counter.value)),
        })
      }),
    )

    const exit = () => {
      gsap.killTweensOf(counter)
      setPercent(100)
      gsap
        .timeline({
          onComplete: () => {
            document.body.classList.remove('preloading')
            setHidden(true)
          },
        })
        .to('.preload-inner', { autoAlpha: 0, y: -20, duration: 0.45, ease: 'power2.in', delay: 0.15 })
        .add(() => doneRef.current())
        .to(ref.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.05')
    }

    const timeout = new Promise((r) => setTimeout(r, MAX_MS))
    Promise.race([Promise.all(tasks), timeout]).then(() => {
      const elapsed = performance.now() - start
      setTimeout(exit, Math.max(0, MIN_MS - elapsed))
    })
  }, [])

  if (hidden) return null

  return (
    <div ref={ref} className="preload" role="status" aria-live="polite" aria-label="Đang tải trang">
      <div className="preload-inner">
        <div className="circle" />
        <p className="text">Grilli</p>
        <p className="preload-percent">
          <span>{String(percent).padStart(2, '0')}</span>%
        </p>
      </div>
    </div>
  )
}
