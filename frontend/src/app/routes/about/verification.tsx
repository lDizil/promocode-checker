import { createFileRoute } from '@tanstack/react-router'

import { VerificationPage } from '@/pages/verification.tsx'

export const Route = createFileRoute('/about/verification')({
  head: () => ({
    meta: [
      { title: 'Как мы проверяем коды | Рабочий код' },
      {
        name: 'description',
        content:
          'Откуда берём промокоды, как считаем шанс сработать и как устроена маркировка рекламы и партнёрских ссылок.',
      },
    ],
  }),
  component: VerificationPage,
})
