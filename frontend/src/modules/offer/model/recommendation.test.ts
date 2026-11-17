import { describe, expect, it } from 'vitest'

import { samokatOffers } from '../api/offer.mocks.ts'
import { toOffer } from './offer.ts'
import { recommendOffer } from './recommendation.ts'

const offers = samokatOffers(new Date('2026-11-16T12:00:00+03:00')).map(toOffer)

describe('recommendOffer', () => {
  it('suggests an active offer without a minimum after an amount refusal', () => {
    expect(recommendOffer(offers, 'o1', 'min_order')).toEqual({
      offerId: 'o3',
      message: 'Попробуйте эту — без мин. суммы',
    })
  })

  it('never recommends an ended offer or the refused code', () => {
    expect(
      recommendOffer(
        offers.filter((offer) => offer.id === 'o1' || offer.id === 'o5'),
        'o1',
        'expired',
      ),
    ).toBeNull()
  })

  it('does not repeat an incompatible customer restriction', () => {
    const onlyNew = offers.filter((offer) => offer.id === 'o1')
    expect(recommendOffer(onlyNew, 'o2', 'new_customers')).toBeNull()
  })
})
