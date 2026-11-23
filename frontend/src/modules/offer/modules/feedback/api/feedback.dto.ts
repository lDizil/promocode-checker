import { z } from 'zod'

export const feedbackVerdictDto = z.enum(['worked', 'failed'])

/** Promo answers (DESIGN_SPEC 3.19) plus free-offer answers (DESIGN_SPEC 4.8 item 12). */
export const failReasonDto = z.enum([
  'expired',
  'min_order',
  'products',
  'new_customers',
  'not_stackable',
  'smaller_discount',
  'offer_ended',
  'card_rejected',
  'ineligible',
  'region_unavailable',
  'other',
])

export const feedbackRequestDto = z.object({
  verdict: feedbackVerdictDto,
  reason: failReasonDto.optional(),
  comment: z.string().max(200).optional(),
})

export const feedbackResponseDto = z.object({
  offer_id: z.string(),
  verdict: feedbackVerdictDto,
  reason: failReasonDto.nullable(),
  score: z.number(),
})

export type FeedbackVerdict = z.infer<typeof feedbackVerdictDto>
export type FailReason = z.infer<typeof failReasonDto>
export type FeedbackRequest = z.infer<typeof feedbackRequestDto>
export type FeedbackResponse = z.infer<typeof feedbackResponseDto>
