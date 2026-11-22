import type { Page } from 'playwright'

/**
 * Screens `pnpm verify:ui` renders on both sides (base and current code).
 * A new page or a new interactive state (drawer, sheet, toast) gets a scenario here in the same change.
 */
export interface Scenario {
  name: string
  path: string
  /** Limit to some viewports, e.g. a mobile-only drawer. */
  viewports?: ViewportName[]
  /** Real user input that brings the page into the state under test. */
  steps?: (page: Page) => Promise<void>
}

export type ViewportName = 'mobile' | 'desktop'

export const viewports: Record<ViewportName, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
}

export const themes = ['light', 'dark'] as const

export const scenarios: Scenario[] = [
  { name: 'home', path: '/' },
  { name: 'merchant', path: '/m/samokat' },
  { name: 'offer', path: '/m/samokat/o/o1' },
  { name: 'submit', path: '/submit' },
  { name: 'verification', path: '/about/verification' },
  { name: 'not-found', path: '/m/unknown-shop' },
  {
    name: 'menu-open',
    path: '/m/samokat',
    viewports: ['mobile'],
    steps: async (page) => {
      await page.getByRole('button', { name: 'Меню' }).click()
      await page.getByRole('dialog').waitFor()
    },
  },
]
