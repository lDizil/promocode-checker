import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { Accordion } from './Accordion.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Accordion',
  component: Accordion,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    items: [
      {
        question: 'Можно ли применить два промокода?',
        answer: 'Нет, в Самокате один код на заказ.',
      },
      {
        question: 'Что делать, если код не сработал?',
        answer:
          'Проверьте минимальную сумму, срок действия и условия для новых клиентов. Если всё подходит — оставьте отзыв, мы перепроверим.',
      },
      {
        question: 'Сколько действует код?',
        answer: 'Срок указан на странице оффера, обычно до конца месяца.',
      },
    ],
  },
})

export const Default = meta.story({
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Можно ли применить два промокода?' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(await canvas.findByText('Нет, в Самокате один код на заказ.')).toBeVisible()
  },
})

export const FirstOpen = meta.story({
  args: { defaultOpen: ['Можно ли применить два промокода?'] },
})

export const Multiple = meta.story({
  args: { multiple: true, defaultOpen: ['Можно ли применить два промокода?'] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Сколько действует код?' }))
    await expect(canvas.getByText('Нет, в Самокате один код на заказ.')).toBeVisible()
    await expect(canvas.getByText('Срок указан на странице оффера, обычно до конца месяца.')).toBeVisible()
  },
})

export const LongAnswer = meta.story({
  args: {
    items: [
      {
        question: 'Почему один и тот же код срабатывает у одних и не срабатывает у других?',
        answer:
          'Шанс зависит от условий магазина: первый ли это заказ, сумма корзины, регион и способ оплаты. Мы показываем шанс и все ограничения до перехода в магазин, а после неудачной попытки просим указать причину — так следующие пользователи видят более точную оценку.',
      },
    ],
    defaultOpen: ['Почему один и тот же код срабатывает у одних и не срабатывает у других?'],
  },
})
