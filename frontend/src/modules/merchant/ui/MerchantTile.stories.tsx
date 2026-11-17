import { expect } from 'storybook/test'

import preview, { STORY_NOW } from '#.storybook/preview'

import { merchantFixtures } from '../api/merchant.mocks.ts'
import { toMerchant, type Merchant } from '../model/merchant.ts'
import { MerchantTile } from './MerchantTile.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%237A57AE'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23FFBA1B'/%3E%3C/svg%3E"

const fixtures = merchantFixtures(STORY_NOW)
const samokat = toMerchant(fixtures['samokat']!)
const lamoda = toMerchant(fixtures['lamoda']!)

const longName: Merchant = { ...samokat, name: 'GitHub Student Developer Pack для студентов', logoUrl: null }

const meta = preview.meta({
  title: 'Merchant/MerchantTile',
  component: MerchantTile,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { merchant: samokat, offersCount: 4 },
})

export const Default = meta.story()

export const WithLogo = meta.story({
  args: { merchant: { ...samokat, logoUrl: LOGO } },
})

export const LongName = meta.story({
  args: { merchant: longName },
})

export const OneOffer = meta.story({
  args: { offersCount: 1 },
})

export const NoOffers = meta.story({
  args: { merchant: lamoda, offersCount: 0 },
})

export const Link = meta.story({
  args: { render: <a href="/m/samokat" /> },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /Самокат/ })
    await expect(link).toHaveAttribute('href', '/m/samokat')
    await expect(link).toHaveAccessibleName(/4 оффера/)
    await expect(link).toHaveAttribute('data-interactive')
  },
})

export const Grid = meta.story({
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      <MerchantTile {...args} />
      <MerchantTile {...args} merchant={longName} offersCount={1} />
      <MerchantTile {...args} merchant={lamoda} offersCount={0} />
    </div>
  ),
})
