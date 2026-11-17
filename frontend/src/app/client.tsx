import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

// Dynamic import keeps MSW out of production bundles.
if (import.meta.env.VITE_API_MOCKS === 'on') {
  const { startBrowserMocks } = await import('./integrations/mocks/browser.ts')
  await startBrowserMocks()
}

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
