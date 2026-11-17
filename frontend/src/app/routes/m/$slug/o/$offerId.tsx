import { createFileRoute } from '@tanstack/react-router'

import { OfferPage } from '@/pages/offer.tsx'

export const Route = createFileRoute('/m/$slug/o/$offerId')({
  component: OfferPage,
})
