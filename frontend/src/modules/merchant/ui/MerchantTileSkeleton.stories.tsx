import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { MerchantTileSkeleton } from './MerchantTileSkeleton.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Merchant/MerchantTileSkeleton',
  component: MerchantTileSkeleton,
  parameters: { design: { type: 'figma', url: FIGMA } },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status')
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expect(status).toHaveAccessibleName('Загрузка магазина')
  },
})

export const Grid = meta.story({
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      <MerchantTileSkeleton />
      <MerchantTileSkeleton />
      <MerchantTileSkeleton />
    </div>
  ),
})
