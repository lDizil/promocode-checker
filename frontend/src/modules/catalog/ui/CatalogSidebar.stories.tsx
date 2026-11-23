import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { CatalogSidebar } from './CatalogSidebar.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=134-82873'

const meta = preview.meta({
  title: 'Catalog/CatalogSidebar',
  component: CatalogSidebar,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { activeSlug: 'all' },
})

export const AllSelected = meta.story({
  play: async ({ canvas }) => {
    const active = canvas.getByRole('link', { name: 'Все' })
    await expect(active).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Облака и VPS' })).toBeVisible()
  },
})

export const CategorySelected = meta.story({
  args: { activeSlug: 'food' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Еда и продукты' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Все' })).not.toHaveAttribute('aria-current')
  },
})

export const FreeSelected = meta.story({
  args: { activeSlug: 'free' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Бесплатно' })).toHaveAttribute('aria-current', 'page')
  },
})

export const FreeSubcategory = meta.story({
  args: { activeSlug: 'free/ai' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'ИИ-модели и API' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Бесплатно' })).not.toHaveAttribute('aria-current')
  },
})
