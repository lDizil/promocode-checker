import preview from '#.storybook/preview'

import { AvailabilityBadge } from './AvailabilityBadge.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/AvailabilityBadge',
  component: AvailabilityBadge,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { availability: 'yes' as const, reason: null },
})

export const Available = meta.story({})

export const Partial = meta.story({
  args: {
    availability: 'partial',
    reason: 'сайт за Cloudflare может замедляться у пользователей из РФ',
  },
})

export const Unavailable = meta.story({
  args: { availability: 'no', reason: 'регистрация закрыта с 03.2022' },
})

export const AllStates = meta.story({
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AvailabilityBadge availability="yes" />
      <AvailabilityBadge availability="partial" reason="сайт за Cloudflare может замедляться у пользователей из РФ" />
      <AvailabilityBadge availability="no" reason="регистрация закрыта с 03.2022" />
    </div>
  ),
})
