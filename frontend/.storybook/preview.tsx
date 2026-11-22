import '../src/app/styles/tokens.css'
import '../src/app/styles/global.css'

import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import addonMsw from 'msw-storybook-addon'

import { auditPage, type Rule } from '../scripts/verify/audit.ts'

// Fixed clock: «2 ч назад» and deadlines render the same in every run.
export const STORY_NOW = new Date('2026-11-16T12:00:00+03:00')

/**
 * Component-level runtime invariants checked after every story renders.
 * `page-overflow-x` belongs to full-page viewports in `pnpm verify:ui` (desktop stories such as
 * `AppShell` render 1440 px containers inside Vitest's narrower iframe).
 * Colour tokens are checked statically by `pnpm lint:tokens` (including stories).
 */
const STORY_RULES = ['icon-off-center', 'text-clipped', 'broken-image'] as const satisfies readonly Rule[]

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
  // Overlays render through portals outside the story root, so audit the whole preview document.
  afterEach: async () => {
    // Fonts settle metrics; two frames let the story's final layout and transitions apply.
    await document.fonts.ready
    const { promise, resolve } = Promise.withResolvers<void>()
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    await promise
    const { violations } = auditPage(document.body, { only: [...STORY_RULES] })
    if (violations.length > 0) {
      const details = violations.map((violation) => `[${violation.rule}] ${violation.key} — ${violation.message}`)
      throw new Error(`Нарушены визуальные инварианты сторис (${violations.length}):\n${details.join('\n')}`)
    }
  },
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
