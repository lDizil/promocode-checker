import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { Info } from '../Icon/icons.ts'
import { GotchaNote } from './GotchaNote.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/GotchaNote',
  component: GotchaNote,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { children: 'Грант не тратится на GPU и Marketplace.' },
})

export const Warning = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Есть подвох')).toBeVisible()
  },
})

export const Neutral = meta.story({
  args: {
    tone: 'neutral',
    children: 'Сейчас у Самоката нет надёжных кодов. Ниже — коды с жалобами, пробуйте на свой риск',
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Есть подвох')).not.toBeInTheDocument()
  },
})

export const NeutralWithTitle = meta.story({
  args: { tone: 'neutral', title: 'Оффер завершён', showTitle: true, children: 'Этот оффер завершён 01.11.2026.' },
})

export const CustomIcon = meta.story({
  args: { tone: 'neutral', icon: Info, children: 'Проверка занимает до 24 часов.' },
})

export const LongText = meta.story({
  args: {
    children:
      'Грант не тратится на GPU и Marketplace, но заканчивается через 30 дней после активации и не суммируется с другими приветственными бонусами.',
  },
})
