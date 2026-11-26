import { useRef, useState, type FormEvent } from 'react'
import { navLinks, site } from '../../data/site'
import { gsap, useGSAP, MQ } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import Button from '../ui/Button'
import { IconMail } from '../ui/Icons'
import { EVT_TOGGLE_SEMINAR } from './GsapInspector'

export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.footer-brand', {
          y: 50,
          autoAlpha: 0,
          duration: 1,
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
        })
        gsap.from('.footer-list li', {
          y: 16,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.6,
          scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
        })
      })
    },
    { scope: ref },
  )

  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setMsg({ ok: false, text: 'Email chưa đúng định dạng, bạn kiểm tra lại giúp nhé.' })
      return
    }
    const list = JSON.parse(localStorage.getItem('grilli:newsletter') || '[]') as string[]
    if (!list.includes(email.trim())) list.push(email.trim())
    localStorage.setItem('grilli:newsletter', JSON.stringify(list))
    setMsg({ ok: true, text: 'Đã ghi nhận. Thực đơn tháng sau sẽ được gửi vào email của bạn.' })
    setEmail('')
  }

  return (
    <footer ref={ref} className="footer section has-bg-image text-center" style={{ backgroundImage: "url('images/footer-bg.webp')" }}>
      <div className="container">
        <div className="footer-top grid-list">
          <div className="footer-brand has-before has-after">
            <img src="images/grilli/logo.svg" width="160" height="50" loading="lazy" alt="Grilli" className="logo" />
            <address className="body-4">{site.addressFull}</address>
            <a href={site.emailHref} className="body-4 contact-link">
              {site.email}
            </a>
            <a href={site.phoneHref} className="body-4 contact-link">
              Đặt bàn: {site.phone}
            </a>
            <p className="body-4">{site.hoursShort}</p>

            <div className="wrapper">
              <div className="separator" />
              <div className="separator" />
              <div className="separator" />
            </div>

            <p className="title-1">Nhận thực đơn mới</p>
            <p className="label-1">Mỗi tháng một email, có món mới và lịch tối vang. Không spam.</p>

            <form className="input-wrapper" onSubmit={subscribe} noValidate>
              <div className="icon-wrapper">
                <IconMail />
                <label htmlFor="newsletter" className="sr-only">
                  Email của bạn
                </label>
                <input
                  id="newsletter"
                  type="email"
                  name="email_address"
                  placeholder="Email của bạn"
                  autoComplete="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button variant="secondary" type="submit" block>
                Đăng ký
              </Button>
            </form>
            <p className={`form-msg ${msg ? (msg.ok ? 'ok' : 'err') : ''}`} role="status">
              {msg?.text}
            </p>
          </div>

          <ul className="footer-list">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="label-2 footer-link hover-underline"
                  onClick={(e) => (e.preventDefault(), scrollToTarget(l.id))}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="footer-list">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="label-2 footer-link hover-underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © 2026 Grilli · Đồ án môn SE347 – Công nghệ Web và Ứng dụng. Giao diện phát triển từ template{' '}
            <a href="https://github.com/codewithsadee/grilli" target="_blank" rel="noreferrer" className="link">
              Grilli
            </a>{' '}
            (codewithsadee). Ảnh: Unsplash & Pexels · 3D CC0: Poly Haven.{' '}
            <button
              type="button"
              className="seminar-toggle-btn"
              onClick={() => window.dispatchEvent(new Event(EVT_TOGGLE_SEMINAR))}
              title="Bật/tắt bảng thông số GSAP trực tiếp (Alt + G)"
            >
              Seminar GSAP
            </button>
          </p>
        </div>
      </div>
    </footer>
  )
}
