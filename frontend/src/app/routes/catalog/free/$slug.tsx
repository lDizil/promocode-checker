import { createFileRoute, notFound } from '@tanstack/react-router'

import { isNotFound } from '@/common/http.ts'
import { isFreeSubcategory, resolveCatalogBranch } from '@/modules/catalog/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerFiltersSearch, offerQueries } from '@/modules/offer/index.ts'
import { CatalogPage, CatalogPageSkeleton } from '@/pages/catalog.tsx'
import { OfferPage, OfferPageSkeleton } from '@/pages/offer.tsx'

export const Route = createFileRoute('/catalog/free/$slug')({
  validateSearch: offerFiltersSearch,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    if (isFreeSubcategory(slug)) {
      const branchSlug = `free/${slug}`
      const branch = resolveCatalogBranch('free', slug)!
      const offersQuery = offerQueries.list({ category: branchSlug })
      if (!isConnectionOnline() && queryClient.getQueryData(offersQuery.queryKey) === undefined) {
        throw new OfflineDataUnavailableError()
      }
      await queryClient.ensureQueryData(offersQuery)
      return {
        kind: 'catalog' as const,
        branchSlug,
        title: branch.title,
        description: branch.description,
        now: Date.now(),
      }
    }

    const detailQuery = offerQueries.detail(slug)
    const freeListQuery = offerQueries.list({ category: 'free' })
    if (
      !isConnectionOnline() &&
      (queryClient.getQueryData(detailQuery.queryKey) === undefined ||
        queryClient.getQueryData(freeListQuery.queryKey) === undefined)
    ) {
      throw new OfflineDataUnavailableError()
    }
    try {
      const [offer] = await Promise.all([
        queryClient.ensureQueryData(detailQuery),
        queryClient.ensureQueryData(freeListQuery),
      ])
      return {
        kind: 'offer' as const,
        title: `${offer.merchant.name} — ${offer.title}`,
        description: offer.description_short ?? '',
        now: Date.now(),
      }
    } catch (err) {
      if (isNotFound(err)) throw notFound()
      throw err
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | Рабочий код` },
          ...(loaderData.description ? [{ name: 'description', content: loaderData.description }] : []),
        ]
      : [],
  }),
  pendingComponent: FreeSlugPending,
  component: FreeSlugRoute,
})

function FreeSlugPending() {
  const { slug } = Route.useParams()
  return isFreeSubcategory(slug) ? <CatalogPageSkeleton /> : <OfferPageSkeleton />
}

function FreeSlugRoute() {
  const { slug } = Route.useParams()
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  if (data.kind === 'catalog') {
    return (
      <CatalogPage
        key={data.branchSlug}
        branchSlug={data.branchSlug}
        now={new Date(data.now)}
        filters={search}
        onFiltersChange={(next) => navigate({ search: next, replace: true, resetScroll: false })}
      />
    )
  }

  return <OfferPage offerId={slug} now={new Date(data.now)} />
}
