import { setupServer } from 'msw/node'

import { handlers } from './handlers.ts'

export function startServerMocks(): void {
  setupServer(...handlers).listen({ onUnhandledFrame: 'bypass' })
}
