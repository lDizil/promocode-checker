import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { SectionHeader } from './SectionHeader.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/SectionHeader',
  component: SectionHeader,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { title: 'Проверено сегодня' },
})

export const Default = meta.story({})

export const WithAllLink = meta.story({
  args: { title: 'Магазины', action: <a href="/merchants">Все</a> },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Все' })
    await expect(link).toHaveAttribute('href', '/merchants')
  },
})

export const WithExplanationLink = meta.story({
  args: { title: 'Надёжность', action: <a href="/about/verification">Почему такой шанс?</a> },
})

export const HeadingLevel3 = meta.story({
  args: { title: 'Условия', headingLevel: 3, action: <a href="/conditions">Подробнее</a> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('Условия')
  },
})

export const LongTitle = meta.story({
  args: {
    title: 'Другие офферы Самоката, которые сейчас работают',
    action: <a href="/m/samokat">Все офферы</a>,
  },
})
