// Table availability for a static site.
// There is no backend, so demand is simulated deterministically per date + slot
// (same date always shows the same picture, weekends are busier, 19:00–20:00 peaks)
// and then real requests saved in localStorage are subtracted on top.

export type AreaId = 'indoor' | 'balcony' | 'private'
export type SlotStatus = 'open' | 'few' | 'full' | 'past'

export interface Area {
  id: AreaId
  label: string
  note: string
  tables: number
  minGuests: number
  maxGuests: number
}

export const areas: Area[] = [
  { id: 'indoor', label: 'Trong nhà', note: 'Máy lạnh, gần bếp mở', tables: 12, minGuests: 1, maxGuests: 12 },
  { id: 'balcony', label: 'Ban công', note: 'Có mái che, acoustic cuối tuần', tables: 6, minGuests: 1, maxGuests: 8 },
  { id: 'private', label: 'Phòng riêng', note: '6 – 12 khách, cửa riêng', tables: 1, minGuests: 6, maxGuests: 12 },
]

export const SERVICES = [
  { id: 'lunch', label: 'Bữa trưa', times: ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'] },
  { id: 'dinner', label: 'Bữa tối', times: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'] },
] as const

export interface PreorderItem {
  id: string
  name: string
  price: number
  qty: number
}

export interface Reservation {
  code: string
  name: string
  phone: string
  email: string
  guests: number
  date: string // yyyy-mm-dd
  time: string // HH:mm
  area: AreaId
  occasion: string
  note: string
  experience?: string
  preorders?: PreorderItem[]
  createdAt: string
  status: 'pending'
}

const STORAGE_KEY = 'grilli:reservations'

export function loadReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Reservation[]) : []
  } catch {
    return []
  }
}

export function saveReservation(r: Reservation) {
  const list = loadReservations()
  list.push(r)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function removeReservation(code: string) {
  const list = loadReservations().filter((r) => r.code !== code)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// --- helpers --------------------------------------------------------------

export const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fromISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** FNV-1a → [0, 1). Stable "random" number for a given string. */
function hash01(input: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 0) % 10000) / 10000
}

const tablesNeeded = (guests: number, area: AreaId) => (area === 'private' ? 1 : guests > 6 ? 2 : 1)

function simulatedOccupancy(date: string, time: string, area: Area) {
  const day = fromISODate(date).getDay() // 0 = CN
  const weekend = day === 0 || day === 5 || day === 6
  const [hh, mm] = time.split(':').map(Number)
  const t = hh + mm / 60
  // demand curve: lunch peak 12:00, dinner peak 19:15
  const peak = t < 15 ? Math.exp(-((t - 12.1) ** 2) / 1.1) * 0.55 : Math.exp(-((t - 19.25) ** 2) / 1.6) * 0.75
  const base = (weekend ? 0.32 : 0.12) + peak
  const noise = (hash01(`${date}|${time}|${area.id}`) - 0.5) * 0.45
  const ratio = Math.min(1, Math.max(0, base + noise))
  if (area.id === 'private') return ratio > 0.62 ? 1 : 0
  return Math.round(area.tables * ratio)
}

export interface SlotInfo {
  time: string
  status: SlotStatus
  remaining: number
}

export function getSlots(date: string, areaId: AreaId, guests: number, now = new Date()): SlotInfo[] {
  const area = areas.find((a) => a.id === areaId) ?? areas[0]
  const saved = loadReservations().filter((r) => r.date === date && r.area === areaId)
  const isToday = date === toISODate(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return SERVICES.flatMap((s) => s.times).map((time) => {
    const [hh, mm] = time.split(':').map(Number)
    if (isToday && hh * 60 + mm <= nowMinutes + 30) return { time, status: 'past' as const, remaining: 0 }

    const taken =
      simulatedOccupancy(date, time, area) +
      saved.filter((r) => r.time === time).reduce((sum, r) => sum + tablesNeeded(r.guests, areaId), 0)
    const remaining = Math.max(0, area.tables - taken)
    const need = tablesNeeded(guests, areaId)

    let status: SlotStatus = 'open'
    if (remaining < need) status = 'full'
    else if (area.id !== 'private' && remaining - need < 2) status = 'few'
    return { time, status, remaining }
  })
}

/** Share of bookable slots for a day, used for the "còn nhiều / sắp kín" hint on date chips. */
export function dayLoad(date: string, areaId: AreaId, guests: number) {
  const slots = getSlots(date, areaId, guests).filter((s) => s.status !== 'past')
  if (!slots.length) return { open: 0, total: 0 }
  return { open: slots.filter((s) => s.status === 'open' || s.status === 'few').length, total: slots.length }
}

export function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  bytes.forEach((b) => (out += alphabet[b % alphabet.length]))
  return `GRL-${out}`
}

export const weekdayShort = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function formatDateLong(iso: string) {
  const d = fromISODate(iso)
  const wd = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][d.getDay()]
  return `${wd}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}
