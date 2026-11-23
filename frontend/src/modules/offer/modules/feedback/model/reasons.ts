import type { FailReason } from '../api/feedback.dto.ts'

export const ALL_FAIL_REASON_LABELS: Record<FailReason, string> = {
  expired: 'Код истёк или не существует',
  min_order: 'Не подошла сумма заказа',
  products: 'Не подошли товары или категория',
  new_customers: 'Только для новых клиентов',
  not_stackable: 'Не суммируется с другой скидкой',
  smaller_discount: 'Скидка меньше обещанной',
  offer_ended: 'Оффер закончился',
  card_rejected: 'Не прошла карта',
  ineligible: 'Не подхожу по условиям',
  region_unavailable: 'Регион недоступен',
  other: 'Другое',
}

const PROMO_REASONS = [
  'expired',
  'min_order',
  'products',
  'new_customers',
  'not_stackable',
  'smaller_discount',
  'other',
] as const satisfies readonly FailReason[]

const FREE_REASONS = [
  'offer_ended',
  'card_rejected',
  'ineligible',
  'region_unavailable',
  'other',
] as const satisfies readonly FailReason[]

/** Radio labels exactly as DESIGN_SPEC 3.19. */
export const FAIL_REASON_LABELS: Record<FailReason, string> = ALL_FAIL_REASON_LABELS

export const failReasonOptions = PROMO_REASONS.map((value) => ({ value, label: ALL_FAIL_REASON_LABELS[value] }))

export const freeFailReasonOptions = FREE_REASONS.map((value) => ({ value, label: ALL_FAIL_REASON_LABELS[value] }))

export interface FailReasonInput {
  reason: FailReason
  comment?: string
}
