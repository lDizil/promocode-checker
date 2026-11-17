import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { OfflineBanner } from './OfflineBanner.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/OfflineBanner',
  component: OfflineBanner,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { since: '14:20' },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Нет соединения. Показываем сохранённые данные от 14:20')
  },
})

export const WithoutTime = meta.story({ args: { since: undefined } })

export const Sticky = meta.story({ args: { sticky: true } })

export const LongMessage = meta.story({
  args: {
    message:
      'Нет соединения. Показываем сохранённые данные от 14:20. Новые отзывы отправим, когда появится связь, коды копировать можно',
  },
})
