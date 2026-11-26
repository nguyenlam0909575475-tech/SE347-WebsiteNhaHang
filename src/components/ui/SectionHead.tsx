import { useRef, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, MQ } from '../../lib/gsap'

type Props = {
  subtitle: string
  title: ReactNode
  text?: ReactNode
  align?: 'center' | 'left'
  as?: 'h2' | 'h3'
  className?: string
}

/**
 * Section heading in the Grilli pattern (gold label + separator + serif title).
 * On scroll the label fades in and the title rises word by word behind a mask.
 */
export default function SectionHead({ subtitle, title, text, align = 'center', as = 'h2', className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const Tag = as

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const titleEl = ref.current!.querySelector('.section-title')
        if (!titleEl) return
        const split = SplitText.create(titleEl, { type: 'words,lines', mask: 'lines', linesClass: 'split-line' })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
        })
        tl.from(ref.current!.querySelector('.section-subtitle'), { autoAlpha: 0, y: 14, duration: 0.7 })
          .from(ref.current!.querySelector('.subtitle-ornament'), { scaleX: 0, autoAlpha: 0, duration: 0.75, ease: 'power3.out' }, '-=0.5')
          .from(split.words, { yPercent: 110, duration: 1, stagger: 0.04, ease: 'power4.out' }, '-=0.55')
        const textEl = ref.current!.querySelector('.section-head-text')
        if (textEl) tl.from(textEl, { autoAlpha: 0, y: 18, duration: 0.8 }, '-=0.7')
        return () => split.revert()
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={`section-head ${align === 'left' ? 'is-left' : 'text-center'} ${className}`}>
      <p className={`section-subtitle has-ornament ${align === 'left' ? 'left' : ''}`}>
        <span>{subtitle}</span>
        <span className="subtitle-ornament" aria-hidden="true" />
      </p>
      <Tag className="headline-1 section-title">{title}</Tag>
      {text && <p className="section-text section-head-text">{text}</p>}
    </div>
  )
}
