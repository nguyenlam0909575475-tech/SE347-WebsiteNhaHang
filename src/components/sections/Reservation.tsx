import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { site } from '../../data/site'
import { categories, formatPrice, formatPriceFull, menu, type MenuCategory } from '../../data/menu'
import {
  areas,
  SERVICES,
  dayLoad,
  formatDateLong,
  getSlots,
  makeCode,
  removeReservation,
  saveReservation,
  toISODate,
  weekdayShort,
  type AreaId,
  type PreorderItem,
  type Reservation as Booking,
} from '../../lib/availability'
import { EVT_PREFILL_RESERVATION, type PrefillDetail } from '../../lib/events'
import { gsap, useGSAP, MQ, prefersReducedMotion } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/scroll'
import Button from '../ui/Button'
import { IconCalendar, IconCheck, IconClose, IconPhone } from '../ui/Icons'

const DAYS_SHOWN = 14
const MAX_DAYS = 60
const occasions = ['Không có', 'Sinh nhật', 'Kỷ niệm', 'Gặp đối tác', 'Họp mặt gia đình', 'Cầu hôn']
const QUICK_PREORDER_IDS = ['wagyu', 'ribs', 'seabass', 'mousse']

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'time' | 'guests', string>>

const normalizePhone = (v: string) => v.replace(/[\s.\-()]/g, '')
const validPhone = (v: string) => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(v) || /^(0|\+84)2\d{9}$/.test(v)

