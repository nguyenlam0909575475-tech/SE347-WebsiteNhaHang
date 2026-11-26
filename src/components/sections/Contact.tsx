import { useMemo, useRef, type PointerEvent } from 'react'
import { site } from '../../data/site'
import { gsap, SplitText, useGSAP, MQ } from '../../lib/gsap'
import SectionHead from '../ui/SectionHead'
import { IconClock, IconLocation, IconMail, IconPhone } from '../ui/Icons'

function getServiceStatus() {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (mins >= 8 * 60 && mins <= 10 * 60 + 30) return { open: true, text: 'Đang phục vụ bữa sáng & cà phê' }
  if (mins >= 11 * 60 && mins <= 14 * 60) return { open: true, text: 'Đang mở cửa · Phục vụ bữa trưa' }
  if (mins >= 17 * 60 + 30 && mins <= 22 * 60) return { open: true, text: 'Đang mở cửa · Phục vụ bữa tối' }
  if (mins < 8 * 60) return { open: false, text: 'Mở cửa lúc 8:00 sáng nay' }
  if (mins < 11 * 60) return { open: false, text: 'Ca trưa mở lúc 11:00' }
  if (mins < 17 * 60 + 30) return { open: false, text: 'Ca tối mở lúc 17:30' }
  return { open: false, text: 'Đã khép ca tối · Hẹn bạn 8:00 sáng mai' }
}

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  const service = useMemo(() => getServiceStatus(), [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const headSplit = SplitText.create(q('#contact-title')[0], { type: 'lines', mask: 'lines' })

        gsap
          .timeline({ scrollTrigger: { trigger: q('.section-head')[0], start: 'top 82%', once: true } })
          .from(q('.section-head .section-subtitle'), { y: 14, autoAlpha: 0, duration: 0.55, ease: 'power3.out' })
          .from(headSplit.lines, { yPercent: 112, autoAlpha: 0, duration: 0.85, ease: 'expo.out' }, 0.08)
          .from(q('.section-head .section-text'), { y: 16, autoAlpha: 0, duration: 0.65, ease: 'power3.out' }, 0.22)

        gsap.from(q('.contact-card'), {
          y: 28,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: q('.contact-grid')[0], start: 'top 80%', once: true },
        })

        gsap
          .timeline({ scrollTrigger: { trigger: q('.contact-map-wrap')[0], start: 'top 80%', once: true } })
          .fromTo(
            q('.contact-map-inner'),
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' },
          )
          .fromTo(
            q('.contact-map-curtain'),
            { scaleX: 1 },
            { scaleX: 0, transformOrigin: 'right center', duration: 0.9, ease: 'expo.inOut' },
            0.3,
          )
          .from(q('.contact-map-badge'), { y: 20, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.68)

        gsap.fromTo(
          q('.contact-bg'),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.to(q('.shape-contact'), {
          y: -70,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        return () => headSplit.revert()
      })
    },
    { scope: root },
  )

  const onCardsMove = (e: PointerEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.contact-card')
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--cx', `${e.clientX - r.left}px`)
    card.style.setProperty('--cy', `${e.clientY - r.top}px`)
  }

  return (
    <section ref={root} id="contact" className="section contact" aria-labelledby="contact-title">
      <div
        className="contact-bg has-bg-image"
        style={{ backgroundImage: "url('images/gal-room-warm.webp')" }}
        aria-hidden="true"
      />
      <div className="contact-pattern" aria-hidden="true" />

      <div className="container">
        <SectionHead
          subtitle="Liên hệ & Chỉ đường"
          title={<span id="contact-title">Hẹn gặp bạn tại Linh Trung</span>}
          text="Cách Làng Đại học Thủ Đức 5 phút di chuyển, đối diện công viên Linh Trung — có bãi đậu ô tô và giữ xe máy miễn phí ngay trước sảnh."
        />

        <div className="contact-grid">
          <div className="contact-cards" onPointerMove={onCardsMove}>
            <div className="contact-card">
              <span className="contact-icon" aria-hidden="true">
                <IconLocation size={20} />
              </span>
              <div>
                <h3 className="title-3">Địa chỉ</h3>
                <address className="body-4 muted">{site.addressFull}</address>
                <a href={site.mapLink} target="_blank" rel="noreferrer" className="contact-action">
                  <span>Mở chỉ đường Google Maps</span>
                  <span className="contact-action-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </div>

            <div className="contact-card">
              <span className="contact-icon" aria-hidden="true">
                <IconClock size={20} />
              </span>
              <div>
                <div className="contact-card-head">
                  <h3 className="title-3">Giờ mở cửa</h3>
                  <span className={`service-pill ${service.open ? 'is-open' : 'is-rest'}`}>
                    <span className="service-dot" aria-hidden="true" />
                    {service.text}
                  </span>
                </div>
                <ul className="hours-list">
                  {site.hours.map((h) => (
                    <li key={h.label}>
                      <span>{h.label}</span>
                      <span className="gold">{h.value}</span>
                    </li>
                  ))}
                </ul>
                <p className="body-4 muted hours-note">Mở cửa cả ngày lễ, chỉ nghỉ mùng 1 Tết.</p>
              </div>
            </div>

            <div className="contact-card">
              <span className="contact-icon" aria-hidden="true">
                <IconPhone size={20} />
              </span>
              <div>
                <h3 className="title-3">Điện thoại đặt bàn</h3>
                <a href={site.phoneHref} className="body-3 contact-link">
                  <strong>{site.phone}</strong> <span className="muted">· lễ tân (8:00 – 22:00)</span>
                </a>
                <a href={site.hotlineHref} className="body-3 contact-link">
                  <strong>{site.hotline}</strong> <span className="muted">· đặt phòng riêng & tiệc nhóm</span>
                </a>
              </div>
            </div>

            <div className="contact-card">
              <span className="contact-icon" aria-hidden="true">
                <IconMail size={20} />
              </span>
              <div>
                <h3 className="title-3">Hộp thư</h3>
                <a href={site.emailHref} className="body-3 contact-link">
                  {site.email}
                </a>
                <p className="body-4 muted">Phản hồi thực đơn tiệc & xuất hóa VAT trong ngày làm việc.</p>
              </div>
            </div>
          </div>

          <div className="contact-map-wrap">
            <span className="map-corner tl" aria-hidden="true" />
            <span className="map-corner tr" aria-hidden="true" />
            <span className="map-corner bl" aria-hidden="true" />
            <span className="map-corner br" aria-hidden="true" />

            <div className="contact-map-inner">
              <span className="contact-map-curtain" aria-hidden="true" />
              <iframe
                title="Bản đồ đường tới nhà hàng Grilli Linh Trung"
                src={site.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <span className="contact-map-vignette" aria-hidden="true" />
            </div>

            <div className="contact-map-badge">
              <div>
                <p className="map-badge-title">Grilli · Bếp Than Hoa & Vang</p>
                <p className="map-badge-sub">102 Đường số 9, P. Linh Trung · Đậu ô tô & xe máy miễn phí</p>
              </div>
              <a href={site.mapLink} target="_blank" rel="noreferrer" className="map-badge-btn">
                Dẫn đường ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <img
        src="images/grilli/shape-2.png"
        width="343"
        height="345"
        loading="lazy"
        alt=""
        className="shape shape-contact"
        aria-hidden="true"
      />
    </section>
  )
}
