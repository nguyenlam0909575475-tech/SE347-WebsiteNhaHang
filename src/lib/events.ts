// Tiny cross-section event bus (CustomEvent on window), same idea LUN-RA used
// to pre-select a room in its booking form.

export const EVT_OPEN_MENU_ITEM = 'grilli:open-menu-item'
export const EVT_PREFILL_RESERVATION = 'grilli:prefill-reservation'

export interface PrefillDetail {
  experience?: string
  area?: 'indoor' | 'balcony' | 'private'
  guests?: number
  note?: string
  dishId?: string
}

export const openMenuItem = (id: string) => window.dispatchEvent(new CustomEvent(EVT_OPEN_MENU_ITEM, { detail: id }))

export const prefillReservation = (detail: PrefillDetail) =>
  window.dispatchEvent(new CustomEvent<PrefillDetail>(EVT_PREFILL_RESERVATION, { detail }))
