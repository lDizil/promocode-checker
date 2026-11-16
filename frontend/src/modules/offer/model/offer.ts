import type { OfferDto } from '../api/offer.dto.ts'

export type OfferType = OfferDto['type']
export type Requirement = OfferDto['conditions']['requirements'][number]
export type Availability = 'yes' | 'partial' | 'no'
export type VerificationMethod = NonNullable<OfferDto['verification']['method']>
export type SourceKind = OfferDto['source']['kind']

/** How the card renders the offer; see DESIGN_SPEC 3.20 `type`. */
export type OfferKind = 'code' | 'sale' | 'cashback' | 'free'
export type ScoreLevel = 'high' | 'medium' | 'low' | 'unknown' | 'ended'

export interface OfferValue {
  amount: number
  currency: string | null
  kind: 'fixed' | 'percent' | 'credit' | 'quota'
  durationDays: number | null
  label: string | null
}

export interface OfferConditions {
  minOrder: number | null
  customerType: 'all' | 'new' | 'existing'
  stackableWith: string[]
  platform: 'web' | 'app' | 'both'
  categoriesInclude: string[]
  categoriesExclude: string[]
  requirements: Requirement[]
}

export interface Verification {
  lastCheckedAt: Date | null
  method: VerificationMethod | null
  score: number | null
  success7d: number
  fail7d: number
}

export interface Offer {
  id: string
  type: OfferType
  kind: OfferKind
  merchant: { slug: string; name: string; logoUrl: string | null }
  title: string
  description: string | null
  code: string | null
  value: OfferValue
  conditions: OfferConditions
  availability: { status: Availability; reason: string | null } | null
  startsAt: Date | null
  expiresAt: Date | null
  endedAt: Date | null
  afterEnd: string | null
  gotchas: string[]
  source: { kind: SourceKind; name: string | null; url: string | null }
  targetUrl: string
  adMarking: { advertiser: string; inn: string; erid: string } | null
  verification: Verification
  isEnded: boolean
}

const FREE: Record<OfferType, boolean> = {
  promo_code: false,
  sale: false,
  cashback: false,
  free_credit: true,
  free_tier: true,
  trial: true,
  student: true,
  startup: true,
}

export function isFreeOffer(type: OfferType): boolean {
  return FREE[type]
}

function kindOf(type: OfferType): OfferKind {
  if (type === 'promo_code') return 'code'
  if (type === 'sale') return 'sale'
  if (type === 'cashback') return 'cashback'
  return 'free'
}

const toDate = (value: string | null): Date | null => (value === null ? null : new Date(value))

export function toOffer(dto: OfferDto): Offer {
  return {
    id: dto.id,
    type: dto.type,
    kind: kindOf(dto.type),
    merchant: { slug: dto.merchant.slug, name: dto.merchant.name, logoUrl: dto.merchant.logo_url },
    title: dto.title,
    description: dto.description_short,
    code: dto.code,
    value: {
      amount: dto.value.amount,
      currency: dto.value.currency,
      kind: dto.value.kind,
      durationDays: dto.value.duration_days,
      label: dto.value.label,
    },
    conditions: {
      minOrder: dto.conditions.min_order,
      customerType: dto.conditions.customer_type,
      stackableWith: dto.conditions.stackable_with,
      platform: dto.conditions.platform,
      categoriesInclude: dto.conditions.categories_include,
      categoriesExclude: dto.conditions.categories_exclude,
      requirements: dto.conditions.requirements,
    },
    availability: dto.availability,
    startsAt: toDate(dto.starts_at),
    expiresAt: toDate(dto.expires_at),
    endedAt: toDate(dto.ended_at),
    afterEnd: dto.after_end,
    gotchas: dto.gotchas,
    source: dto.source,
    targetUrl: dto.target_url,
    adMarking: dto.ad_marking,
    verification: {
      lastCheckedAt: toDate(dto.verification.last_checked_at),
      method: dto.verification.method,
      score: dto.verification.score,
      success7d: dto.verification.success_7d,
      fail7d: dto.verification.fail_7d,
    },
    isEnded: dto.lifecycle === 'ended' || dto.lifecycle === 'expired',
  }
}

/** DESIGN_SPEC 3.13: 70–100 high, 40–69 medium, 0–39 low. */
export function scoreLevel(offer: Pick<Offer, 'isEnded' | 'verification'>): ScoreLevel {
  if (offer.isEnded) return 'ended'
  const { score } = offer.verification
  if (score === null) return 'unknown'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export type OfferSort = 'reliable' | 'value' | 'fresh' | 'expiring'

const byNullableDesc = (a: number | null, b: number | null) => (b ?? -1) - (a ?? -1)

export function sortOffers(offers: readonly Offer[], sort: OfferSort): Offer[] {
  switch (sort) {
    case 'reliable':
      return offers.toSorted((a, b) => byNullableDesc(a.verification.score, b.verification.score))
    case 'value':
      return offers.toSorted((a, b) => b.value.amount - a.value.amount)
    case 'fresh':
      return offers.toSorted((a, b) =>
        byNullableDesc(
          a.verification.lastCheckedAt?.getTime() ?? null,
          b.verification.lastCheckedAt?.getTime() ?? null,
        ),
      )
    case 'expiring':
      return offers.toSorted(
        (a, b) =>
          (a.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY) - (b.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY),
      )
  }
}
