import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { isNotFound } from '@/common/http.ts'

import { routeTree } from './routeTree.gen.ts'

export function getRouter() {
  // One QueryClient per request on the server, one per tab in the browser.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => !isNotFound(error) && failureCount < 2,
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient, theme: 'system' },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
