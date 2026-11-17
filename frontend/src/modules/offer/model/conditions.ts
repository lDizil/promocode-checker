import { formatDate, formatMoney } from './format.ts'
import type { Offer, Requirement } from './offer.ts'

export type ConditionKind = 'restriction' | 'deadline' | 'neutral'

export interface Condition {
  kind: ConditionKind
  text: string
  /** Deadline ≤ 3 days renders in warning colour (DESIGN_SPEC 3.15). */
  urgent: boolean
}

const REQUIREMENT_TEXT: Record<Requirement, string> = {
  card: 'Нужна карта РФ',
  foreign_card: 'Нужна зарубежная карта',
  phone: 'Нужен номер телефона',
  kyc: 'Нужно подтвердить личность',
  corporate_domain: 'Нужна корпоративная почта',
  student_status: 'Нужен статус студента',
}

const CATEGORY_LIST = new Intl.ListFormat('ru-RU', { style: 'long', type: 'conjunction' })

const ORDER: Record<ConditionKind, number> = { restriction: 0, deadline: 1, neutral: 2 }
const DAY_MS = 24 * 60 * 60 * 1000

/** Ordered restriction → deadline → neutral (DESIGN_SPEC 3.15). */
export function buildConditions(offer: Offer, now: Date): Condition[] {
  const items: Condition[] = []
  const restriction = (text: string) => items.push({ kind: 'restriction', text, urgent: false })
  const neutral = (text: string) => items.push({ kind: 'neutral', text, urgent: false })
  const { conditions } = offer

  if (conditions.customerType === 'new') restriction('Только первый заказ')
  if (conditions.customerType === 'existing') restriction('Только для постоянных клиентов')
  if (conditions.minOrder !== null) restriction(`От ${formatMoney(conditions.minOrder, 'RUB')}`)
  if (conditions.categoriesInclude.length > 0) {
    restriction(`Только категории: ${CATEGORY_LIST.format(conditions.categoriesInclude)}`)
  }
  if (conditions.categoriesExclude.length > 0) {
    restriction(`Не действует на категории: ${CATEGORY_LIST.format(conditions.categoriesExclude)}`)
  }
  if (conditions.stackableWith.length === 0 && offer.kind === 'code') restriction('Не суммируется с другими скидками')
  for (const requirement of conditions.requirements) restriction(REQUIREMENT_TEXT[requirement])
  for (const gotcha of offer.gotchas) restriction(gotcha)

  if (offer.expiresAt) {
    const left = Math.ceil((offer.expiresAt.getTime() - now.getTime()) / DAY_MS)
    const urgent = left >= 0 && left <= 3
    items.push({
      kind: 'deadline',
      text: urgent ? `Осталось ${left} дн.` : `До ${formatDate(offer.expiresAt)}`,
      urgent,
    })
  }
  if (offer.afterEnd) items.push({ kind: 'deadline', text: offer.afterEnd, urgent: false })

  if (conditions.platform === 'app') neutral('Только в приложении')
  if (conditions.platform === 'web') neutral('Только на сайте')

  return items.toSorted((a, b) => ORDER[a.kind] - ORDER[b.kind])
}
