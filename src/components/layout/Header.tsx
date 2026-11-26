import { useEffect, useRef, useState } from 'react'
import { navLinks, site } from '../../data/site'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { lockScroll, scrollToTarget } from '../../lib/scroll'
import Button from '../ui/Button'
import { IconClose } from '../ui/Icons'

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string>('home')
  const [open, setOpen] = useState(false)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // One global trigger handles: solid background, hide-on-down / show-on-up,
  // and which nav link is active (measured live, so pin spacers never confuse it).
  useGSAP(() => {
    const header = headerRef.current!
    const ids = navLinks.map((l) => l.id)
    let current = 'home'
    // Read window.scrollY directly: during ScrollTrigger.refresh() the trigger's
    // own scroll value is briefly reset to 0 while it measures.
    const apply = (direction = 0) => {
      const y = window.scrollY
      header.classList.toggle('active', y > 50)
      if (y > 500 && direction === 1) header.classList.add('hide')
      else if (direction === -1 || y <= 500) header.classList.remove('hide')

      const probe = window.innerHeight * 0.4
      let found = 'home'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= probe) found = id
      }
      if (found !== current) {
        current = found
        setActive(found)
      }
    }
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => apply(self.direction),
    })
    const onRefresh = () => requestAnimationFrame(() => apply(0))
    ScrollTrigger.addEventListener('refresh', onRefresh)
    return () => ScrollTrigger.removeEventListener('refresh', onRefresh)
  })

  // Drawer timeline (Grilli slide-in drawer, links stagger in).
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(drawerRef.current, { visibility: 'visible' })
        .to('.overlay', { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .fromTo('.navbar', { xPercent: -100 }, { xPercent: 0, duration: 0.6, ease: 'power3.out' }, 0)
        .from('.navbar-item', { x: -24, autoAlpha: 0, stagger: 0.05, duration: 0.45 }, 0.25)
        .from('.navbar-contact > *', { autoAlpha: 0, y: 10, stagger: 0.05, duration: 0.4 }, 0.4)
    },
    { scope: drawerRef },
  )

  useEffect(() => {
    if (!tl.current) return
    if (open) {
      tl.current.timeScale(1).play()
      lockScroll(true)
    } else {
      tl.current.timeScale(1.6).reverse()
      lockScroll(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    // wait for drawer to release scroll lock before scrolling
    setTimeout(() => scrollToTarget(id), open ? 250 : 0)
  }

  return (
    <>
      <header ref={headerRef} className="header">
        <div className="container">
          <a href="#home" className="logo" onClick={(e) => (e.preventDefault(), go('home'))} aria-label="Grilli — về đầu trang">
            <img src="images/grilli/logo.svg" width="160" height="50" alt="Grilli" />
          </a>

          <nav className="navbar-desktop" aria-label="Điều hướng chính">
            <ul className="navbar-desktop-list">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    className={`navbar-desktop-link hover-underline ${active === l.id ? 'active' : ''}`}
                    aria-current={active === l.id ? 'true' : undefined}
                    onClick={(e) => (e.preventDefault(), go(l.id))}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Button variant="secondary" className="header-cta" href="#reservation" onClick={() => go('reservation')}>
            Đặt bàn
          </Button>

          <button className="nav-open-btn" aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <span className="line line-1" />
            <span className="line line-2" />
            <span className="line line-3" />
          </button>
        </div>
      </header>

      <div ref={drawerRef} className="drawer" aria-hidden={!open}>
        <div className="overlay" onClick={() => setOpen(false)} />
        <nav className="navbar" aria-label="Menu di động">
          <button className="close-btn" aria-label="Đóng menu" onClick={() => setOpen(false)}>
            <IconClose size={22} />
          </button>
          <a href="#home" className="logo" onClick={(e) => (e.preventDefault(), go('home'))}>
            <img src="images/grilli/logo.svg" width="160" height="50" alt="Grilli" />
          </a>
          <ul className="navbar-list">
            {[...navLinks, { id: 'reservation', label: 'Đặt bàn' }].map((l) => (
              <li className="navbar-item" key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={`navbar-link ${active === l.id ? 'active' : ''}`}
                  onClick={(e) => (e.preventDefault(), go(l.id))}
                >
                  <span className="separator" />
                  <span className="span">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="navbar-contact text-center">
            <p className="headline-2 navbar-title">Ghé chúng tôi</p>
            <address className="body-4 navbar-text">{site.address}</address>
            <p className="body-4 navbar-text">{site.hoursShort}</p>
            <a href={site.emailHref} className="body-4 sidebar-link">
              {site.email}
            </a>
            <div className="separator" />
            <p className="contact-label">Đặt bàn qua điện thoại</p>
            <a href={site.phoneHref} className="body-1 contact-number hover-underline">
              {site.phone}
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
