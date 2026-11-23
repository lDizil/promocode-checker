import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerFiltersSearch } from '@/modules/offer/index.ts'
import { searchQueries } from '@/modules/search/index.ts'
import { SearchPage, SearchPageSkeleton } from '@/pages/search.tsx'

const searchPageParams = z.object({
  q: z.string().optional().catch(''),
  ...offerFiltersSearch.shape,
})

export const Route = createFileRoute('/search')({
  validateSearch: searchPageParams,
  loaderDeps: ({ search }) => ({ q: (search.q ?? '').trim() }),
  loader: async ({ context: { queryClient }, deps: { q } }) => {
    const queryOptions = searchQueries.results(q)
    if (!isConnectionOnline() && queryClient.getQueryData(queryOptions.queryKey) === undefined) {
      throw new OfflineDataUnavailableError()
    }
    await queryClient.ensureQueryData(queryOptions)
    return { q, now: Date.now() }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.q ? `Результаты по «${loaderData.q}» — Рабочий код` : 'Поиск по каталогу — Рабочий код',
      },
    ],
  }),
  pendingComponent: SearchPageSkeleton,
  component: SearchRoute,
})

function SearchRoute() {
  const { q, now } = Route.useLoaderData()
  const { q: _q, ...filters } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SearchPage
      key={q}
      query={q}
      now={new Date(now)}
      filters={filters}
      onFiltersChange={(next) =>
        navigate({
          search: { ...(q ? { q } : {}), ...next },
          replace: true,
          resetScroll: false,
        })
      }
    />
  )
}
