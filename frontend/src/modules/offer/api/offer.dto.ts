import { z } from 'zod'

// Contract per docs/ARD.md §6 (ADR 0003): the frontend owns it until the backend publishes OpenAPI.

export const offerTypeDto = z.enum([
  'promo_code',
  'sale',
  'cashback',
  'free_credit',
  'free_tier',
  'trial',
  'student',
  'startup',
])

export const requirementDto = z.enum(['card', 'foreign_card', 'phone', 'kyc', 'corporate_domain', 'student_status'])

export const offerValueDto = z.object({
  amount: z.number(),
  currency: z.string().length(3).nullable(),
  kind: z.enum(['fixed', 'percent', 'credit', 'quota']),
  duration_days: z.number().int().positive().nullable(),
  /** Mechanics that do not reduce to a number, e.g. «2 по цене 1». */
  label: z.string().nullable(),
})

export const offerConditionsDto = z.object({
  min_order: z.number().nonnegative().nullable(),
  categories_include: z.array(z.string()),
  categories_exclude: z.array(z.string()),
  customer_type: z.enum(['all', 'new', 'existing']),
  stackable_with: z.array(z.string()),
  platform: z.enum(['web', 'app', 'both']),
  region_allow: z.array(z.string()),
  region_deny: z.array(z.string()),
  requirements: z.array(requirementDto),
})

export const availabilityDto = z.object({
  status: z.enum(['yes', 'partial', 'no']),
  reason: z.string().nullable(),
})

export const verificationDto = z.object({
  last_checked_at: z.iso.datetime({ offset: true }).nullable(),
  method: z.enum(['api', 'cart_test', 'crowd', 'manual']).nullable(),
  score: z.number().int().min(0).max(100).nullable(),
  success_7d: z.number().int().nonnegative(),
  fail_7d: z.number().int().nonnegative(),
})

export const sourceDto = z.object({
  kind: z.enum(['partner_api', 'official_page', 'partner_channel', 'user_submission']),
  name: z.string().nullable(),
  url: z.url().nullable(),
})

export const adMarkingDto = z.object({
  advertiser: z.string(),
  inn: z.string(),
  erid: z.string(),
})

export const offerDto = z.object({
  id: z.string(),
  type: offerTypeDto,
  merchant: z.object({
    slug: z.string(),
    name: z.string(),
    logo_url: z.url().nullable(),
  }),
  title: z.string(),
  description_short: z.string().nullable(),
  code: z.string().nullable(),
  value: offerValueDto,
  conditions: offerConditionsDto,
  availability: availabilityDto.nullable(),
  starts_at: z.iso.datetime({ offset: true }).nullable(),
  expires_at: z.iso.datetime({ offset: true }).nullable(),
  ended_at: z.iso.datetime({ offset: true }).nullable(),
  after_end: z.string().nullable(),
  gotchas: z.array(z.string()),
  source: sourceDto,
  target_url: z.url(),
  ad_marking: adMarkingDto.nullable(),
  verification: verificationDto,
  lifecycle: z.enum(['active', 'changed', 'expired', 'ended']),
})

export const offerListDto = z.object({
  items: z.array(offerDto),
  total: z.number().int().nonnegative(),
})

export type OfferDto = z.infer<typeof offerDto>
export type OfferListDto = z.infer<typeof offerListDto>
