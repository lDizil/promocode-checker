import { describe, expect, it } from 'vitest'

import { plural } from '@/common/plural.ts'

import { formatActiveOffers, formatOffers } from './plural.ts'

describe('plural', () => {
  it('follows Russian plural rules for offer counts', () => {
    expect([0, 1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 101, 111].map(formatOffers)).toEqual([
      '0 офферов',
      '1 оффер',
      '2 оффера',
      '4 оффера',
      '5 офферов',
      '11 офферов',
      '12 офферов',
      '14 офферов',
      '21 оффер',
      '22 оффера',
      '25 офферов',
      '101 оффер',
      '111 офферов',
    ])
  })

  it('selects adjective forms for the merchant header', () => {
    expect([0, 1, 2, 4, 5, 11, 21].map(formatActiveOffers)).toEqual([
      '0 активных офферов',
      '1 активный оффер',
      '2 активных оффера',
      '4 активных оффера',
      '5 активных офферов',
      '11 активных офферов',
      '21 активный оффер',
    ])
  })

  it('accepts custom forms', () => {
    expect(plural(1, { one: 'день', few: 'дня', many: 'дней' })).toBe('день')
    expect(plural(3, { one: 'день', few: 'дня', many: 'дней' })).toBe('дня')
    expect(plural(13, { one: 'день', few: 'дня', many: 'дней' })).toBe('дней')
  })
})
