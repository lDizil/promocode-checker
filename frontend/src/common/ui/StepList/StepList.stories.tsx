import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { CreditCard, Gift, Percent, Ticket } from '../Icon/icons.ts'
import { StepList } from './StepList.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/StepList',
  component: StepList,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { label: 'Как применить код' },
})

export const Default = meta.story({
  args: {
    steps: [
      { title: 'Соберите корзину в приложении', state: 'done', icon: Gift },
      { title: 'На экране оплаты нажмите «Промокод»', state: 'current', icon: Ticket },
      { title: 'Вставьте код — скидка покажется в итоговой сумме', state: 'upcoming', icon: Percent },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list', { name: 'Как применить код' })).toBeVisible()
    await expect(canvas.getByText('Соберите корзину в приложении')).toBeVisible()
  },
})

export const WithDescriptions = meta.story({
  args: {
    label: 'Как мы проверяем',
    steps: [
      {
        title: 'Берём коды у партнёрских сетей, с сайтов магазинов и от пользователей',
        description: 'Партнёрские фиды, публичные страницы акций и формы на сайте',
        state: 'done',
      },
      {
        title: 'Проверяем: статус у партнёра, отзывы, дата',
        description: 'Несколько источников на каждый код, чтобы отсеять устаревшие',
        state: 'current',
      },
      {
        title: 'Считаем шанс сработать и показываем все условия',
        description: 'Шанс, ограничения и срок действия видны до перехода в магазин',
        state: 'upcoming',
      },
    ],
  },
})

export const History = meta.story({
  args: {
    steps: [
      { title: '01.11 — появился', state: 'done' },
      { title: '05.11 — мин. сумма изменилась с 1 000 до 1 500 ₽', state: 'done' },
      { title: '11.11 — проверен', state: 'current', icon: CreditCard },
    ],
  },
})

export const AllUpcoming = meta.story({
  args: {
    steps: [
      { title: 'Выберите товар', state: 'upcoming' },
      { title: 'Введите код', state: 'upcoming' },
    ],
  },
})

export const LongTitles = meta.story({
  args: {
    steps: [
      {
        title: 'Соберите корзину в мобильном приложении и убедитесь, что сумма заказа больше 1 500 ₽',
        description: 'Скидка не суммируется с другими акциями и баллами',
        state: 'done',
        icon: Gift,
      },
      {
        title: 'На экране оплаты нажмите «Промокод», вставьте код и проверьте итоговую сумму',
        description: 'Если код не применился, проверьте минимальную сумму и срок действия',
        state: 'current',
        icon: Ticket,
      },
    ],
  },
})
