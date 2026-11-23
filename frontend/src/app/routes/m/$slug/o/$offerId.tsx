import { createFileRoute, notFound } from '@tanstack/react-router'

import { isNotFound } from '@/common/http.ts'
import { merchantQueries } from '@/modules/merchant/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { formatHeadline, isFreeOffer, offerQueries } from '@/modules/offer/index.ts'
import { OfferPage, OfferPageSkeleton } from '@/pages/offer.tsx'

export const Route = createFileRoute('/m/$slug/o/$offerId')({
  loader: async ({ context: { queryClient }, params: { slug, offerId } }) => {
    try {
      const detailQuery = offerQueries.detail(offerId)
      if (!isConnectionOnline() && queryClient.getQueryData(detailQuery.queryKey) === undefined) {
        throw new OfflineDataUnavailableError()
      }

      const offer = await queryClient.ensureQueryData(detailQuery)
      if (offer.merchant.slug !== slug) throw notFound()

      const merchantQuery = merchantQueries.detail(slug)
      const isFree = isFreeOffer(offer.type)
      const freeListQuery = offerQueries.list({ category: 'free' })
      const byMerchantQuery = offerQueries.byMerchant(slug)

      if (
        !isConnectionOnline() &&
        (queryClient.getQueryData(merchantQuery.queryKey) === undefined ||
          queryClient.getQueryData(isFree ? freeListQuery.queryKey : byMerchantQuery.queryKey) === undefined)
      ) {
        throw new OfflineDataUnavailableError()
      }

      await Promise.all([
        queryClient.ensureQueryData(merchantQuery),
        isFree ? queryClient.ensureQueryData(freeListQuery) : queryClient.ensureQueryData(byMerchantQuery),
      ])

      const headline = formatHeadline({
        value: {
          amount: offer.value.amount,
          currency: offer.value.currency,
          kind: offer.value.kind,
          durationDays: offer.value.duration_days,
          label: offer.value.label,
        },
        conditions: {
          minOrder: offer.conditions.min_order,
          customerType: offer.conditions.customer_type,
          stackableWith: offer.conditions.stackable_with,
          platform: offer.conditions.platform,
          categoriesInclude: offer.conditions.categories_include,
          categoriesExclude: offer.conditions.categories_exclude,
          requirements: offer.conditions.requirements,
        },
      })

      const title = isFreeOffer(offer.type)
        ? `${offer.merchant.name}: ${headline} — ${offer.title} | Рабочий код`
        : `${headline} в ${offer.merchant.name}${offer.code ? ` (${offer.code})` : ''} | Рабочий код`

      const description =
        offer.description_short ?? `${offer.title} в ${offer.merchant.name}: условия применения, проверка и отзывы.`

      return { now: Date.now(), title, description }
    } catch (error) {
      if (isNotFound(error)) throw notFound()
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }, { name: 'description', content: loaderData.description }] : [],
  }),
  pendingComponent: OfferPageSkeleton,
  component: OfferRoute,
})

function OfferRoute() {
  const { slug, offerId } = Route.useParams()
  const { now } = Route.useLoaderData()
  return <OfferPage key={`${slug}:${offerId}`} offerId={offerId} merchantSlug={slug} now={new Date(now)} />
}
