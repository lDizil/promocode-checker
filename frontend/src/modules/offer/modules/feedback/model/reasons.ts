import { failReasonDto, type FailReason } from '../api/feedback.dto.ts'

/** Radio labels exactly as DESIGN_SPEC 3.19. */
export const FAIL_REASON_LABELS: Record<FailReason, string> = {
  expired: 'Код истёк или не существует',
  min_order: 'Не подошла сумма заказа',
  products: 'Не подошли товары или категория',
  new_customers: 'Только для новых клиентов',
  not_stackable: 'Не суммируется с другой скидкой',
  smaller_discount: 'Скидка меньше обещанной',
  other: 'Другое',
}

export const failReasonOptions = failReasonDto.options.map((value) => ({ value, label: FAIL_REASON_LABELS[value] }))

export interface FailReasonInput {
  reason: FailReason
  comment?: string
}
