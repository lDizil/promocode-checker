import { expect } from 'storybook/test'

import preview, { STORY_NOW } from '#.storybook/preview'

import { merchantFixtures } from '../api/merchant.mocks.ts'
import { toMerchant } from '../model/merchant.ts'
import { MerchantAvatar } from './MerchantAvatar.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%237A57AE'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23FFBA1B'/%3E%3C/svg%3E"

const samokat = toMerchant(merchantFixtures(STORY_NOW)['samokat']!)

const meta = preview.meta({
  title: 'Merchant/MerchantAvatar',
  component: MerchantAvatar,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { name: samokat.name, logoUrl: null },
})

export const Fallback = meta.story()

export const WithLogo = meta.story({
  args: { logoUrl: LOGO },
  play: async ({ canvasElement }) => {
    const logo = canvasElement.querySelector('img')
    await expect(logo).not.toBeNull()
    await expect(logo).toHaveAttribute('src', LOGO)
  },
})

export const LongName = meta.story({
  args: { name: 'GitHub Student Developer Pack для студентов' },
})

export const Sizes = meta.story({
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <MerchantAvatar {...args} size={24} />
      <MerchantAvatar {...args} size={32} />
      <MerchantAvatar {...args} size={48} />
      <MerchantAvatar {...args} size={64} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sizes = [...canvasElement.querySelectorAll('[data-slot="merchant-avatar"]')].map((avatar) =>
      avatar.getAttribute('data-size'),
    )
    await expect(sizes).toEqual(['24', '32', '48', '64'])
  },
})
