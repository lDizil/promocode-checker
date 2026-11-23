import type { MerchantSummary } from '@/modules/merchant/index.ts'
import type { Offer, OfferKind, OfferType } from '@/modules/offer/index.ts'

import type {
  DidYouMeanDto,
  SearchResultsDto,
  SearchSuggestItemDto,
  SearchSuggestResponseDto,
} from '../api/search.dto.ts'

export type SearchSuggestKind = SearchSuggestItemDto['kind']

export interface SearchSuggestItem {
  kind: SearchSuggestKind
  id: string
  title: string
  subtitle: string | null
  slug: string | null
  logoUrl: string | null
  categorySlug: string | null
  offerCount: number | null
}

export type DidYouMean = DidYouMeanDto

export interface SearchSuggestResponse {
  items: SearchSuggestItem[]
  didYouMean: DidYouMean | null
}

export interface SearchResults {
  query: string
  merchants: MerchantSummary[]
  offers: Offer[]
}

export interface HighlightPart {
  text: string
  match: boolean
}

export const RECENT_SEARCHES_LIMIT = 5

const FREE_KINDS: Record<OfferType, OfferKind> = {
  promo_code: 'code',
  sale: 'sale',
  cashback: 'cashback',
  free_credit: 'free',
  free_tier: 'free',
  trial: 'free',
  student: 'free',
  startup: 'free',
}

const toDate = (value: string | null): Date | null => (value === null ? null : new Date(value))

function toMerchantSummary(dto: SearchResultsDto['merchants'][number]): MerchantSummary {
  return {
    slug: dto.slug,
    name: dto.name,
    logoUrl: dto.logo_url,
    category: dto.category,
    categorySlug: dto.category_slug,
    offerCount: dto.offer_count,
    featured: dto.featured,
  }
}

function toOffer(dto: SearchResultsDto['offers'][number]): Offer {
  return {
    id: dto.id,
    type: dto.type,
    kind: FREE_KINDS[dto.type],
    categorySlug: dto.category_slug,
    merchant: { slug: dto.merchant.slug, name: dto.merchant.name, logoUrl: dto.merchant.logo_url },
    title: dto.title,
    description: dto.description_short,
    mechanicText: dto.mechanic_text,
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
    eligibility: dto.eligibility
      ? {
          region: dto.eligibility.region,
          accountType: dto.eligibility.account_type,
          accountRule: dto.eligibility.account_rule,
          duration: dto.eligibility.duration,
          requirementsNote: dto.eligibility.requirements_note,
        }
      : null,
    howToGet: dto.how_to_get,
    failReasons: dto.fail_reasons,
    history: dto.history.map((item) => ({
      date: new Date(item.date),
      title: item.title,
      description: item.description,
      state: item.state,
    })),
    changedNote: dto.changed_note,
    audience: dto.audience,
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
    lifecycle: dto.lifecycle,
    isEnded: dto.lifecycle === 'ended' || dto.lifecycle === 'expired',
  }
}

export function toSearchSuggest(dto: SearchSuggestResponseDto): SearchSuggestResponse {
  return {
    items: dto.items.map((item) => ({
      kind: item.kind,
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      slug: item.slug,
      logoUrl: item.logo_url,
      categorySlug: item.category_slug,
      offerCount: item.offer_count,
    })),
    didYouMean: dto.did_you_mean,
  }
}

export function toSearchResults(dto: SearchResultsDto): SearchResults {
  return {
    query: dto.query,
    merchants: dto.merchants.map(toMerchantSummary),
    offers: dto.offers.map(toOffer),
  }
}

export function normalizeSearchText(text: string): string {
  return text.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
}

const RU_MULTI: readonly [string, string][] = [
  ['кс', 'x'],
  ['щ', 'shch'],
  ['ш', 'sh'],
  ['ч', 'ch'],
  ['ж', 'zh'],
  ['ю', 'yu'],
  ['я', 'ya'],
  ['х', 'kh'],
  ['ц', 'ts'],
]

