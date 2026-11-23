import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { merchantQueries } from '@/modules/merchant/index.ts'
import { SubmitPage } from '@/pages/submit.tsx'

export const Route = createFileRoute('/submit')({
  // `/submit?m=samokat` pre-fills the merchant (DESIGN_SPEC 4.9).
  validateSearch: z.object({ m: z.string().optional().catch(undefined) }),
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(merchantQueries.list())
  },
  head: () => ({
    meta: [
      { title: 'Прислать код | Рабочий код' },
      {
        name: 'description',
        content: 'Поделитесь рабочим промокодом или акцией — проверим условия и опубликуем на странице магазина.',
      },
    ],
  }),
  component: SubmitRoute,
})

function SubmitRoute() {
  const { m } = Route.useSearch()
  return <SubmitPage prefillMerchantSlug={m} />
}
