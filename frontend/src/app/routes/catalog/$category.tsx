import { createFileRoute, notFound } from '@tanstack/react-router'

import { resolveCatalogBranch } from '@/modules/catalog/index.ts'
import { merchantQueries } from '@/modules/merchant/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerFiltersSearch, offerQueries } from '@/modules/offer/index.ts'
import { CatalogPage, CatalogPageSkeleton } from '@/pages/catalog.tsx'

export const Route = createFileRoute('/catalog/$category')({
  validateSearch: offerFiltersSearch,
  loader: async ({ context: { queryClient }, params: { category } }) => {
    const branch = resolveCatalogBranch(category)
    if (!branch || branch.isFree) throw notFound()

    const merchantsQuery = merchantQueries.list(branch.slug === 'all' ? undefined : { category: branch.slug })
    const offersQuery = offerQueries.list(branch.slug === 'all' ? undefined : { category: branch.slug })
    if (
      !isConnectionOnline() &&
      (queryClient.getQueryData(merchantsQuery.queryKey) === undefined ||
        queryClient.getQueryData(offersQuery.queryKey) === undefined)
    ) {
      throw new OfflineDataUnavailableError()
    }
    await Promise.all([queryClient.ensureQueryData(merchantsQuery), queryClient.ensureQueryData(offersQuery)])
    return { title: branch.title, description: branch.description, now: Date.now() }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — каталог промокодов | Рабочий код` },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
  pendingComponent: CatalogPageSkeleton,
  component: CatalogCategoryRoute,
})

function CatalogCategoryRoute() {
  const { category } = Route.useParams()
  const { now } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <CatalogPage
      key={category}
      branchSlug={category}
      now={new Date(now)}
      filters={search}
      onFiltersChange={(next) => navigate({ search: next, replace: true, resetScroll: false })}
    />
  )
}
