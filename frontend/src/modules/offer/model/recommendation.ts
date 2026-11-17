import type { FailReason } from '../modules/feedback/index.ts'
import type { Offer } from './offer.ts'

export interface OfferRecommendation {
  offerId: string
  message: string
}

function avoidsRefusal(offer: Offer, reason: FailReason): boolean {
  switch (reason) {
    case 'min_order':
      return offer.conditions.minOrder === null
    case 'products':
      return offer.conditions.categoriesInclude.length === 0 && offer.conditions.categoriesExclude.length === 0
    case 'new_customers':
      return offer.conditions.customerType !== 'new'
    case 'not_stackable':
      return offer.kind !== 'code' || offer.conditions.stackableWith.length > 0
    default:
      return true
  }
}

export function recommendOffer(
  offers: readonly Offer[],
  failedId: string,
  reason: FailReason,
): OfferRecommendation | null {
  const failedIndex = offers.findIndex((offer) => offer.id === failedId)
  for (let offset = 1; offset <= offers.length; offset++) {
    const offer = offers[(failedIndex + offset + offers.length) % offers.length]!
    if (offer.id === failedId || offer.isEnded || !avoidsRefusal(offer, reason)) continue
    return {
      offerId: offer.id,
      message: reason === 'min_order' ? 'Попробуйте эту — без мин. суммы' : 'Попробуйте этот оффер',
    }
  }
  return null
}
