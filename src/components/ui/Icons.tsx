import type { SVGProps } from 'react'

// Thin outline icons, drawn to match the ionicons-outline look Grilli used.
type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IconLocation = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
)

export const IconClock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const IconPhone = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
)

export const IconMail = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
    <path d="m4 6.5 8 6 8-6" />
  </svg>
)

export const IconChevron = ({ size, dir = 'right', ...p }: P & { dir?: 'left' | 'right' | 'up' | 'down' }) => {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir]
  return (
    <svg {...base(size)} {...p}>
      <g transform={`rotate(${r} 12 12)`}>
        <path d="m9.5 6 6 6-6 6" />
      </g>
    </svg>
  )
}

export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const IconStar = ({ size = 16, filled = true, ...p }: P & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="m12 3.2 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.5l6.1-.7L12 3.2Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconUsers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.4c1.6.6 2.7 2.1 3 4.6" />
  </svg>
)

export const IconCalendar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="1" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
)

export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconArrowUp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconDrag = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 12H3m0 0 2.5-2.5M3 12l2.5 2.5M16 12h5m0 0-2.5-2.5M21 12l-2.5 2.5" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

/** Grilli's little "dinner table" pictogram used on the Book-a-table badge */
export const IconTable = ({ size = 40, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...p}>
    <path d="M8 22h32M12 22v16M36 22v16M24 22v-6" />
    <path d="M18 16h12l-2-6h-8l-2 6Z" />
    <path d="M6 30h8v8M42 30h-8v8" />
  </svg>
)