const RU_SINGLE: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  ы: 'y',
  э: 'e',
  ъ: '',
  ь: '',
}

/** Phonetic transliteration so Cyrillic queries like «яндекс» match «Yandex Cloud». */
export function toSearchPhonetic(text: string): string {
  let out = normalizeSearchText(text).replaceAll('ks', 'x')
  for (const [cyr, lat] of RU_MULTI) {
    out = out.replaceAll(cyr, lat)
  }
  let mapped = ''
  for (const ch of out) {
    mapped += RU_SINGLE[ch] ?? ch
  }
  return mapped
}

export function levenshtein(a: string, b: string): number {
  const left = [...a]
  const right = [...b]
  if (left.length === 0) return right.length
  if (right.length === 0) return left.length

  let prev = Array.from({ length: right.length + 1 }, (_, idx) => idx)
  for (let i = 1; i <= left.length; i++) {
    const curr: number[] = [i]
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      curr[j] = Math.min((prev[j] ?? 0) + 1, (curr[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost)
    }
    prev = curr
  }
  return prev[right.length] ?? 0
}

export function findTypoSuggestion(
  query: string,
  merchants: readonly Pick<MerchantSummary, 'name' | 'slug'>[],
): DidYouMean | null {
  const qNorm = normalizeSearchText(query)
  if ([...qNorm].length < 3) return null
  const qLat = toSearchPhonetic(qNorm)

  let best: { merchant: DidYouMean; distance: number } | null = null

  for (const merchant of merchants) {
    const nameNorm = normalizeSearchText(merchant.name)
    const slugNorm = normalizeSearchText(merchant.slug)
    const words = nameNorm.split(/[\s-]+/).filter((word) => [...word].length >= 3)
    const candidates = [
      { query: qNorm, target: nameNorm },
      { query: qLat, target: toSearchPhonetic(nameNorm) },
      { query: qLat, target: slugNorm },
      ...words.flatMap((word) => [
        { query: qNorm, target: word },
        { query: qLat, target: toSearchPhonetic(word) },
      ]),
    ]

    for (const pair of candidates) {
      const maxLen = Math.max([...pair.query].length, [...pair.target].length)
      const threshold = Math.min(3, Math.max(1, Math.floor(maxLen * 0.4)))
      const distance = levenshtein(pair.query, pair.target)
      if (distance <= threshold && (best === null || distance < best.distance)) {
        best = { merchant: { name: merchant.name, slug: merchant.slug }, distance }
      }
    }
  }

  return best?.merchant ?? null
}

/** Splits `text` into matched/unmatched slices (case- and `ё`-insensitive) for `<strong>` highlighting. */
export function splitHighlight(text: string, query: string): HighlightPart[] {
  if (text === '') return []
  const needle = normalizeSearchText(query)
  if (needle === '') return [{ text, match: false }]

  const haystack = text.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
  if (haystack.length !== text.length) return [{ text, match: false }]

  const parts: HighlightPart[] = []
  let cursor = 0

  while (cursor < text.length) {
    const idx = haystack.indexOf(needle, cursor)
    if (idx === -1) {
      parts.push({ text: text.slice(cursor), match: false })
      break
    }
    if (idx > cursor) {
      parts.push({ text: text.slice(cursor, idx), match: false })
    }
    parts.push({ text: text.slice(idx, idx + needle.length), match: true })
    cursor = idx + needle.length
  }

  return parts
}

export function addRecentSearch(list: readonly string[], query: string): string[] {
  const trimmed = query.trim()
  if (trimmed === '') return list.slice(0, RECENT_SEARCHES_LIMIT)
  const normalized = normalizeSearchText(trimmed)
  const rest = list.filter((item) => normalizeSearchText(item) !== normalized)
  return [trimmed, ...rest].slice(0, RECENT_SEARCHES_LIMIT)
}

export function removeRecentSearch(list: readonly string[], query: string): string[] {
  const trimmed = query.trim()
  return list.filter((item) => item !== trimmed)
}
