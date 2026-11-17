import { plural, type PluralForms } from '@/common/plural.ts'

import type { Offer, OfferValue, VerificationMethod } from './offer.ts'

const DECIMAL = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>()

/** Amount with ru-RU grouping; currency formatters are created once and cached. */
export function formatMoney(amount: number, currency: string | null): string {
  if (currency === null) return DECIMAL.format(amount)
  let formatter = CURRENCY_FORMATTERS.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 })
    CURRENCY_FORMATTERS.set(currency, formatter)
  }
  return formatter.format(amount)
}

const DAY_FORMS: PluralForms = { one: 'день', few: 'дня', many: 'дней' }

export function formatDayCount(count: number): string {
  return `${count} ${plural(count, DAY_FORMS)}`
}

/** «−300 ₽», «−15%», «≥ 4 000 ₽ на 60 дней» (DESIGN_SPEC 3.20, ARD C-10: no bare «до 90%»). */
export function formatValue(value: OfferValue): string {
  if (value.label) return value.label
  switch (value.kind) {
    case 'fixed':
      return `−${formatMoney(value.amount, value.currency)}`
    case 'percent':
      return `−${value.amount}%`
    case 'credit': {
      const base = formatMoney(value.amount, value.currency)
      return value.durationDays ? `${base} на ${formatDayCount(value.durationDays)}` : base
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
  return `${value} на заказ от ${formatMoney(minOrder, offer.value.currency ?? 'RUB')}`
}

const DATE = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Europe/Moscow',
})
const TIME = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Moscow',
})

/** Europe/Moscow is explicit so SSR and client render the same calendar day. */
export function formatDate(date: Date): string {
  return DATE.format(date)
}

/** Europe/Moscow clock time, e.g. «14:20» (DESIGN_SPEC 4.5). */
export function formatTime(date: Date): string {
  return TIME.format(date)
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
  if (daysAgo <= 6) return `${formatDayCount(daysAgo)} назад`
  return formatDate(date)
}

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export function isStale(checkedAt: Date | null, now: Date): boolean {
  return checkedAt === null || now.getTime() - checkedAt.getTime() > STALE_AFTER_MS
}

const METHOD_LABEL: Record<VerificationMethod, string> = {
  api: 'партнёрская сеть',
  cart_test: 'тест в корзине',
  crowd: 'отзывы пользователей',
  manual: 'редакция',
}

/** Verification source caption (DESIGN_SPEC 3.14); `null` when the offer has no method yet. */
export function formatVerificationMethod(method: VerificationMethod | null): string | null {
  return method === null ? null : METHOD_LABEL[method]
}
