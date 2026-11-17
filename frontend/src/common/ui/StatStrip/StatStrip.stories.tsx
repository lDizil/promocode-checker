import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { StatStrip } from './StatStrip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/StatStrip',
  component: StatStrip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    label: 'Сводка по магазину',
    cells: [
      { label: 'Активных офферов', value: 4 },
      { label: 'Лучшая выгода', value: '−500 ₽' },
      { label: 'Лучший шанс', value: 86 },
    ],
  },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Лучшая выгода')).toBeVisible()
    await expect(canvas.getByText('−500 ₽')).toBeVisible()
  },
})

export const TwoCells = meta.story({
  args: {
    cells: [
      { label: 'Проверено сегодня', value: '1 240' },
      { label: 'Средний шанс', value: '78' },
    ],
  },
})

export const OfferDetails = meta.story({
  args: {
    label: 'Условия оффера',
    cells: [
      { label: 'Выгода', value: '−300 ₽' },
      { label: 'Мин. заказ', value: '1 500 ₽' },
      { label: 'Сработал', value: '41 из 47' },
      { label: 'Действует до', value: '30.11' },
    ],
  },
})

export const LongLabels = meta.story({
  args: {
    cells: [
      { label: 'Активных офферов, проверенных вручную', value: 12 },
      { label: 'Лучшая выгода на первый заказ', value: '−1 500 ₽' },
      { label: 'Средний шанс сработать за неделю', value: '64' },
    ],
  },
})

export const EmptyValue = meta.story({
  args: {
    cells: [
      { label: 'Активных офферов', value: 0 },
      { label: 'Нет данных', value: '—' },
    ],
  },
})
