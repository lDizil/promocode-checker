import { createFileRoute } from '@tanstack/react-router'

import { merchantQueries } from '@/modules/merchant/index.ts'
import { isConnectionOnline, OfflineDataUnavailableError } from '@/modules/network/index.ts'
import { offerQueries } from '@/modules/offer/index.ts'
import { HomePage, HomePageSkeleton } from '@/pages/home.tsx'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const merchantsQuery = merchantQueries.list({ featured: true })
    const recentQuery = offerQueries.recent()
    if (
      !isConnectionOnline() &&
      (queryClient.getQueryData(merchantsQuery.queryKey) === undefined ||
        queryClient.getQueryData(recentQuery.queryKey) === undefined)
    ) {
      throw new OfflineDataUnavailableError()
    }
    await Promise.all([queryClient.ensureQueryData(merchantsQuery), queryClient.ensureQueryData(recentQuery)])
    return { now: Date.now() }
  },
  pendingComponent: HomePageSkeleton,
  component: HomeRoute,
})

function HomeRoute() {
  const { now } = Route.useLoaderData()
  return <HomePage now={new Date(now)} />
}
