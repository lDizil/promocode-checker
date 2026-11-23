import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { searchHandlers } from '../api/search.mocks.ts'
import { RECENT_SEARCHES_KEY } from '../hooks/useRecentSearches.ts'
import { SearchAutocomplete } from './SearchAutocomplete.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=20-24579'

const meta = preview.meta({
  title: 'Search/SearchAutocomplete',
  component: SearchAutocomplete,
  parameters: { design: { type: 'figma', url: FIGMA } },
  render: (args) => (
    <div style={{ maxWidth: 480, minHeight: 320 }}>
      <SearchAutocomplete {...args} />
    </div>
  ),
  args: {
    variant: 'boxed' as const,
    size: 'md' as const,
    onNavigate: fn(),
  },
})

export const Results = meta.story({
  beforeEach({ msw }) {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    msw.use(...searchHandlers)
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'сам')
    await expect(await canvas.findByRole('option', { name: /Самокат/ })).toBeVisible()
    await expect(await canvas.findByText('4 проверенных оффера')).toBeVisible()
    await expect(await canvas.findByRole('option', { name: /Самолёт: билеты/ })).toBeVisible()
    await expect(await canvas.findByRole('option', { name: /Искать «сам» во всех офферах/ })).toBeVisible()
  },
})

export const TypoEmptyState = meta.story({
  beforeEach({ msw }) {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    msw.use(...searchHandlers)
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'ламаода')
    await expect(await canvas.findByText('Ничего не нашли')).toBeVisible()
    await expect(await canvas.findByRole('link', { name: 'Ламода' })).toBeVisible()
    await expect(await canvas.findByRole('link', { name: /Прислать код/ })).toBeVisible()
  },
})

export const RecentSearches = meta.story({
  beforeEach({ msw }) {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Самокат', 'Ozon']))
    msw.use(...searchHandlers)
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await expect(await canvas.findByText('Вы искали')).toBeVisible()
    await expect(await canvas.findByRole('link', { name: 'Самокат' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Удалить запрос Самокат' }))
    await expect(canvas.queryByRole('link', { name: 'Самокат' })).not.toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'Ozon' })).toBeVisible()
  },
})

export const BareTopbar = meta.story({
  args: { variant: 'bare' as const, size: 'md' as const },
  beforeEach({ msw }) {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    msw.use(...searchHandlers)
  },
})
