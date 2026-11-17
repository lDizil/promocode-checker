import '../src/app/styles/tokens.css'
import '../src/app/styles/global.css'

import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import addonMsw from 'msw-storybook-addon'

// Fixed clock: «2 ч назад» and deadlines render the same in every run.
export const STORY_NOW = new Date('2026-11-16T12:00:00+03:00')

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonMsw()],
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
      // DESIGN_SPEC 1.10: inactive parts of ended offers use `text-disabled` below 4.5:1 on purpose.
      config: { rules: [{ id: 'color-contrast', selector: '*:not([data-ended] *)' }] },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Тема',
      toolbar: { title: 'Тема', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals }) => {
      document.documentElement.dataset['theme'] = globals['theme'] === 'dark' ? 'dark' : 'light'
      return <Story />
    },
    // Components with <Link> need a router; each story renders as the root route of a memory router.
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      const router = createRouter({
        history: createMemoryHistory({ initialEntries: ['/'] }),
        routeTree: createRootRoute({ component: Story }),
      })
      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      )
    },
  ],
})
