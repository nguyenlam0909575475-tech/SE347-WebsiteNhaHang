import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../../lib/gsap'

const SECTION_TECH: Record<string, { name: string; plugins: string }> = {
  home: { name: '01 · Hero Carousel', plugins: 'Timeline · Line Mask · quickTo Magnetic · Scrub Exit' },
  story: { name: '02 · Ba trụ cột & Câu chuyện', plugins: 'Clip-Path Curtain · Differential Scrub · Snap Counter' },
  signature: { name: '03 · Món đặc trưng (Pin)', plugins: 'ScrollTrigger Pin + Scrub · Concentric SVG Arc · Circle Clip' },
  menu: { name: '04 · Thực đơn tương tác', plugins: 'ScrollTrigger.batch · Flip Layout · Price Line Draw · Spotlight' },
  chef: { name: '05 · Bếp trưởng & Triết lý', plugins: 'SplitText Word/Line Mask · 3D Fire Tilt · Progressive Rail' },
  gallery: { name: '06 · Thư viện ngang (Pin)', plugins: 'Horizontal Pin · containerAnimation · Velocity Skew' },
  experience: { name: '07 · Rót vang 3D & Gói tiệc', plugins: 'Proxy State Tween · Gravity Clip PBR · quickTo 3D Cards' },
  reservation: { name: '09 · Đặt bàn & Giữ món trước', plugins: 'Stagger Slots · Pre-order Tray · SVG Check Draw' },
  contact: { name: '10 · Liên hệ & Chân trang', plugins: 'SplitText · Curtain Map Reveal · Scrubbed Parallax' },
}

export const EVT_TOGGLE_SEMINAR = 'grilli:toggle-seminar'

/**
 * Discreet live telemetry HUD for the SE347 GSAP Seminar presentation.
 * Hidden by default so regular visitors only see the restaurant website;
 * toggled from the footer "Seminar GSAP" button or keyboard shortcut `Alt + G`.
 */
export default function GsapInspector() {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [triggers, setTriggers] = useState(0)
  const [section, setSection] = useState('home')

  useEffect(() => {
    const onToggle = () => setOpen((v) => !v)
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener(EVT_TOGGLE_SEMINAR, onToggle)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener(EVT_TOGGLE_SEMINAR, onToggle)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setTriggers(ScrollTrigger.getAll().length)
    const ids = Object.keys(SECTION_TECH)

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setProgress(Math.round(self.progress * 100))
        setVelocity(Math.round(self.getVelocity()))
        setTriggers(ScrollTrigger.getAll().length)
        const probe = window.innerHeight * 0.45
        let found = 'home'
        for (const id of ids) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= probe) found = id
        }
        setSection(found)
      },
    })

    return () => st.kill()
  }, [open])

  if (!open) return null
  const info = SECTION_TECH[section] ?? SECTION_TECH.home

  return (
    <aside className="gsap-hud" aria-label="Bảng thông số GSAP Seminar">
      <div className="gsap-hud-head">
        <span className="gsap-hud-dot" />
        <strong>SE347 · GSAP Live Inspector</strong>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng bảng GSAP">
          ×
        </button>
      </div>
      <div className="gsap-hud-row">
        <span>Tiến độ cuộn</span>
        <strong>{progress}%</strong>
      </div>
      <div className="gsap-hud-row">
        <span>Vận tốc (getVelocity)</span>
        <strong>{velocity} px/s</strong>
      </div>
      <div className="gsap-hud-row">
        <span>ScrollTrigger đang chạy</span>
        <strong>{triggers} instances</strong>
      </div>
      <div className="gsap-hud-tech">
        <span className="gsap-hud-sec">{info.name}</span>
        <p>{info.plugins}</p>
      </div>
    </aside>
  )
}
