import { http, HttpResponse } from 'msw'

import type { MerchantDto } from './merchant.dto.ts'

const HOUR = 60 * 60 * 1000

/** Merchants from DESIGN_SPEC 2.1 used by the P0 screens. */
export function merchantFixtures(now: Date): Record<string, MerchantDto> {
  const updated = new Date(now.getTime() - 2 * HOUR).toISOString()
  return {
    samokat: {
      slug: 'samokat',
      name: 'Самокат',
      logo_url: null,
      site_url: 'https://samokat.ru/',
      category: 'Еда и продукты',
      updated_at: updated,
      how_to_apply: [
        'Соберите корзину в приложении',
        'На экране оплаты нажмите «Промокод»',
        'Вставьте код — скидка покажется в итоговой сумме',
      ],
      faq: [
        { question: 'Можно ли применить два промокода?', answer: 'Нет, в Самокате один код на заказ.' },
        { question: 'Работают ли коды на сайте?', answer: 'Большинство кодов работает только в приложении.' },
        {
          question: 'Почему код не сработал?',
          answer: 'Чаще всего не хватает суммы заказа или код только для новых клиентов.',
        },
      ],
      last_working_code_at: null,
    },
    lamoda: {
      slug: 'lamoda',
      name: 'Ламода',
      logo_url: null,
      site_url: 'https://www.lamoda.ru/',
      category: 'Одежда',
      updated_at: updated,
      how_to_apply: [],
      faq: [],
      last_working_code_at: '2026-10-28T12:00:00+03:00',
    },
  }
}

export const merchantHandlers = [
  http.get('*/api/merchants/:slug', ({ params }) => {
    const merchant = merchantFixtures(new Date())[String(params['slug'])]
    return merchant ? HttpResponse.json(merchant) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]
