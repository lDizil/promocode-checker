import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from '../Button/Button.tsx'
import { EmptyState } from './EmptyState.tsx'
import { ErrorState } from './ErrorState.tsx'

const meta = preview.meta({
  title: 'UI/EmptyState',
  component: EmptyState,
  args: {
    illustration: 'empty-cart' as const,
    title: 'Проверенных кодов сейчас нет',
    description: 'Последний рабочий код был 28.10.2026. Знаете рабочий код — пришлите, проверим',
  },
})

export const MerchantEmpty = meta.story({
  args: { actions: <Button external>Прислать код</Button> },
})

export const FilteredEmpty = meta.story({
  args: {
    title: 'Под эти фильтры ничего нет',
    description: undefined,
    actions: <Button variant="secondary">Сбросить фильтры</Button>,
  },
})

export const LongText = meta.story({
  args: {
    title: 'Очень длинный заголовок пустого состояния, который должен переноситься на несколько строк',
    description:
      'Описание тоже длинное: проверяем, что текст ограничен по ширине и не растягивается на весь экран на desktop.',
  },
})

export const Error = meta.story({
  render: () => <ErrorState onRetry={fn()} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
  },
})

export const ServerError = meta.story({
  render: () => <ErrorState headingLevel={1} description="У нас что-то сломалось. Уже чиним" onRetry={fn()} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Не удалось загрузить')
  },
})
