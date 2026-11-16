import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

// SSR loaders fetch from the server, which the browser service worker cannot see (ADR 0001).
// Dynamic import keeps MSW out of production bundles.
if (import.meta.env.VITE_API_MOCKS === 'on') {
  const { startServerMocks } = await import('./integrations/mocks/node.ts')
  startServerMocks()
}

export default createServerEntry({
  fetch(request, opts) {
    return handler.fetch(request, opts)
  },
})
