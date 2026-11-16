import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { BackLink } from './BackLink.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'
// Navigation would unload the test page; the spy cancels it and only proves the click reaches the link.
const clickSpy = fn((event: React.MouseEvent<HTMLElement>) => event.preventDefault())

const meta = preview.meta({
  title: 'UI/BackLink',
  component: BackLink,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { children: 'Все коды Самоката', href: '/m/samokat' },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Все коды Самоката' })
    await expect(link).toHaveAttribute('href', '/m/samokat')
  },
})

export const RouterLinkRender = meta.story({
  args: { render: <a href="/m/samokat" data-router-link="" />, href: undefined },
})

export const LongLabel = meta.story({
  args: { children: 'Все проверенные промокоды и акции Самоката за ноябрь' },
})

export const Click = meta.story({
  args: { href: '#back', onClick: clickSpy },
  play: async ({ canvas, userEvent }) => {
    clickSpy.mockClear()
    await userEvent.click(canvas.getByRole('link', { name: 'Все коды Самоката' }))
    await expect(clickSpy).toHaveBeenCalledOnce()
  },
})
