import { createFileRoute } from '@tanstack/react-router'

import { resolveCatalogBranch } from '@/modules/catalog/index.ts'
import { merchantQueries } from '@/modules/merchant/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerFiltersSearch, offerQueries } from '@/modules/offer/index.ts'
import { CatalogPage, CatalogPageSkeleton } from '@/pages/catalog.tsx'

export const Route = createFileRoute('/catalog/')({
  validateSearch: offerFiltersSearch,
  loader: async ({ context: { queryClient } }) => {
    const merchantsQuery = merchantQueries.list()
    const offersQuery = offerQueries.list()
    if (
      !isConnectionOnline() &&
      (queryClient.getQueryData(merchantsQuery.queryKey) === undefined ||
        queryClient.getQueryData(offersQuery.queryKey) === undefined)
    ) {
      throw new OfflineDataUnavailableError()
    }
    await Promise.all([queryClient.ensureQueryData(merchantsQuery), queryClient.ensureQueryData(offersQuery)])
    return { now: Date.now() }
  },
  head: () => {
    const branch = resolveCatalogBranch('all')!
    return {
      meta: [
        { title: 'Каталог промокодов и бесплатных офферов | Рабочий код' },
        { name: 'description', content: branch.description },
      ],
    }
  },
  pendingComponent: CatalogPageSkeleton,
  component: CatalogAllRoute,
})

function CatalogAllRoute() {
  const { now } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <CatalogPage
      key="all"
      branchSlug="all"
      now={new Date(now)}
      filters={search}
      onFiltersChange={(next) => navigate({ search: next, replace: true, resetScroll: false })}
    />
  )
}
