import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  block?: boolean
  href?: string
  onClick?: () => void
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'>

/** Grilli's signature button: gold circle fills from below, label swaps. */
export default function Button({ children, variant = 'primary', block, href, onClick, className = '', ...rest }: Props) {
  const cls = `btn ${variant === 'secondary' ? 'btn-secondary' : ''} ${block ? 'btn-block' : ''} ${className}`.trim()
  const inner = (
    <>
      <span className="text text-1">{children}</span>
      <span className="text text-2" aria-hidden="true">
        {children}
      </span>
    </>
  )
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {inner}
    </button>
  )
}
