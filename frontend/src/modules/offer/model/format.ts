import type { Offer, OfferValue } from './offer.ts'

const money = (amount: number, currency: string | null) =>
  new Intl.NumberFormat('ru-RU', {
    style: currency ? 'currency' : 'decimal',
    currency: currency ?? undefined,
    maximumFractionDigits: 0,
  }).format(amount)

const days = (n: number) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дня`
  return `${n} дней`
}

/** «−300 ₽», «−15%», «≥ 4 000 ₽ на 60 дней» (DESIGN_SPEC 3.20, ARD C-10: no bare «до 90%»). */
export function formatValue(value: OfferValue): string {
  if (value.label) return value.label
  switch (value.kind) {
    case 'fixed':
      return `−${money(value.amount, value.currency)}`
    case 'percent':
      return `−${value.amount}%`
    case 'credit': {
      const base = money(value.amount, value.currency)
      return value.durationDays ? `${base} на ${days(value.durationDays)}` : base
    }
    case 'quota':
      return 'Бесплатно'
  }
}

/** Value plus the order threshold: «−300 ₽ на заказ от 1 500 ₽». */
export function formatHeadline(offer: Pick<Offer, 'value' | 'conditions'>): string {
  const value = formatValue(offer.value)
  const { minOrder } = offer.conditions
  if (minOrder === null || offer.value.kind === 'credit' || offer.value.kind === 'quota') return value
  return `${value} на заказ от ${money(minOrder, offer.value.currency ?? 'RUB')}`
}

const DATE = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function formatDate(date: Date): string {
  return DATE.format(date)
}

/** DESIGN_SPEC 3.14 time formats. */
export function formatAgo(date: Date, now: Date): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  const daysAgo = Math.floor(hours / 24)
  if (daysAgo === 1) return 'вчера'
  if (daysAgo <= 6) return `${days(daysAgo)} назад`
  return formatDate(date)
}

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export function isStale(checkedAt: Date | null, now: Date): boolean {
  return checkedAt === null || now.getTime() - checkedAt.getTime() > STALE_AFTER_MS
}
