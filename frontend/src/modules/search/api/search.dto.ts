import { z } from 'zod'

const logoUrlDto = z.union([z.url(), z.string().regex(/^\/[a-zA-Z0-9/._-]+$/)]).nullable()

export const searchSuggestItemDto = z.object({
  kind: z.enum(['merchant', 'category', 'query']),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  slug: z.string().nullable(),
  logo_url: logoUrlDto,
  category_slug: z.string().nullable(),
  offer_count: z.number().int().nonnegative().nullable(),
})

export const didYouMeanDto = z.object({
  name: z.string(),
  slug: z.string(),
})

export const searchSuggestResponseDto = z.object({
  items: z.array(searchSuggestItemDto),
  did_you_mean: didYouMeanDto.nullable(),
})

const searchMerchantSummaryDto = z.object({
  slug: z.string(),
  name: z.string(),
  logo_url: logoUrlDto,
  category: z.string(),
  category_slug: z.string(),
  offer_count: z.number().int().nonnegative(),
  featured: z.boolean(),
})

const searchOfferTypeDto = z.enum([
  'promo_code',
  'sale',
  'cashback',
  'free_credit',
  'free_tier',
  'trial',
  'student',
  'startup',
])

const searchRequirementDto = z.enum(['card', 'foreign_card', 'phone', 'kyc', 'corporate_domain', 'student_status'])

const searchOfferDto = z.object({
  id: z.string(),
  type: searchOfferTypeDto,
  category_slug: z.string().default('food'),
  merchant: z.object({
    slug: z.string(),
    name: z.string(),
    logo_url: logoUrlDto,
  }),
  title: z.string(),
  description_short: z.string().nullable(),
  mechanic_text: z.string().nullable().default(null),
  code: z.string().nullable(),
  value: z.object({
    amount: z.number(),
    currency: z.string().length(3).nullable(),
    kind: z.enum(['fixed', 'percent', 'credit', 'quota']),
    duration_days: z.number().int().positive().nullable(),
    label: z.string().nullable(),
  }),
  conditions: z.object({
    min_order: z.number().nonnegative().nullable(),
    categories_include: z.array(z.string()),
    categories_exclude: z.array(z.string()),
    customer_type: z.enum(['all', 'new', 'existing']),
    stackable_with: z.array(z.string()),
    platform: z.enum(['web', 'app', 'both']),
    region_allow: z.array(z.string()),
    region_deny: z.array(z.string()),
    requirements: z.array(searchRequirementDto),
  }),
  availability: z
    .object({
      status: z.enum(['yes', 'partial', 'no']),
      reason: z.string().nullable(),
    })
    .nullable(),
  starts_at: z.iso.datetime({ offset: true }).nullable(),
  expires_at: z.iso.datetime({ offset: true }).nullable(),
  ended_at: z.iso.datetime({ offset: true }).nullable(),
  after_end: z.string().nullable(),
  gotchas: z.array(z.string()),
  eligibility: z
    .object({
      region: z.string(),
      account_type: z.string(),
      account_rule: z.string(),
      duration: z.string(),
      requirements_note: z.string().nullable(),
    })
    .nullable()
    .default(null),
  how_to_get: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
    )
    .default([]),
  fail_reasons: z
    .array(
      z.object({
        reason: z.string(),
        count: z.number().int().nonnegative(),
      }),
    )
    .default([]),
  history: z
    .array(
      z.object({
        date: z.iso.datetime({ offset: true }),
        title: z.string(),
        description: z.string().nullable(),
        state: z.enum(['done', 'current']),
      }),
    )
    .default([]),
  changed_note: z.string().nullable().default(null),
  audience: z.array(z.enum(['individual', 'student', 'business'])).default(['individual']),
  source: z.object({
    kind: z.enum(['partner_api', 'official_page', 'partner_channel', 'user_submission']),
    name: z.string().nullable(),
    url: z.url().nullable(),
  }),
  target_url: z.url(),
  ad_marking: z
    .object({
      advertiser: z.string(),
      inn: z.string(),
      erid: z.string(),
    })
    .nullable(),
  verification: z.object({
    last_checked_at: z.iso.datetime({ offset: true }).nullable(),
    method: z.enum(['api', 'cart_test', 'crowd', 'manual']).nullable(),
    score: z.number().int().min(0).max(100).nullable(),
    success_7d: z.number().int().nonnegative(),
    fail_7d: z.number().int().nonnegative(),
  }),
  lifecycle: z.enum(['active', 'changed', 'expired', 'ended']),
})

export const searchResultsDto = z.object({
  query: z.string(),
  merchants: z.array(searchMerchantSummaryDto),
  offers: z.array(searchOfferDto),
})

export type SearchSuggestItemDto = z.infer<typeof searchSuggestItemDto>
export type DidYouMeanDto = z.infer<typeof didYouMeanDto>
export type SearchSuggestResponseDto = z.infer<typeof searchSuggestResponseDto>
export type SearchResultsDto = z.infer<typeof searchResultsDto>
