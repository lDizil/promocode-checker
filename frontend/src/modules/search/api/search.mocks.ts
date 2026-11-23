import { http, HttpResponse } from 'msw'

import { merchantSummaries } from '@/modules/merchant/mocks.ts'
import { allMockOffers } from '@/modules/offer/mocks.ts'

import { findTypoSuggestion, normalizeSearchText, toSearchPhonetic } from '../model/search.ts'
import type { SearchSuggestItemDto } from './search.dto.ts'

interface CategoryEntry {
  id: string
  title: string
  category_slug: string
  aliases: readonly string[]
}

const SEARCH_CATEGORIES: readonly CategoryEntry[] = [
  {
    id: 'category:travel-flights',
    title: 'Самолёт: билеты',
    category_slug: 'travel',
    aliases: ['авиабилеты', 'перелёты'],
  },
  { id: 'category:food', title: 'Еда и продукты', category_slug: 'food', aliases: ['доставка еды', 'продукты'] },
  {
    id: 'category:marketplaces',
    title: 'Маркетплейсы',
    category_slug: 'marketplaces',
    aliases: ['магазины'],
  },
  { id: 'category:clothing', title: 'Одежда', category_slug: 'clothing', aliases: ['обувь', 'мода'] },
  {
    id: 'category:subscriptions',
    title: 'Подписки',
    category_slug: 'subscriptions',
    aliases: ['книги', 'сервисы'],
  },
  { id: 'category:travel', title: 'Путешествия', category_slug: 'travel', aliases: ['отели', 'туры'] },
  { id: 'category:free', title: 'Бесплатно', category_slug: 'free', aliases: ['гранты', 'free'] },
  {
    id: 'category:free-cloud',
    title: 'Облака и VPS',
    category_slug: 'free/cloud',
    aliases: ['облако', 'серверы'],
  },
  { id: 'category:free-students', title: 'Студентам', category_slug: 'free/students', aliases: ['учёба'] },
  { id: 'category:free-hosting', title: 'Хостинг', category_slug: 'free/hosting', aliases: ['домены', 'cdn'] },
  {
    id: 'category:free-ai',
    title: 'ИИ-модели и API',
    category_slug: 'free/ai',
    aliases: ['нейросети', 'ии', 'ai'],
  },
]

const MERCHANT_ALIASES: Record<string, readonly string[]> = {
  wildberries: ['вайлдберриз', 'валдберис', 'вб'],
  github: ['гитхаб'],
  cloudflare: ['клаудфлейр', 'клоудфлейр'],
  'timeweb-cloud': ['таймвеб'],
  openai: ['опенаи', 'чатгпт'],
  aws: ['авс', 'амазон'],
}

const CATEGORY_TITLE_BY_SLUG = new Map(
  SEARCH_CATEGORIES.filter((cat) => cat.id !== 'category:travel-flights').map((cat) => [cat.category_slug, cat.title]),
)

function textMatchesQuery(text: string | null | undefined, query: string): boolean {
  if (!text) return false
  const qNorm = normalizeSearchText(query)
  if (!qNorm) return false
  const tNorm = normalizeSearchText(text)
  if (tNorm.includes(qNorm)) return true
  const qPhonetic = toSearchPhonetic(qNorm)
  return qPhonetic.length > 0 && toSearchPhonetic(tNorm).includes(qPhonetic)
}

function anyMatchesQuery(candidates: readonly (string | null | undefined)[], query: string): boolean {
  return candidates.some((candidate) => textMatchesQuery(candidate, query))
}

function offerMatchesQuery(offer: ReturnType<typeof allMockOffers>[number], query: string): boolean {
  return anyMatchesQuery(
    [
      offer.merchant.name,
      offer.merchant.slug,
      offer.title,
      offer.code,
      offer.category_slug,
      CATEGORY_TITLE_BY_SLUG.get(offer.category_slug),
      offer.value.label,
      offer.description_short,
      ...(MERCHANT_ALIASES[offer.merchant.slug] ?? []),
    ],
    query,
  )
}

export const searchHandlers = [
  http.get('*/api/search/suggest', ({ request }) => {
    const url = new URL(request.url)
    const rawQuery = url.searchParams.get('q')?.trim() ?? ''
    if (!rawQuery) {
      return HttpResponse.json({ items: [], did_you_mean: null })
    }

    const now = new Date()
    const merchants = merchantSummaries(now)
    const offers = allMockOffers(now)

    const matchedMerchants = merchants.filter((m) =>
      anyMatchesQuery([m.name, m.slug, ...(MERCHANT_ALIASES[m.slug] ?? [])], rawQuery),
    )

    const matchedCategories = SEARCH_CATEGORIES.filter((cat) =>
      anyMatchesQuery([cat.title, cat.category_slug, ...cat.aliases], rawQuery),
    )

    const matchedOffers = offers.filter((offer) => offerMatchesQuery(offer, rawQuery))

    if (matchedMerchants.length === 0 && matchedCategories.length === 0 && matchedOffers.length === 0) {
      const didYouMean = findTypoSuggestion(
        rawQuery,
        merchants.map((m) => ({ name: m.name, slug: m.slug })),
      )
      return HttpResponse.json({ items: [], did_you_mean: didYouMean })
    }

    const merchantItems: SearchSuggestItemDto[] = matchedMerchants.slice(0, 4).map((m) => ({
      kind: 'merchant',
      id: `merchant:${m.slug}`,
      title: m.name,
      subtitle: null,
      slug: m.slug,
      logo_url: m.logo_url,
      category_slug: m.category_slug,
      offer_count: m.offer_count,
    }))

    const categoryItems: SearchSuggestItemDto[] = matchedCategories.slice(0, 2).map((cat) => ({
      kind: 'category',
      id: cat.id,
      title: cat.title,
      subtitle: 'Категория',
      slug: null,
      logo_url: null,
      category_slug: cat.category_slug,
      offer_count: null,
    }))

    const queryItem: SearchSuggestItemDto = {
      kind: 'query',
      id: `query:${rawQuery}`,
      title: rawQuery,
      subtitle: null,
      slug: null,
      logo_url: null,
      category_slug: null,
      offer_count: matchedOffers.length,
    }

    const items: SearchSuggestItemDto[] = [...merchantItems, ...categoryItems].slice(0, 5)
    items.push(queryItem)

    return HttpResponse.json({ items, did_you_mean: null })
  }),

  http.get('*/api/search', ({ request }) => {
    const url = new URL(request.url)
    const rawQuery = url.searchParams.get('q')?.trim() ?? ''
    const now = new Date()
    const allMerchants = merchantSummaries(now)
    const allOffers = allMockOffers(now)

    if (!rawQuery) {
      return HttpResponse.json({ query: '', merchants: allMerchants, offers: allOffers })
    }

    const merchants = allMerchants.filter((m) =>
      anyMatchesQuery([m.name, m.slug, m.category, m.category_slug, ...(MERCHANT_ALIASES[m.slug] ?? [])], rawQuery),
    )

    const matchedMerchantSlugs = new Set(merchants.map((m) => m.slug))
    const offers = allOffers.filter(
      (offer) => matchedMerchantSlugs.has(offer.merchant.slug) || offerMatchesQuery(offer, rawQuery),
    )

    return HttpResponse.json({ query: rawQuery, merchants, offers })
  }),
]
