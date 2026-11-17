import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { Logo } from './Logo.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Logo',
  component: Logo,
  parameters: { design: { type: 'figma', url: FIGMA } },
})

export const Link = meta.story({
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Рабочий код' })
    await expect(link).toHaveAttribute('href', '/')
    await expect(link.querySelector('svg')).toHaveAttribute('viewBox', '0 0 32 32')
  },
})

export const CustomRenderLink = meta.story({
  args: {
    renderLink: ({ className, children }) => (
      <a className={className} href="/about/verification" data-custom-link>
        {children}
      </a>
    ),
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Рабочий код' })
    await expect(link).toHaveAttribute('href', '/about/verification')
    await expect(link.querySelector('svg')).toHaveAttribute('viewBox', '0 0 32 32')
  },
})
