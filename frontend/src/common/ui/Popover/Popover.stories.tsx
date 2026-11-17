import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from '../Button/Button.tsx'
import { Popover } from './Popover.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Popover',
  component: Popover,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    trigger: (
      <Button variant="secondary" size="sm">
        Реклама
      </Button>
    ),
    label: 'Реклама',
    children: (
      <p>Реклама. ООО «Самокат», ИНН 0000000000. erid: 2VtzqvXYZ12. Мы получаем комиссию, если вы купите по ссылке.</p>
    ),
  },
})

export const Default = meta.story({})

export const Opened = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Реклама' }))
    await expect(canvas.getByRole('dialog')).toBeVisible()
    await expect(canvas.getByText(/комиссию/)).toBeVisible()
  },
})

export const WithLink = meta.story({
  args: {
    side: 'top',
    align: 'end',
    children: (
      <>
        <p>Шанс считается по отзывам за 7 дней, способу и свежести проверки.</p>
        <a href="#how-we-check">Как мы проверяем →</a>
      </>
    ),
  },
})

export const TriggerPinned = meta.story({
  args: { trigger: <Button onClick={fn()}>Что это?</Button>, label: 'Пояснение' },
})
