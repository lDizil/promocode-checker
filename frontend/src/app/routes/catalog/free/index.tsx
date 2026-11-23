import { createFileRoute } from '@tanstack/react-router'

import { resolveCatalogBranch } from '@/modules/catalog/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerFiltersSearch, offerQueries } from '@/modules/offer/index.ts'
import { CatalogPage, CatalogPageSkeleton } from '@/pages/catalog.tsx'

export const Route = createFileRoute('/catalog/free/')({
  validateSearch: offerFiltersSearch,
  loader: async ({ context: { queryClient } }) => {
    const offersQuery = offerQueries.list({ category: 'free' })
    if (!isConnectionOnline() && queryClient.getQueryData(offersQuery.queryKey) === undefined) {
      throw new OfflineDataUnavailableError()
    }
    await queryClient.ensureQueryData(offersQuery)
    return { now: Date.now() }
  },
  head: () => {
    const branch = resolveCatalogBranch('free')!
    return {
      meta: [{ title: `${branch.title} | Рабочий код` }, { name: 'description', content: branch.description }],
    }
  },
  pendingComponent: CatalogPageSkeleton,
  component: CatalogFreeRoute,
})

function CatalogFreeRoute() {
  const { now } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <CatalogPage
      key="free"
      branchSlug="free"
      now={new Date(now)}
      filters={search}
      onFiltersChange={(next) => navigate({ search: next, replace: true, resetScroll: false })}
    />
  )
}
