import { createFileRoute, notFound } from '@tanstack/react-router'

import { isNotFound } from '@/common/http.ts'
import { merchantQueries } from '@/modules/merchant/index.ts'
import { offerFiltersSearch, offerQueries } from '@/modules/offer/index.ts'
import { MerchantPage, MerchantPageSkeleton } from '@/pages/merchant.tsx'

export const Route = createFileRoute('/m/$slug/')({
  validateSearch: offerFiltersSearch,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    try {
      const [merchant] = await Promise.all([
        queryClient.ensureQueryData(merchantQueries.detail(slug)),
        queryClient.ensureQueryData(offerQueries.byMerchant(slug)),
      ])
      // Server and client share one clock, so «2 ч назад» does not mismatch on hydration.
      return { name: merchant.name, now: Date.now() }
    } catch (error) {
      if (isNotFound(error)) throw notFound()
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Промокоды ${loaderData.name} — проверенные сегодня | Рабочий код` },
          {
            name: 'description',
            content: `Рабочие промокоды и акции ${loaderData.name} с условиями и датой проверки.`,
          },
        ]
      : [],
  }),
  pendingComponent: MerchantPageSkeleton,
  component: MerchantRoute,
})

function MerchantRoute() {
  const { slug } = Route.useParams()
  const { now } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <MerchantPage
      slug={slug}
      now={new Date(now)}
      filters={search}
      onFiltersChange={(next) => navigate({ search: next, replace: true, resetScroll: false })}
    />
  )
}
