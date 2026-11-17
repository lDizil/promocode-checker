import { useCallback, useEffect, useState } from 'react'

import type { Offer } from '../model/offer.ts'
import { recommendOffer, type OfferRecommendation } from '../model/recommendation.ts'
import type { FeedbackResponse } from '../modules/feedback/index.ts'

export function useOfferRecommendation(offers: readonly Offer[]) {
  const [recommendation, setRecommendation] = useState<OfferRecommendation | null>(null)

  useEffect(() => {
    if (!recommendation) return
    const timer = setTimeout(() => setRecommendation(null), 5000)
    return () => clearTimeout(timer)
  }, [recommendation])

  const onFeedbackSubmitted = useCallback(
    (response: FeedbackResponse) => {
      if (response.verdict !== 'failed' || response.reason === null) return
      setRecommendation(recommendOffer(offers, response.offer_id, response.reason))
    },
    [offers],
  )

  return {
    recommendation:
      recommendation && offers.some((offer) => offer.id === recommendation.offerId) ? recommendation : null,
    onFeedbackSubmitted,
  }
}
