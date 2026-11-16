import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { KeyValueGrid } from './KeyValueGrid.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/KeyValueGrid',
  component: KeyValueGrid,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    items: [
      { label: 'Для кого', value: 'Только первый заказ', warning: true },
      { label: 'Минимальная сумма', value: '1 500 ₽', warning: true },
      { label: 'Суммируется', value: 'Не суммируется с баллами', warning: true },
      { label: 'Где применить', value: 'Только в мобильном приложении' },
      { label: 'Регион', value: 'Вся Россия' },
      { label: 'Срок', value: 'До 30.11.2026' },
    ],
  },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Для кого')).toBeVisible()
    await expect(canvas.getByText('Только первый заказ')).toBeVisible()
  },
})

export const Source = meta.story({
  args: {
    items: [
      { label: 'Источник', value: 'Партнёрская сеть Admitad' },
      { label: 'Рекламодатель', value: 'ООО „Самокат“, ИНН 0000000000' },
      { label: 'erid', value: '2VtzqvXYZ12' },
    ],
  },
})

export const NoWarnings = meta.story({
  args: {
    items: [
      { label: 'Как проверяем', value: 'Статус у партнёра, отзывы, дата' },
      { label: 'Что не делаем', value: 'Не прячем коды за кнопками' },
    ],
  },
})

export const LongValues = meta.story({
  args: {
    items: [
      {
        label: 'Для кого',
        value: 'Только для новых клиентов, которые ещё не оформляли заказ в приложении и не получали скидку',
        warning: true,
      },
      {
        label: 'Где применить',
        value:
          'В мобильном приложении Самоката на экране оплаты, только при заказе от 1 500 ₽ и не чаще одного раза в месяц',
      },
    ],
  },
})
