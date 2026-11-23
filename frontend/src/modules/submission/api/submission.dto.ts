import { z } from 'zod'

export const submissionSourceDto = z.enum(['telegram', 'email', 'site', 'blogger', 'other'])

export const submissionRequestDto = z.object({
  merchant_name: z.string().min(1),
  merchant_slug: z.string().nullable(),
  code: z.string().min(3).max(32),
  value: z.string().min(1),
  first_order_only: z.boolean(),
  min_order: z.number().nonnegative().nullable(),
  categories_note: z.string().nullable(),
  app_only: z.boolean(),
  expires_at: z.string().nullable(),
  source_kind: submissionSourceDto,
  source_url: z.string().nullable(),
  self_checked: z.enum(['yes', 'no']),
  not_personal: z.literal(true),
})

export const submissionResponseDto = z.object({
  id: z.string(),
  status: z.enum(['pending']),
  merchant_name: z.string(),
  merchant_slug: z.string().nullable(),
})

export const duplicateOfferDto = z.object({
  id: z.string(),
  merchant_slug: z.string(),
  code: z.string(),
  score: z.number().nullable(),
  last_checked_at: z.iso.datetime({ offset: true }).nullable(),
})

export const duplicateCheckDto = z.object({
  duplicate: duplicateOfferDto.nullable(),
})

export type SubmissionSource = z.infer<typeof submissionSourceDto>
export type SubmissionRequest = z.infer<typeof submissionRequestDto>
export type SubmissionResponse = z.infer<typeof submissionResponseDto>
export type DuplicateOfferDto = z.infer<typeof duplicateOfferDto>
export type DuplicateCheckDto = z.infer<typeof duplicateCheckDto>