function icsFile(b: Booking) {
  const [y, m, d] = b.date.split('-')
  const [hh, mm] = b.time.split(':')
  const start = `${y}${m}${d}T${hh}${mm}00`
  const endH = String(Math.min(23, Number(hh) + 2)).padStart(2, '0')
  const end = `${y}${m}${d}T${endH}${mm}00`
  const dishDesc = b.preorders?.length
    ? ` | Món giữ trước: ${b.preorders.map((p) => `${p.name} x${p.qty}`).join(', ')}`
    : ''
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grilli//Dat ban//VI',
    'BEGIN:VEVENT',
    `UID:${b.code}@grilli.vn`,
    `DTSTART;TZID=Asia/Ho_Chi_Minh:${start}`,
    `DTEND;TZID=Asia/Ho_Chi_Minh:${end}`,
    `SUMMARY:Grilli - bàn ${b.guests} khách (${b.code})`,
    `LOCATION:${site.addressFull}`,
    `DESCRIPTION:Yêu cầu đang chờ lễ tân xác nhận.${dishDesc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }))
}

export default function Reservation() {
  const root = useRef<HTMLElement>(null)
  const dateStripRef = useRef<HTMLDivElement>(null)
  const today = useMemo(() => new Date(), [])
  const minDate = useMemo(() => toISODate(today), [today])

  const days = useMemo(
    () =>
      Array.from({ length: DAYS_SHOWN }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        return d
      }),
    [today],
  )

  const todayClosed = useMemo(() => dayLoad(minDate, 'indoor', 2).open === 0, [minDate])
  const defaultDate = useMemo(() => (todayClosed ? toISODate(days[1]) : minDate), [todayClosed, days, minDate])

  const [guests, setGuests] = useState(2)
  const [area, setArea] = useState<AreaId>('indoor')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occasion, setOccasion] = useState(occasions[0])
  const [note, setNote] = useState('')
  const [experience, setExperience] = useState<string | undefined>()

  // Optional dish pre-order state
  const [preorderMap, setPreorderMap] = useState<Record<string, number>>({})
  const [menuExpanded, setMenuExpanded] = useState(false)
  const [preorderCat, setPreorderCat] = useState<MenuCategory>('main')

  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [version, setVersion] = useState(0)

  const areaInfo = areas.find((a) => a.id === area)!
  const slots = useMemo(() => getSlots(date, area, guests), [date, area, guests, version])
  const slotMap = new Map(slots.map((s) => [s.time, s]))

  const preorders: PreorderItem[] = useMemo(
    () =>
      Object.entries(preorderMap)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const dish = menu.find((m) => m.id === id)
          return dish ? { id: dish.id, name: dish.name, price: dish.price, qty } : null
        })
        .filter((x): x is PreorderItem => x !== null),
    [preorderMap],
  )

  const preorderCount = useMemo(() => preorders.reduce((s, p) => s + p.qty, 0), [preorders])
  const preorderTotal = useMemo(() => preorders.reduce((s, p) => s + p.price * p.qty, 0), [preorders])

  const visiblePreorderDishes = useMemo(
    () =>
      menuExpanded
        ? menu.filter((m) => m.category === preorderCat)
        : QUICK_PREORDER_IDS.map((id) => menu.find((m) => m.id === id)!).filter(Boolean),
    [menuExpanded, preorderCat],
  )

  const adjustDish = (id: string, delta: number) => {
    setPreorderMap((prev) => {
      const nextQty = Math.max(0, Math.min(12, (prev[id] ?? 0) + delta))
      const copy = { ...prev }
      if (nextQty === 0) delete copy[id]
      else copy[id] = nextQty
      return copy
    })
  }

  // Keep selected time valid when date / area / party size changes
  useEffect(() => {
    if (time && !['open', 'few'].includes(slotMap.get(time)?.status ?? 'full')) setTime('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots])

  useEffect(() => {
    if (guests < areaInfo.minGuests) setGuests(areaInfo.minGuests)
    if (guests > areaInfo.maxGuests) setGuests(areaInfo.maxGuests)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area])

  // Prefill from Experience cards / Dish detail modal
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<PrefillDetail>).detail
      setBooking(null)
      if (d.area) setArea(d.area)
      if (d.guests) setGuests(d.guests)
      if (d.experience) setExperience(d.experience)
      if (d.dishId) {
        setPreorderMap((prev) => ({ ...prev, [d.dishId!]: Math.min(12, (prev[d.dishId!] ?? 0) + 1) }))
      }
      if (d.note) setNote((n) => (n.includes(d.note!) ? n : [n, d.note].filter(Boolean).join('\n')))
    }
    window.addEventListener(EVT_PREFILL_RESERVATION, onPrefill)
    return () => window.removeEventListener(EVT_PREFILL_RESERVATION, onPrefill)
  }, [])

  // Entrance
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(q('.reservation-form'), {
          y: 60,
          autoAlpha: 0,
          duration: 1.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        })
        gsap.fromTo(
          q('.reservation-bg'),
          { yPercent: -8 },
          { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  // Slots re-appear smoothly when day / area / party size changes
  useGSAP(
    () => {
      if (prefersReducedMotion() || booking) return
      gsap.fromTo(
        root.current!.querySelectorAll('.slot'),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.018, ease: 'power2.out', overwrite: true, clearProps: 'opacity,visibility,transform' },
      )
    },
    { scope: root, dependencies: [date, area, guests] },
  )

  // Pre-order dish cards micro-entrance when switching category / expanding
  useGSAP(
    () => {
      if (prefersReducedMotion() || booking) return
      const items = root.current?.querySelectorAll('.preorder-card')
      if (!items?.length) return
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out', overwrite: true, clearProps: 'transform' },
      )
    },
    { scope: root, dependencies: [menuExpanded, preorderCat] },
  )

  // Confirmation card
  useGSAP(
    () => {
      if (!booking || prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      gsap
        .timeline()
        .from(q('.confirm'), { y: 30, autoAlpha: 0, duration: 0.7 })
        .fromTo(q('.confirm-check path'), { strokeDasharray: 30, strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 0.2)
        .from(q('.confirm-row'), { y: 12, autoAlpha: 0, stagger: 0.05, duration: 0.45 }, 0.35)
    },
    { scope: root, dependencies: [booking] },
  )

  const scrollDates = (dir: -1 | 1) => {
    dateStripRef.current?.scrollBy({ left: dir * 270, behavior: 'smooth' })
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (name.trim().length < 2) e.name = 'Bạn cho lễ tân xin họ tên nhé.'
    if (!validPhone(normalizePhone(phone))) e.phone = 'Số điện thoại chưa đúng (VD: 0909 486 120).'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'Email chưa đúng định dạng.'
    if (!time) e.time = 'Chọn một khung giờ còn bàn.'
    if (guests < areaInfo.minGuests || guests > areaInfo.maxGuests)
      e.guests = `${areaInfo.label} nhận từ ${areaInfo.minGuests} đến ${areaInfo.maxGuests} khách.`
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      const first = root.current?.querySelector<HTMLElement>('[aria-invalid="true"], .slots-error')
      first?.focus?.()
      if (!prefersReducedMotion()) gsap.fromTo(root.current!.querySelector('.form-left'), { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      return
    }
    setSending(true)
    const b: Booking = {
      code: makeCode(),
      name: name.trim(),
      phone: normalizePhone(phone),
      email: email.trim(),
      guests,
      date,
      time,
      area,
      occasion,
      note: note.trim(),
      experience,
      preorders: preorders.length ? preorders : undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined
    if (key) {
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key,
            subject: `[Grilli] Yêu cầu đặt bàn ${b.code}`,
            from_name: 'Website Grilli',
            ...b,
            area: areaInfo.label,
            date: formatDateLong(b.date),
            preorders: preorders.map((p) => `${p.name} x${p.qty} (${formatPriceFull(p.price * p.qty)})`).join(', '),
          }),
        })
      } catch {
        /* still saved locally */
      }
    } else {
      await new Promise((r) => setTimeout(r, 650))
    }

    saveReservation(b)
    setSending(false)
    setBooking(b)
    setVersion((v) => v + 1)
    setTimeout(() => scrollToTarget('reservation'), 50)
  }

  const reset = (keepContact = true) => {
    setBooking(null)
    setTime('')
    setNote('')
    setExperience(undefined)
    setPreorderMap({})
    if (!keepContact) {
      setName('')
      setPhone('')
      setEmail('')
    }
  }

  const cancel = () => {
    if (!booking) return
    removeReservation(booking.code)
    setVersion((v) => v + 1)
    reset()
  }

  const errorId = (k: keyof Errors) => (errors[k] ? `err-${k}` : undefined)
  const maxD = new Date(today)
  maxD.setDate(maxD.getDate() + MAX_DAYS)
  const maxDate = toISODate(maxD)
  const dateInStrip = days.some((d) => toISODate(d) === date)

  return (
    <section ref={root} id="reservation" className="reservation section" aria-labelledby="reservation-title">
      <div className="reservation-bg has-bg-image" style={{ backgroundImage: "url('images/reservation-bg.webp')" }} aria-hidden="true" />
      <div className="container">
        <div className="reservation-form">
          <div className="form-left">
            {booking ? (
              <div className="confirm" role="status">
                <svg className="confirm-check" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" opacity="0.35" />
                  <path d="m7 12.5 3.2 3.2L17 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="section-subtitle left">Đã nhận yêu cầu</p>
                <h2 id="reservation-title" className="headline-2">
                  Cảm ơn {booking.name.split(' ').slice(-1)[0]}, chúng tôi sẽ gọi lại.
                </h2>
                <p className="section-text">
                  Lễ tân sẽ gọi số <strong className="gold">{booking.phone}</strong> trong khoảng 15 phút (8:00 – 22:00) để xác nhận bàn.
                  Yêu cầu gửi ngoài giờ sẽ được gọi lại lúc 8:00 sáng hôm sau.
                </p>

                <dl className="confirm-list">
                  <div className="confirm-row">
                    <dt>Mã đặt bàn</dt>
                    <dd className="code">{booking.code}</dd>
                  </div>
                  <div className="confirm-row">
                    <dt>Thời gian</dt>
                    <dd>
                      {booking.time}, {formatDateLong(booking.date)}
                    </dd>
                  </div>
                  <div className="confirm-row">
                    <dt>Số khách · khu vực</dt>
                    <dd>
                      {booking.guests} khách · {areas.find((a) => a.id === booking.area)?.label}
                    </dd>
                  </div>
                  {booking.experience && (
                    <div className="confirm-row">
                      <dt>Trải nghiệm</dt>
                      <dd>{booking.experience}</dd>
                    </div>
                  )}
                  {booking.preorders && booking.preorders.length > 0 && (
                    <div className="confirm-row confirm-row-dishes">
                      <dt>Món giữ trước</dt>
                      <dd>
                        <ul className="confirm-dishes">
                          {booking.preorders.map((p) => (
                            <li key={p.id}>
                              <span>
                                {p.name} <strong>×{p.qty}</strong>
                              </span>
                              <span className="gold">{formatPriceFull(p.price * p.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  <div className="confirm-row">
                    <dt>Trạng thái</dt>
                    <dd className="pending">Chờ lễ tân xác nhận</dd>
                  </div>
                </dl>

                <div className="confirm-actions">
                  <a href={icsFile(booking)} download={`grilli-${booking.code}.ics`} className="btn">
                    <span className="text text-1">Lưu vào lịch</span>
                    <span className="text text-2" aria-hidden="true">
                      Lưu vào lịch
                    </span>
                  </a>
                  <button type="button" className="btn-text hover-underline" onClick={() => reset()}>
                    Đặt thêm bàn khác
                  </button>
                  <button type="button" className="btn-text hover-underline muted-link" onClick={cancel}>
                    Huỷ yêu cầu này
                  </button>
                </div>
                {!import.meta.env.VITE_WEB3FORMS_KEY && (
                  <p className="demo-note">Bản demo: yêu cầu được lưu trong trình duyệt (localStorage), chưa gửi tới nhà hàng.</p>
                )}
              </div>
            ) : (
              <form onSubmit={submit} noValidate aria-labelledby="reservation-title">
                <div className="form-head text-center">
                  <p className="section-subtitle">Giữ chỗ trước</p>
                  <h2 id="reservation-title" className="headline-1">
                    Đặt bàn
                  </h2>
                  <p className="form-text">
                    Đặt trước ít nhất 2 giờ. Nhóm trên 12 khách vui lòng gọi{' '}
                    <a href={site.hotlineHref} className="link">
                      {site.hotline}
                    </a>
                    .
                  </p>
                </div>

                {experience && (
                  <div className="prefill-chip">
                    <span>
                      Trải nghiệm đã chọn: <strong>{experience}</strong>
                    </span>
                    <button type="button" aria-label="Bỏ trải nghiệm" onClick={() => setExperience(undefined)}>
                      <IconClose size={16} />
                    </button>
                  </div>
                )}

                <div className="field-row">
                  <div className="field">
                    <span className="field-label" id="guests-label">
                      <span className="step-tag">01</span> Số khách
                    </span>
                    <div className="stepper" role="group" aria-labelledby="guests-label" aria-describedby={errorId('guests')}>
                      <button type="button" onClick={() => setGuests((g) => Math.max(areaInfo.minGuests, g - 1))} aria-label="Bớt một khách">
                        −
                      </button>
                      <output aria-live="polite">{guests} khách</output>
                      <button type="button" onClick={() => setGuests((g) => Math.min(areaInfo.maxGuests, g + 1))} aria-label="Thêm một khách">
                        +
                      </button>
                    </div>
                    {errors.guests && (
                      <p className="field-error" id="err-guests">
                        {errors.guests}
                      </p>
                    )}
                  </div>

                  <fieldset className="field">
                    <legend className="field-label">Khu vực ngồi</legend>
                    <div className="area-options">
                      {areas.map((a) => (
                        <label key={a.id} className={`area-option ${area === a.id ? 'is-active' : ''}`}>
                          <input type="radio" name="area" value={a.id} checked={area === a.id} onChange={() => setArea(a.id)} className="sr-only" />
                          <span className="area-name">{a.label}</span>
                          <span className="area-note">{a.note}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <fieldset className="field">
                  <div className="field-head-row">
                    <legend className="field-label mb-0">
                      <span className="step-tag">02</span> Ngày dùng bữa
                    </legend>
                    <div className="date-nav-btns" aria-hidden="true">
                      {todayClosed && date === toISODate(days[1]) && (
                        <span className="date-auto-note">Ca tối nay đã khép · đang chọn ngày mai</span>
                      )}
                      <button type="button" className="date-arrow" onClick={() => scrollDates(-1)} tabIndex={-1} title="Lùi ngày">
                        ‹
                      </button>
                      <button type="button" className="date-arrow" onClick={() => scrollDates(1)} tabIndex={-1} title="Xem thêm ngày">
                        ›
                      </button>
                    </div>
                  </div>

                  <div ref={dateStripRef} className="date-strip" data-lenis-prevent>
                    {days.map((d) => {
                      const iso = toISODate(d)
                      const load = dayLoad(iso, area, guests)
                      const ratio = load.total ? load.open / load.total : 0
                      const isPastDay = load.total === 0
                      const isFullDay = !isPastDay && load.open === 0
                      const isWarn = !isPastDay && !isFullDay && (ratio < 0.4 || (iso === minDate && load.open <= 2))
                      const hint = isPastDay
                        ? 'Hết giờ'
                        : isFullDay
                          ? 'Kín bàn'
                          : iso === minDate && load.open <= 2
                            ? `Còn ${load.open} giờ`
                            : ratio < 0.4
                              ? 'Sắp kín'
                              : 'Còn bàn'
                      return (
                        <button
                          type="button"
                          key={iso}
                          className={`date-chip ${date === iso ? 'is-active' : ''} ${isFullDay ? 'is-full' : ''} ${isPastDay ? 'is-past' : ''}`}
                          onClick={() => setDate(iso)}
                          aria-pressed={date === iso}
                          aria-label={`${formatDateLong(iso)}, ${hint}`}
                        >
                          <span className="wd">{iso === minDate ? 'Hôm nay' : weekdayShort[d.getDay()]}</span>
                          <span className="dm">
                            {d.getDate()}/{d.getMonth() + 1}
                          </span>
                          <span className={`hint ${isWarn ? 'warn' : ''}`}>{hint}</span>
                        </button>
                      )
                    })}
                    <label className={`date-chip date-other ${!dateInStrip ? 'is-active' : ''}`}>
                      <IconCalendar size={18} />
                      <span className="wd">{dateInStrip ? 'Ngày khác' : formatDateLong(date).split(', ')[1]}</span>
                      <input
                        type="date"
                        min={minDate}
                        max={maxDate}
                        value={date}
                        onChange={(e) => e.target.value && setDate(e.target.value)}
                        aria-label="Chọn ngày khác"
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="field" aria-describedby={errorId('time')}>
                  <legend className="field-label">
                    Khung giờ · <span className="gold">{formatDateLong(date)}</span>
                  </legend>
                  {SERVICES.map((s) => (
                    <div className="slot-group" key={s.id}>
                      <p className="slot-group-label">{s.label}</p>
                      <div className="slots">
                        {s.times.map((tm) => {
                          const info = slotMap.get(tm)!
                          const disabled = info.status === 'full' || info.status === 'past'
                          const label =
                            info.status === 'past'
                              ? 'Đã qua'
                              : info.status === 'full'
                                ? 'Hết chỗ'
                                : info.status === 'few'
                                  ? area === 'private'
                                    ? 'Còn phòng'
                                    : `Còn ${info.remaining} bàn`
                                  : area === 'private'
                                    ? 'Còn phòng'
                                    : 'Còn bàn'
                          return (
                            <button
                              type="button"
                              key={tm}
                              className={`slot is-${info.status} ${time === tm ? 'is-selected' : ''}`}
                              disabled={disabled}
                              aria-pressed={time === tm}
                              aria-label={`${tm}, ${label}`}
                              onClick={() => {
                                setTime(tm)
                                setErrors((er) => ({ ...er, time: undefined }))
                              }}
                            >
                              <span className="slot-time">{tm}</span>
                              <span className="slot-state">{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <ul className="slot-legend" aria-hidden="true">
                    <li className="is-open">Còn bàn</li>
                    <li className="is-few">Sắp kín</li>
                    <li className="is-full">Hết chỗ</li>
                  </ul>
                  {errors.time && (
                    <p className="field-error slots-error" id="err-time" tabIndex={-1}>
                      {errors.time}
                    </p>
                  )}
                </fieldset>

                {/* Optional Pre-Order Dish Tray: keeps limited daily items & slow-grilled cuts ready */}
                <div className="preorder-box">
                  <div className="preorder-head">
                    <div>
                      <span className="field-label mb-0">
                        <span className="step-tag">03</span> Chọn món chuẩn bị trước{' '}
                        <span className="muted">(không bắt buộc)</span>
                      </span>
                      <p className="preorder-sub">
                        Giữ trước các món làm mẻ nhỏ dễ hết sớm hoặc nướng lâu trên than — thanh toán trực tiếp tại bàn.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="preorder-toggle"
                      onClick={() => setMenuExpanded((v) => !v)}
                      aria-expanded={menuExpanded}
                    >
                      {menuExpanded ? 'Thu gọn về 4 món gợi ý' : 'Xem toàn bộ thực đơn (20 món)'}
                    </button>
                  </div>

                  {menuExpanded && (
                    <div className="preorder-cats" role="tablist" aria-label="Nhóm món đặt trước">
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            role="tab"
                            aria-selected={preorderCat === c.id}
                            className={`preorder-cat ${preorderCat === c.id ? 'is-active' : ''}`}
                            onClick={() => setPreorderCat(c.id as MenuCategory)}
                          >
                            {c.label}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="preorder-grid">
                    {visiblePreorderDishes.map((dish) => {
                      const qty = preorderMap[dish.id] ?? 0
                      return (
                        <div key={dish.id} className={`preorder-card ${qty > 0 ? 'is-picked' : ''}`}>
                          <img src={dish.image} width="64" height="64" loading="lazy" alt={dish.name} className="preorder-thumb" />
                          <div className="preorder-info">
                            <p className="preorder-name">{dish.name}</p>
                            <span className="preorder-price">{formatPrice(dish.price)}</span>
                          </div>
                          {qty === 0 ? (
                            <button
                              type="button"
                              className="preorder-add"
                              onClick={() => adjustDish(dish.id, 1)}
                              aria-label={`Giữ trước món ${dish.name}`}
                            >
                              + Giữ
                            </button>
                          ) : (
                            <div className="preorder-qty" role="group" aria-label={`Số phần ${dish.name}`}>
                              <button type="button" onClick={() => adjustDish(dish.id, -1)} aria-label="Bớt một phần">
                                −
                              </button>
                              <span>{qty}</span>
                              <button type="button" onClick={() => adjustDish(dish.id, 1)} aria-label="Thêm một phần">
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {preorders.length > 0 && (
                    <div className="preorder-summary">
                      <div className="preorder-chips">
                        {preorders.map((p) => (
                          <span key={p.id} className="preorder-chip">
                            {p.name} <strong>×{p.qty}</strong>
                            <button type="button" onClick={() => adjustDish(p.id, -p.qty)} aria-label={`Bỏ ${p.name}`}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="preorder-total">
                        <span>Đã giữ {preorderCount} phần · Tạm tính:</span>
                        <strong>{formatPriceFull(preorderTotal)}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="field-section-title">
                  <span className="step-tag">04</span> Thông tin liên hệ xác nhận
                </div>

                <div className="input-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="r-name">
                      Họ tên
                    </label>
                    <input
                      id="r-name"
                      className="input-field"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errorId('name')}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.name && (
                      <p className="field-error" id="err-name">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="r-phone">
                      Số điện thoại
                    </label>
                    <input
                      id="r-phone"
                      className="input-field"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errorId('phone')}
                      placeholder="0909 486 120"
                    />
                    {errors.phone && (
                      <p className="field-error" id="err-phone">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="r-email">
                      Email <span className="muted">(không bắt buộc)</span>
                    </label>
                    <input
                      id="r-email"
                      className="input-field"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errorId('email')}
                      placeholder="ban@email.com"
                    />
                    {errors.email && (
                      <p className="field-error" id="err-email">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="r-occasion">
                      Dịp đặc biệt
                    </label>
                    <select id="r-occasion" className="input-field" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                      {occasions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field field-wide">
                    <label className="field-label" htmlFor="r-note">
                      Ghi chú cho bếp & lễ tân
                    </label>
                    <textarea
                      id="r-note"
                      className="input-field"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Độ chín bò yêu thích, dị ứng thực phẩm, ghế trẻ em, nến sinh nhật…"
                    />
                  </div>
                </div>

                <div className="form-submit">
                  <Button variant="secondary" type="submit" block disabled={sending}>
                    {sending
                      ? 'Đang gửi yêu cầu…'
                      : preorderCount > 0
                        ? `Gửi đặt bàn & giữ trước ${preorderCount} phần`
                        : 'Gửi yêu cầu đặt bàn'}
                  </Button>
                  <p className="form-fineprint">
                    Chưa cần đặt cọc. Bàn được giữ 15 phút sau giờ hẹn. Lễ tân gọi xác nhận trong khoảng 15 phút.
                  </p>
                </div>
              </form>
            )}
          </div>

          <aside className="form-right has-bg-image" style={{ backgroundImage: "url('images/grilli/form-pattern.png')" }}>
            <div className="form-right-sticky">
              <div className="live-ticket">
                <p className="contact-label text-center">Phiếu đặt bàn của bạn</p>
                <ul className="ticket-rows">
                  <li>
                    <span>Bàn & khu vực</span>
                    <strong>
                      {guests} khách · {areaInfo.label}
                    </strong>
                  </li>
                  <li>
                    <span>Ngày dùng bữa</span>
                    <strong>{formatDateLong(date)}</strong>
                  </li>
                  <li>
                    <span>Khung giờ</span>
                    <strong className={time ? 'gold' : 'muted'}>{time || 'Chưa chọn giờ'}</strong>
                  </li>
                  {preorderCount > 0 && (
                    <li>
                      <span>Món giữ trước</span>
                      <strong className="gold">
                        {preorderCount} phần ({formatPrice(preorderTotal)})
                      </strong>
                    </li>
                  )}
                </ul>
              </div>

              <div className="separator" />

              <div className="text-center">
                <p className="contact-label">Cần xếp bàn gấp</p>
                <a href={site.phoneHref} className="body-1 contact-number hover-underline">
                  <IconPhone size={18} /> {site.phone}
                </a>
                <div className="separator" />
                <p className="contact-label">Địa chỉ</p>
                <address className="body-4">{site.addressFull}</address>
                <div className="separator" />
                {site.hours.map((h) => (
                  <div key={h.label} className="hours-row">
                    <p className="contact-label">{h.label}</p>
                    <p className="body-4">{h.value}</p>
                  </div>
                ))}
                <div className="separator" />
                <p className="body-4 muted">
                  <IconCheck size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Bãi đậu ô tô & xe máy miễn phí
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
