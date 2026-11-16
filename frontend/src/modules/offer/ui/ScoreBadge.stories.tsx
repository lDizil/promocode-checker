import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { ScoreBadge } from './ScoreBadge.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/ScoreBadge',
  component: ScoreBadge,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { level: 'high' as const, score: 86 },
})

export const High = meta.story({})

export const Medium = meta.story({ args: { level: 'medium', score: 58 } })

export const Low = meta.story({ args: { level: 'low', score: 22 } })

export const Unknown = meta.story({ args: { level: 'unknown', score: null } })

export const Ended = meta.story({ args: { level: 'ended', score: null } })

export const AllLevels = meta.story({
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <ScoreBadge level="high" score={86} />
      <ScoreBadge level="medium" score={58} />
      <ScoreBadge level="low" score={22} />
      <ScoreBadge level="unknown" />
      <ScoreBadge level="ended" />
    </div>
  ),
})

export const Explainer = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '86 · Высокий шанс' }))
    await expect(canvas.getByText(/Шанс считается/)).toBeVisible()
  },
})
