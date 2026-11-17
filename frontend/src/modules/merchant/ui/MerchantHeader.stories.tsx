import { expect } from 'storybook/test'

import preview, { STORY_NOW } from '#.storybook/preview'

import { merchantFixtures } from '../api/merchant.mocks.ts'
import { toMerchant, type Merchant } from '../model/merchant.ts'
import { MerchantHeader } from './MerchantHeader.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%237A57AE'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23FFBA1B'/%3E%3C/svg%3E"

const fixtures = merchantFixtures(STORY_NOW)
const samokat = toMerchant(fixtures['samokat']!)
const lamoda = toMerchant(fixtures['lamoda']!)

const longName: Merchant = { ...samokat, name: 'GitHub Student Developer Pack для студентов', logoUrl: null }

const meta = preview.meta({
  title: 'Merchant/MerchantHeader',
  component: MerchantHeader,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { merchant: samokat, activeCount: 4, updatedAgo: '2 ч назад' },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Промокоды Самокат')
    await expect(canvas.getByText('4 активных оффера · обновлено 2 ч назад')).toBeVisible()
    const site = canvas.getByRole('link', { name: 'Сайт магазина' })
    await expect(site).toHaveAttribute('href', 'https://samokat.ru/')
    await expect(site).toHaveAttribute('target', '_blank')
    await expect(site).toHaveAttribute('rel', 'noopener noreferrer')
  },
})

export const WithLogo = meta.story({
  args: { merchant: { ...samokat, logoUrl: LOGO } },
})

export const LongName = meta.story({
  args: { merchant: longName, activeCount: 1, updatedAgo: '5 ч назад' },
})

export const SingleOffer = meta.story({
  args: { activeCount: 1, updatedAgo: 'вчера' },
})

export const NoOffers = meta.story({
  args: { merchant: lamoda, activeCount: 0, updatedAgo: '3 дня назад' },
})
