import preview from '#.storybook/preview'

import { SourceLink } from './SourceLink.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/SourceLink',
  component: SourceLink,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { source: { kind: 'partner_api' as const, name: 'Admitad', url: null } },
})

export const PartnerNetwork = meta.story({})

export const OfficialPage = meta.story({
  args: { source: { kind: 'official_page', name: null, url: 'https://samokat.ru/promo' } },
})

export const PartnerChannel = meta.story({
  args: {
    source: { kind: 'partner_channel', name: '@promo_samokat', url: 'https://t.me/promo_samokat' },
  },
})

export const UserSubmission = meta.story({
  args: { source: { kind: 'user_submission', name: null, url: null } },
})

export const AllKinds = meta.story({
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <SourceLink source={{ kind: 'partner_api', name: 'Admitad', url: null }} />
      <SourceLink source={{ kind: 'official_page', name: null, url: 'https://samokat.ru/promo' }} />
      <SourceLink source={{ kind: 'partner_channel', name: '@promo_samokat', url: 'https://t.me/promo_samokat' }} />
      <SourceLink source={{ kind: 'user_submission', name: null, url: null }} />
    </div>
  ),
})
