import { setupWorker } from 'msw/browser'

import { handlers } from './handlers.ts'

export async function startBrowserMocks(): Promise<void> {
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass', quiet: true })
}
