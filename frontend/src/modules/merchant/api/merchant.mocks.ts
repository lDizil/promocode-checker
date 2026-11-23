import { http, HttpResponse } from 'msw'

import type { MerchantDto, MerchantSummaryDto } from './merchant.dto.ts'

const HOUR = 60 * 60 * 1000

interface MerchantSeed {
  dto: MerchantDto
  offerCount: number
  featured: boolean
}

function buildSeeds(now: Date): Record<string, MerchantSeed> {
  const updated = new Date(now.getTime() - 2 * HOUR).toISOString()
  const m = (
    slug: string,
    name: string,
    logo_url: string | null,
    site_url: string,
    category: string,
    category_slug: string,
    offerCount: number,
    featured: boolean,
    extra: Partial<Pick<MerchantDto, 'how_to_apply' | 'faq' | 'last_working_code_at'>> = {},
  ): MerchantSeed => ({
    dto: {
      slug,
      name,
      logo_url,
      site_url,
      category,
      category_slug,
      updated_at: updated,
      how_to_apply: extra.how_to_apply ?? [
        `Выберите подходящий оффер для ${name}`,
        'Скопируйте промокод или перейдите на сайт',
        'Примените условия на этапе оформления',
      ],
      faq: extra.faq ?? [
        { question: 'Как часто обновляются коды?', answer: `Проверяем актуальные предложения ${name} ежедневно.` },
      ],
      last_working_code_at: extra.last_working_code_at ?? null,
    },
    offerCount,
    featured,
  })

  return {
    samokat: m('samokat', 'Самокат', '/brands/samokat.svg', 'https://samokat.ru/', 'Еда и продукты', 'food', 4, true, {
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
    }),
    'yandex-eda': m(
      'yandex-eda',
      'Яндекс Еда',
      '/brands/yandex-eda.svg',
      'https://eda.yandex.ru/',
      'Еда и продукты',
      'food',
      3,
      true,
      {
        how_to_apply: [
          'Добавьте блюда из ресторана или магазина в корзину',
          'Перейдите к оплате и откройте поле «Промокод»',
          'Введите код до нажатия кнопки оплаты',
        ],
      },
    ),
    ozon: m('ozon', 'Ozon', '/brands/ozon.svg', 'https://www.ozon.ru/', 'Маркетплейсы', 'marketplaces', 5, true, {
      how_to_apply: [
        'Положите товары в корзину и перейдите к оформлению',
        'Вставьте кодовое слово в поле «Промокод или сертификат»',
        'Проверьте пересчёт скидки и примените баллы при совместимости',
      ],
      faq: [{ question: 'Суммируется ли код с Ozon Картой?', answer: 'Обычно скидка по карте применяется отдельно.' }],
    }),
    wildberries: m(
      'wildberries',
      'Wildberries',
      '/brands/wildberries.svg',
      'https://www.wildberries.ru/',
      'Маркетплейсы',
      'marketplaces',
      2,
      true,
    ),
    litres: m('litres', 'Литрес', '/brands/litres.svg', 'https://www.litres.ru/', 'Подписки', 'subscriptions', 1, true),
    'yandex-cloud': m(
      'yandex-cloud',
      'Yandex Cloud',
      '/brands/yandex-cloud.svg',
      'https://yandex.cloud/',
      'Бесплатно › Облака и VPS',
      'free/cloud',
      1,
      true,
    ),
    github: m(
      'github',
      'GitHub Student Pack',
      '/brands/github.svg',
      'https://education.github.com/pack',
      'Бесплатно › Студентам',
      'free/students',
      1,
      true,
    ),
    perekrestok: m(
      'perekrestok',
      'Перекрёсток',
      null,
      'https://www.perekrestok.ru/',
      'Еда и продукты',
      'food',
      3,
      true,
    ),
    cloudflare: m(
      'cloudflare',
      'Cloudflare',
      null,
      'https://www.cloudflare.com/',
      'Бесплатно › Хостинг',
      'free/hosting',
      1,
      true,
    ),
    kuper: m('kuper', 'Купер', null, 'https://kuper.ru/', 'Еда и продукты', 'food', 2, true),
    megamarket: m('megamarket', 'Мегамаркет', null, 'https://megamarket.ru/', 'Маркетплейсы', 'marketplaces', 4, true),
    'timeweb-cloud': m(
      'timeweb-cloud',
      'Timeweb Cloud',
      null,
      'https://timeweb.cloud/',
      'Бесплатно › Облака и VPS',
      'free/cloud',
      2,
      true,
    ),
    lamoda: m('lamoda', 'Ламода', '/brands/lamoda.svg', 'https://www.lamoda.ru/', 'Одежда', 'clothing', 0, false, {
      how_to_apply: [],
      faq: [],
      last_working_code_at: '2026-10-28T12:00:00+03:00',
    }),
    aws: m('aws', 'AWS', null, 'https://aws.amazon.com/free/', 'Бесплатно › Облака и VPS', 'free/cloud', 1, false),
    gigachat: m(
      'gigachat',
      'GigaChat API',
      null,
      'https://developers.sber.ru/portal/products/gigachat-api',
      'Бесплатно › ИИ-модели и API',
      'free/ai',
      1,
      false,
    ),
    openai: m(
      'openai',
      'OpenAI API',
      null,
      'https://platform.openai.com/',
      'Бесплатно › ИИ-модели и API',
      'free/ai',
      1,
      false,
    ),
    'yandex-travel': m(
      'yandex-travel',
      'Яндекс Путешествия',
      null,
      'https://travel.yandex.ru/',
      'Путешествия',
      'travel',
      1,
      false,
    ),
  }
}

/** Merchants from DESIGN_SPEC 2.1 used by the P0 and P1 screens. */
export function merchantFixtures(now: Date): Record<string, MerchantDto> {
  const seeds = buildSeeds(now)
  const out: Record<string, MerchantDto> = {}
  for (const [slug, seed] of Object.entries(seeds)) {
    out[slug] = seed.dto
  }
  return out
}

export function merchantSummaries(now: Date): MerchantSummaryDto[] {
  return Object.values(buildSeeds(now)).map(({ dto, offerCount, featured }) => ({
    slug: dto.slug,
    name: dto.name,
    logo_url: dto.logo_url,
    category: dto.category,
    category_slug: dto.category_slug,
    offer_count: offerCount,
    featured,
  }))
}

export const merchantHandlers = [
  http.get('*/api/merchants', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const featured = url.searchParams.get('featured')
    let items = merchantSummaries(new Date())

    if (featured === 'true') {
      items = items.filter((item) => item.featured)
    }
    if (category && category !== 'all') {
      items = items.filter((item) => item.category_slug === category || item.category_slug.startsWith(`${category}/`))
    }

    return HttpResponse.json({ items, total: items.length })
  }),
  http.get('*/api/merchants/:slug', ({ params }) => {
    const merchant = merchantFixtures(new Date())[String(params['slug'])]
    return merchant ? HttpResponse.json(merchant) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]
