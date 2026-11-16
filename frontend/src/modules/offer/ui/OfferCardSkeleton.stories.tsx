import preview from '#.storybook/preview'

import { OfferCardSkeleton } from './OfferCardSkeleton.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/OfferCardSkeleton',
  component: OfferCardSkeleton,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { density: 'full' as const },
})

export const Full = meta.story({})

export const Compact = meta.story({ args: { density: 'compact' } })

export const List = meta.story({
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <OfferCardSkeleton {...args} />
      <OfferCardSkeleton {...args} />
      <OfferCardSkeleton {...args} density="compact" />
    </div>
  ),
})
