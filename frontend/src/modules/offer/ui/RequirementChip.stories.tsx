import preview from '#.storybook/preview'

import { RequirementChip } from './RequirementChip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/RequirementChip',
  component: RequirementChip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { requirement: 'card' as const },
})

export const Card = meta.story({})

export const ForeignCard = meta.story({ args: { requirement: 'foreign_card' } })

export const Phone = meta.story({ args: { requirement: 'phone' } })

export const Kyc = meta.story({ args: { requirement: 'kyc' } })

export const Student = meta.story({ args: { requirement: 'student_status' } })

export const Corporate = meta.story({ args: { requirement: 'corporate_domain' } })

export const NoCard = meta.story({ args: { requirement: 'no_card' } })

export const AllRequirements = meta.story({
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <RequirementChip requirement="card" />
      <RequirementChip requirement="foreign_card" />
      <RequirementChip requirement="phone" />
      <RequirementChip requirement="kyc" />
      <RequirementChip requirement="student_status" />
      <RequirementChip requirement="corporate_domain" />
      <RequirementChip requirement="no_card" />
    </div>
  ),
})
