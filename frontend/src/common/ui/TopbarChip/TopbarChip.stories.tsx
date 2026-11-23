import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { icons } from '../Icon/index.ts'
import { TopbarChip } from './TopbarChip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=13-248'

const meta = preview.meta({
  title: 'UI/TopbarChip',
  component: TopbarChip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    icon: icons.ShieldCheck,
    children: '1\u00a0240 проверено сегодня',
  },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/1\s*240 проверено сегодня/)).toBeVisible()
  },
})
