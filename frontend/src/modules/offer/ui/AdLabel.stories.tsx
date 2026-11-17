import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { AdLabel } from './AdLabel.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const MARKING = { advertiser: 'ООО «Самокат»', inn: '0000000000', erid: '2VtzqvXYZ12' }

const meta = preview.meta({
  title: 'Offer/AdLabel',
  component: AdLabel,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { marking: MARKING },
})

export const Default = meta.story({})

export const Disclosure = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Реклама' }))
    await expect(canvas.getByText(/2VtzqvXYZ12/)).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Подробнее о рекламе' })).toBeVisible()
  },
})

export const CustomDetailsLink = meta.story({ args: { detailsHref: '/about/verification#ads' } })
