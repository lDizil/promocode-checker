import { describe, expect, it } from 'vitest'

import {
  addRecentSearch,
  findTypoSuggestion,
  levenshtein,
  removeRecentSearch,
  splitHighlight,
  toSearchPhonetic,
  toSearchResults,
  toSearchSuggest,
} from './search.ts'

const MERCHANTS = [
  { name: 'Самокат', slug: 'samokat' },
  { name: 'Яндекс Еда', slug: 'yandex-eda' },
  { name: 'Ozon', slug: 'ozon' },
  { name: 'Ламода', slug: 'lamoda' },
  { name: 'Yandex Cloud', slug: 'yandex-cloud' },
  { name: 'Перекрёсток', slug: 'perekrestok' },
]

describe('levenshtein', () => {
  it('computes edit distance for identical, empty and typo strings', () => {
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('сам', '')).toBe(3)
    expect(levenshtein('самокат', 'самокат')).toBe(0)
    expect(levenshtein('ламаода', 'ламода')).toBe(1)
    expect(levenshtein('самаокт', 'самокат')).toBe(2)
  })
})

describe('toSearchPhonetic', () => {
  it('normalizes Russian queries to match Latin brand names', () => {
    expect(toSearchPhonetic('яндекс')).toBe('yandex')
    expect(toSearchPhonetic('Перекрёсток')).toBe('perekrestok')
  })
})

describe('findTypoSuggestion', () => {
  it('suggests the closest merchant on typos like «ламаода» → Ламода', () => {
    expect(findTypoSuggestion('ламаода', MERCHANTS)).toEqual({ name: 'Ламода', slug: 'lamoda' })
    expect(findTypoSuggestion('самакат', MERCHANTS)).toEqual({ name: 'Самокат', slug: 'samokat' })
    expect(findTypoSuggestion('озоон', MERCHANTS)).toEqual({ name: 'Ozon', slug: 'ozon' })
  })

  it('returns null for short queries and unrelated gibberish', () => {
    expect(findTypoSuggestion('аб', MERCHANTS)).toBeNull()
    expect(findTypoSuggestion('абвгдеёжз', MERCHANTS)).toBeNull()
  })
})

describe('splitHighlight', () => {
  it('splits matched substrings case- and ё-insensitively', () => {
    expect(splitHighlight('Самокат', 'сам')).toEqual([
      { text: 'Сам', match: true },
      { text: 'окат', match: false },
    ])
    expect(splitHighlight('Перекрёсток', 'рекрес')).toEqual([
      { text: 'Пе', match: false },
      { text: 'рекрёс', match: true },
      { text: 'ток', match: false },
    ])
    expect(splitHighlight('Yandex Cloud', 'яндекс')).toEqual([{ text: 'Yandex Cloud', match: false }])
    expect(splitHighlight('Самокат', '')).toEqual([{ text: 'Самокат', match: false }])
    expect(splitHighlight('', 'сам')).toEqual([])
  })
})

describe('recent searches', () => {
  it('keeps up to 5 unique items with the newest query first', () => {
    let list: string[] = []
    for (const q of ['Ozon', 'Самокат', 'Яндекс Еда', 'Литрес', 'Купер', 'Мегамаркет']) {
      list = addRecentSearch(list, q)
    }
    expect(list).toEqual(['Мегамаркет', 'Купер', 'Литрес', 'Яндекс Еда', 'Самокат'])

    list = addRecentSearch(list, '  самокат  ')
    expect(list).toEqual(['самокат', 'Мегамаркет', 'Купер', 'Литрес', 'Яндекс Еда'])

    expect(addRecentSearch(list, '   ')).toEqual(list)
    expect(removeRecentSearch(list, 'Литрес')).toEqual(['самокат', 'Мегамаркет', 'Купер', 'Яндекс Еда'])
  })
})

describe('DTO mapping', () => {
  it('maps search suggest items and did_you_mean to camelCase domain shape', () => {
    expect(
      toSearchSuggest({
        items: [
          {
            kind: 'merchant',
            id: 'merchant:samokat',
            title: 'Самокат',
            subtitle: null,
            slug: 'samokat',
            logo_url: '/brands/samokat.svg',
            category_slug: 'food',
            offer_count: 4,
          },
        ],
        did_you_mean: { name: 'Ламода', slug: 'lamoda' },
      }),
    ).toEqual({
      items: [
        {
          kind: 'merchant',
          id: 'merchant:samokat',
          title: 'Самокат',
          subtitle: null,
          slug: 'samokat',
          logoUrl: '/brands/samokat.svg',
          categorySlug: 'food',
          offerCount: 4,
        },
      ],
      didYouMean: { name: 'Ламода', slug: 'lamoda' },
    })
  })

  it('maps empty search results cleanly', () => {
    expect(toSearchResults({ query: 'яндекс', merchants: [], offers: [] })).toEqual({
      query: 'яндекс',
      merchants: [],
      offers: [],
    })
  })
})
