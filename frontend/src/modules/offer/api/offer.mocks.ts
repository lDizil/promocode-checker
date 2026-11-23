import type { Faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

import type { OfferDto } from './offer.dto.ts'

const MIN = 60 * 1000
const HOUR = 60 * MIN
const ago = (now: Date, ms: number) => new Date(now.getTime() - ms).toISOString()

const SAMOKAT = { slug: 'samokat', name: 'Самокат', logo_url: '/brands/samokat.svg' }
const YANDEX_EDA = { slug: 'yandex-eda', name: 'Яндекс Еда', logo_url: '/brands/yandex-eda.svg' }
const OZON = { slug: 'ozon', name: 'Ozon', logo_url: '/brands/ozon.svg' }
const WILDBERRIES = { slug: 'wildberries', name: 'Wildberries', logo_url: '/brands/wildberries.svg' }
const LITRES = { slug: 'litres', name: 'Литрес', logo_url: '/brands/litres.svg' }
const YANDEX_CLOUD = { slug: 'yandex-cloud', name: 'Yandex Cloud', logo_url: '/brands/yandex-cloud.svg' }
const GITHUB = { slug: 'github', name: 'GitHub Student Pack', logo_url: '/brands/github.svg' }
const PEREKRESTOK = { slug: 'perekrestok', name: 'Перекрёсток', logo_url: null }
const CLOUDFLARE = { slug: 'cloudflare', name: 'Cloudflare', logo_url: null }
const KUPER = { slug: 'kuper', name: 'Купер', logo_url: null }
const MEGAMARKET = { slug: 'megamarket', name: 'Мегамаркет', logo_url: null }
const TIMEWEB = { slug: 'timeweb-cloud', name: 'Timeweb Cloud', logo_url: null }
const AWS = { slug: 'aws', name: 'AWS', logo_url: null }
const GIGACHAT = { slug: 'gigachat', name: 'GigaChat API', logo_url: null }
const OPENAI = { slug: 'openai', name: 'OpenAI API', logo_url: null }
const YANDEX_TRAVEL = { slug: 'yandex-travel', name: 'Яндекс Путешествия', logo_url: null }

const base = (now: Date): Omit<OfferDto, 'id' | 'title' | 'code' | 'value'> => ({
  type: 'promo_code',
  category_slug: 'food',
  merchant: SAMOKAT,
  description_short: null,
  mechanic_text: null,
  conditions: {
    min_order: null,
    categories_include: [],
    categories_exclude: [],
    customer_type: 'all',
    stackable_with: [],
    platform: 'both',
    region_allow: [],
    region_deny: [],
    requirements: [],
  },
  availability: null,
  starts_at: null,
  expires_at: null,
  ended_at: null,
  after_end: null,
  gotchas: [],
  eligibility: null,
  how_to_get: [],
  fail_reasons: [],
  history: [],
  changed_note: null,
  audience: ['individual'],
  source: { kind: 'partner_api', name: 'Admitad', url: null },
  target_url: 'https://samokat.ru/',
  ad_marking: null,
  verification: { last_checked_at: ago(now, 2 * HOUR), method: 'api', score: 80, success_7d: 10, fail_7d: 2 },
  lifecycle: 'active',
})

const value = (
  amount: number,
  kind: OfferDto['value']['kind'] = 'fixed',
  label: string | null = null,
  currency: string | null = kind === 'percent' || kind === 'quota' ? null : 'RUB',
  duration_days: number | null = null,
) => ({
  amount,
  currency,
  kind,
  duration_days,
  label,
})

/** Offers O1–O5 from DESIGN_SPEC 2.2, relative to `now` so «2 ч назад» stays true. */
export function samokatOffers(now: Date): OfferDto[] {
  const b = base(now)
  return [
    {
      ...b,
      id: 'o1',
      title: 'Скидка на первый заказ',
      code: 'SAMOKAT300',
      value: value(300),
      conditions: { ...b.conditions, min_order: 1500, customer_type: 'new', platform: 'app' },
      expires_at: '2026-11-30T23:59:59+03:00',
      ad_marking: { advertiser: 'ООО «Самокат»', inn: '0000000000', erid: '2VtzqvXYZ12' },
      verification: { last_checked_at: ago(now, 2 * HOUR), method: 'api', score: 86, success_7d: 41, fail_7d: 6 },
      fail_reasons: [
        { reason: 'только первый заказ', count: 4 },
        { reason: 'сумма меньше 1\u00a0500\u00a0₽', count: 2 },
      ],
      history: [
        {
          date: '2026-11-01T10:00:00+03:00',
          title: '01.11 — появился',
          description: 'Прислала партнёрская сеть Admitad',
          state: 'done',
        },
        {
          date: '2026-11-05T12:00:00+03:00',
          title: '05.11 — мин. сумма изменилась с 1\u00a0000 до 1\u00a0500\u00a0₽',
          description: 'Магазин обновил условия акции',
          state: 'done',
        },
        {
          date: '2026-11-11T14:20:00+03:00',
          title: '11.11 — проверен',
          description: 'Сработал у 41 из 47 за 7 дней',
          state: 'current',
        },
      ],
    },
    {
      ...b,
      id: 'o2',
      title: 'Скидка на готовую еду',
      code: 'VKUSNO15',
      value: value(15, 'percent'),
      conditions: { ...b.conditions, min_order: 2000, categories_include: ['Готовая еда'] },
      expires_at: '2026-11-20T23:59:59+03:00',
      source: { kind: 'user_submission', name: null, url: null },
      verification: { last_checked_at: ago(now, 26 * HOUR), method: 'crowd', score: 58, success_7d: 7, fail_7d: 5 },
    },
    {
      ...b,
      id: 'o3',
      type: 'sale',
      title: 'Молочные продукты по вторникам',
      code: null,
      value: value(0, 'fixed', '2 по цене 1'),
      expires_at: '2026-12-31T23:59:59+03:00',
      source: { kind: 'official_page', name: null, url: 'https://samokat.ru/promo' },
      verification: { last_checked_at: ago(now, 5 * HOUR), method: 'manual', score: 74, success_7d: 12, fail_7d: 3 },
    },
    {
      ...b,
      id: 'o4',
      title: 'Скидка на большой заказ',
      code: 'SAMO500',
      value: value(500),
      conditions: { ...b.conditions, min_order: 3000 },
      source: { kind: 'user_submission', name: null, url: null },
      verification: { last_checked_at: ago(now, 72 * HOUR), method: 'crowd', score: 22, success_7d: 3, fail_7d: 11 },
    },
    {
      ...b,
      id: 'o5',
      title: 'Осенняя скидка',
      code: 'AUTUMN200',
      value: value(200),
      ended_at: '2026-11-01T00:00:00+03:00',
      verification: { last_checked_at: null, method: null, score: null, success_7d: 0, fail_7d: 0 },
      lifecycle: 'ended',
    },
  ]
}

export function allMockOffers(now: Date): OfferDto[] {
  const b = base(now)
  const samokat = samokatOffers(now)
  return [
    ...samokat,
    {
      ...b,
      id: 'o6',
      category_slug: 'marketplaces',
      merchant: OZON,
      title: 'Скидка на электронику',
      code: 'OZON1000',
      value: value(1000),
      conditions: {
        ...b.conditions,
        min_order: 5000,
        categories_include: ['Электроника'],
        stackable_with: [],
      },
      gotchas: ['Один код на заказ'],
      expires_at: '2026-11-15T23:59:59+03:00',
      target_url: 'https://www.ozon.ru/',
      ad_marking: { advertiser: 'ООО «Интернет Решения»', inn: '7704217370', erid: '2VtzqwOZON6' },
      verification: { last_checked_at: ago(now, 40 * MIN), method: 'api', score: 79, success_7d: 22, fail_7d: 5 },
    },
    {
      ...b,
      id: 'o7',
      category_slug: 'food',
      merchant: YANDEX_EDA,
      title: 'Скидка на первый заказ в ресторанах',
      code: 'EDA25',
      value: value(25, 'percent', '−25% до 500\u00a0₽'),
      conditions: { ...b.conditions, customer_type: 'new', platform: 'both' },
      target_url: 'https://eda.yandex.ru/',
      ad_marking: { advertiser: 'ООО «Яндекс.Еда»', inn: '9705114405', erid: '2VtzqxEDA25' },
      verification: { last_checked_at: ago(now, 1 * HOUR), method: 'api', score: 81, success_7d: 18, fail_7d: 4 },
    },
    {
      ...b,
      id: 'f1',
      type: 'free_credit',
      category_slug: 'free/cloud',
      merchant: YANDEX_CLOUD,
      title: 'стартовый грант',
      description_short: 'Резиденты РФ могут оформить грант. Нужен новый платёжный аккаунт и карта РФ',
      mechanic_text: 'Грант начислят после привязки платёжного аккаунта',
      code: null,
      value: value(4000, 'credit', '≥\u00a04\u00a0000\u00a0₽ на 60 дней', 'RUB', 60),
      conditions: {
        ...b.conditions,
        requirements: ['card', 'phone'],
      },
      availability: { status: 'yes', reason: null },
      after_end: 'После 60 дней — платно',
      gotchas: [
        'Только новый платёжный аккаунт: если аккаунт уже был, грант не начислится',
        'Не тратится на GPU и Marketplace',
      ],
      eligibility: {
        region: 'Только резиденты РФ',
        account_type: 'Физлица и юрлица',
        account_rule: 'Только новый платёжный аккаунт',
        duration: '60 дней',
        requirements_note: 'Карту нужно привязать при создании платёжного аккаунта, позже грант не начислится',
      },
      how_to_get: [
        { title: 'Создайте платёжный аккаунт', description: 'Нужна карта РФ' },
        { title: 'Подтвердите телефон', description: 'Придёт SMS' },
        { title: 'Активируйте грант', description: 'В разделе «Биллинг» нажмите «Получить грант»' },
      ],
      source: {
        kind: 'official_page',
        name: 'официальная документация',
        url: 'https://yandex.cloud/docs/billing/concepts/bonus-account',
      },
      target_url: 'https://yandex.cloud/',
      verification: {
        last_checked_at: '2026-11-11T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 14,
        fail_7d: 2,
      },
    },
    {
      ...b,
      id: 'f4',
      type: 'student',
      category_slug: 'free/students',
      merchant: GITHUB,
      title: 'GitHub Student Developer Pack',
      description_short: 'Бесплатный доступ к инструментам разработки, доменам и облачным квотам для студентов',
      mechanic_text: 'Доступ откроется после подтверждения статуса',
      code: null,
      value: value(100, 'quota', '80+ офферов на 2 года', null, 730),
      conditions: { ...b.conditions, requirements: ['student_status'] },
      availability: { status: 'yes', reason: null },
      after_end: 'Через 2 года доступ закончится',
      gotchas: ['У партнёров свои условия активации'],
      eligibility: {
        region: 'Доступен из РФ с действующим студенческим',
        account_type: 'Студенты и школьники',
        account_rule: 'Подтверждение статуса каждые 2 года',
        duration: '2 года',
        requirements_note: 'Подойдёт студенческий билет, справка из вуза или учебная почта',
      },
      how_to_get: [
        { title: 'Откройте GitHub Education', description: 'Войдите в свой аккаунт GitHub' },
        { title: 'Загрузите подтверждение учёбы', description: 'Фото студенческого или учебная почта' },
        { title: 'Дождитесь одобрения', description: 'Обычно проверяют до 7 дней' },
      ],
      audience: ['student'],
      source: { kind: 'official_page', name: 'GitHub Education', url: 'https://education.github.com/pack' },
      target_url: 'https://education.github.com/pack',
      verification: {
        last_checked_at: '2026-11-05T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 9,
        fail_7d: 1,
      },
    },
    {
      ...b,
      id: 'f2',
      type: 'free_tier',
      category_slug: 'free/hosting',
      merchant: CLOUDFLARE,
      title: 'Тариф Free',
      description_short: 'Бесплатный DNS, CDN и edge-функции Workers с дневным лимитом запросов',
      mechanic_text: 'Тариф Free включается при регистрации',
      code: null,
      value: value(0, 'quota', 'DNS, CDN, Workers 100\u00a0000 запросов в день'),
      conditions: { ...b.conditions, requirements: [] },
      availability: { status: 'partial', reason: 'сайт за Cloudflare может замедляться у пользователей из РФ' },
      after_end: 'Бесплатно бессрочно',
      gotchas: ['Лимит 10 мс CPU на запрос', 'Нужен email для регистрации'],
      eligibility: {
        region: 'Работает, возможны ограничения у посетителей из РФ',
        account_type: 'Физлица и юрлица',
        account_rule: 'Привязка карты не требуется',
        duration: 'Бессрочно',
        requirements_note: 'Для базового CDN и DNS достаточно подтверждённой почты',
      },
      how_to_get: [
        { title: 'Создайте аккаунт Cloudflare', description: 'Достаточно электронной почты' },
        { title: 'Добавьте домен и переведите NS-записи', description: 'Выберите план Free за $0' },
      ],
      audience: ['individual', 'business'],
      source: { kind: 'official_page', name: 'Cloudflare Pricing', url: 'https://www.cloudflare.com/plans/' },
      target_url: 'https://www.cloudflare.com/',
      verification: {
        last_checked_at: '2026-10-29T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 5,
        fail_7d: 2,
      },
    },
    {
      ...b,
      id: 'f5',
      type: 'free_tier',
      category_slug: 'free/ai',
      merchant: GIGACHAT,
      title: 'Бесплатный пакет для разработчиков',
      description_short: 'Стартовый пакет токенов для интеграции моделей GigaChat по REST API',
      mechanic_text: 'Токены начисляются сразу после выпуска API-ключа',
      code: null,
      value: value(1000, 'quota', '1 млн токенов на старт'),
      conditions: { ...b.conditions, requirements: ['phone'] },
      availability: { status: 'yes', reason: null },
      after_end: 'После расхода пакета — оплата по тарифам API',
      gotchas: ['Часть моделей ограничена лимитом запросов в минуту'],
      eligibility: {
        region: 'Доступно из РФ',
        account_type: 'Физлица и юрлица',
        account_rule: 'Вход по Сбер ID или номеру телефона РФ',
        duration: '12 месяцев',
        requirements_note: 'Банковская карта для тестового пакета не нужна',
      },
      how_to_get: [
        { title: 'Авторизуйтесь в Studio', description: 'Нужен номер телефона РФ' },
        { title: 'Создайте проект GigaChat API', description: 'Скопируйте Client Secret и получите токен' },
      ],
      audience: ['individual', 'business'],
      source: {
        kind: 'official_page',
        name: 'документация GigaChat',
        url: 'https://developers.sber.ru/portal/products/gigachat-api',
      },
      target_url: 'https://developers.sber.ru/portal/products/gigachat-api',
      verification: {
        last_checked_at: '2026-11-14T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 11,
        fail_7d: 1,
      },
    },
    {
      ...b,
      id: 'f6',
      type: 'free_credit',
      category_slug: 'free/ai',
      merchant: OPENAI,
      title: 'Кредиты OpenAI API',
      description_short: 'Стартовый баланс для новых API-аккаунтов вне санкционных ограничений',
      mechanic_text: 'Нужна привязка зарубежной карты и подтверждение телефона',
      code: null,
      value: value(10, 'credit', 'до $10 новым разработчикам', 'USD', 90),
      conditions: { ...b.conditions, requirements: ['foreign_card', 'phone'] },
      availability: { status: 'no', reason: 'доступ по API из РФ заблокирован, нужна зарубежная карта' },
      after_end: 'Неиспользованные кредиты сгорают через 3 месяца',
      gotchas: ['Требуется зарубежный номер для первичной проверки'],
      audience: ['individual', 'business'],
      source: { kind: 'official_page', name: 'OpenAI Platform', url: 'https://platform.openai.com/' },
      target_url: 'https://platform.openai.com/',
      verification: {
        last_checked_at: '2026-11-10T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 0,
        fail_7d: 4,
      },
    },
    {
      ...b,
      id: 'f3',
      type: 'free_credit',
      category_slug: 'free/cloud',
      merchant: AWS,
      title: 'AWS Free Tier и кредиты',
      description_short: 'Бесплатный лимит сервисов EC2, S3 и кредит на первые 6 месяцев',
      mechanic_text: 'Оформляется при регистрации нового аккаунта AWS',
      code: null,
      value: value(200, 'credit', 'до $200 на 6 месяцев', 'USD', 180),
      conditions: { ...b.conditions, requirements: ['foreign_card', 'phone'] },
      availability: { status: 'no', reason: 'регистрация из РФ закрыта с 03.2022' },
      after_end: 'Аккаунт переходит на стандартную оплату',
      gotchas: ['Только избранные сервисы в рамках Free Tier'],
      audience: ['individual', 'business'],
      source: { kind: 'official_page', name: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' },
      target_url: 'https://aws.amazon.com/free/',
      verification: {
        last_checked_at: '2026-11-08T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 0,
        fail_7d: 5,
      },
    },
    {
      ...b,
      id: 'f7',
      type: 'free_credit',
      category_slug: 'free/cloud',
      merchant: TIMEWEB,
      title: 'Бонус на первый облачный сервер',
      description_short: 'Тестовый баланс на аренду облачных серверов и баз данных',
      mechanic_text: 'Бонус начисляется после первого пополнения аккаунта',
      code: null,
      value: value(2000, 'credit', '2\u00a0000\u00a0₽ на первый сервер', 'RUB', 30),
      conditions: { ...b.conditions, requirements: ['card', 'phone'] },
      availability: { status: 'yes', reason: null },
      after_end: 'После расхода бонуса списывается с баланса',
      gotchas: ['Нужен новый аккаунт без предыдущих серверов'],
      changed_note: 'Условия изменились 05.11.2026: было 5\u00a0000\u00a0₽, стало 2\u00a0000\u00a0₽',
      lifecycle: 'changed',
      audience: ['individual', 'business'],
      source: { kind: 'official_page', name: 'Timeweb Cloud', url: 'https://timeweb.cloud/' },
      target_url: 'https://timeweb.cloud/',
      verification: {
        last_checked_at: '2026-11-12T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 7,
        fail_7d: 1,
      },
    },
    {
      ...b,
      id: 'f8',
      type: 'trial',
      category_slug: 'free/cloud',
      merchant: TIMEWEB,
      title: 'Осенний грант на Kubernetes',
      code: null,
      value: value(5000, 'credit', '5\u00a0000\u00a0₽ на кластер', 'RUB', 30),
      availability: { status: 'yes', reason: null },
      ended_at: '2026-10-15T00:00:00+03:00',
      lifecycle: 'ended',
      source: { kind: 'official_page', name: 'Timeweb Cloud', url: 'https://timeweb.cloud/' },
      target_url: 'https://timeweb.cloud/',
      verification: {
        last_checked_at: '2026-10-15T12:00:00+03:00',
        method: 'manual',
        score: null,
        success_7d: 0,
        fail_7d: 0,
      },
    },
    {
      ...b,
      id: 'o8',
      category_slug: 'marketplaces',
      merchant: OZON,
      title: 'Кешбэк баллами на товары для дома',
      type: 'cashback',
      mechanic_text: 'Баллы начисляются через 14 дней после получения заказа',
      code: null,
      value: value(10, 'percent'),
      conditions: { ...b.conditions, min_order: 2500 },
      target_url: 'https://www.ozon.ru/',
      verification: { last_checked_at: ago(now, 4 * HOUR), method: 'api', score: 76, success_7d: 15, fail_7d: 3 },
    },
    {
      ...b,
      id: 'o9',
      category_slug: 'marketplaces',
      merchant: WILDBERRIES,
      title: 'Скидка на одежду осенней коллекции',
      type: 'sale',
      mechanic_text: 'Скидка видна сразу в карточке товара и корзине',
      code: null,
      value: value(20, 'percent'),
      conditions: { ...b.conditions, categories_include: ['Одежда'] },
      target_url: 'https://www.wildberries.ru/',
      verification: { last_checked_at: ago(now, 6 * HOUR), method: 'manual', score: 71, success_7d: 8, fail_7d: 2 },
    },
    {
      ...b,
      id: 'o10',
      category_slug: 'subscriptions',
      merchant: LITRES,
      title: 'Книга в подарок и скидка на каталог',
      code: 'READ20',
      value: value(20, 'percent'),
      conditions: { ...b.conditions, customer_type: 'all' },
      target_url: 'https://www.litres.ru/',
      verification: { last_checked_at: ago(now, 3 * HOUR), method: 'api', score: 83, success_7d: 19, fail_7d: 2 },
    },
    {
      ...b,
      id: 'o11',
      category_slug: 'food',
      merchant: PEREKRESTOK,
      title: 'Скидка на первую доставку продуктов',
      code: 'PEREK400',
      value: value(400),
      conditions: { ...b.conditions, min_order: 2000, customer_type: 'new' },
      target_url: 'https://www.perekrestok.ru/',
      verification: { last_checked_at: ago(now, 5 * HOUR), method: 'api', score: 82, success_7d: 16, fail_7d: 3 },
    },
    {
      ...b,
      id: 'o12',
      category_slug: 'food',
      merchant: KUPER,
      title: 'Скидка на заказ из гипермаркетов',
      code: 'KUPER500',
      value: value(500),
      conditions: { ...b.conditions, min_order: 2500, customer_type: 'new' },
      target_url: 'https://kuper.ru/',
      verification: { last_checked_at: ago(now, 7 * HOUR), method: 'api', score: 77, success_7d: 13, fail_7d: 4 },
    },
    {
      ...b,
      id: 'o13',
      category_slug: 'marketplaces',
      merchant: MEGAMARKET,
      title: 'Скидка на первый крупный заказ',
      code: 'MEGA1000',
      value: value(1000),
      conditions: { ...b.conditions, min_order: 5000, customer_type: 'new' },
      target_url: 'https://megamarket.ru/',
      verification: { last_checked_at: ago(now, 3 * HOUR), method: 'api', score: 73, success_7d: 11, fail_7d: 4 },
    },
    {
      ...b,
      id: 'o14',
      category_slug: 'travel',
      merchant: YANDEX_TRAVEL,
      title: 'Скидка на бронирование отелей',
      code: 'TRIP10',
      value: value(10, 'percent', '−10% до 2\u00a0000\u00a0₽'),
      conditions: { ...b.conditions, min_order: 7000 },
      target_url: 'https://travel.yandex.ru/',
      verification: { last_checked_at: ago(now, 4 * HOUR), method: 'api', score: 78, success_7d: 9, fail_7d: 2 },
    },
  ]
}

/** Random but seedable offer; pass a faker seeded per story so screenshots stay stable. */
export function makeOfferDto(faker: Faker, now: Date, overrides: Partial<OfferDto> = {}): OfferDto {
  const success = faker.number.int({ min: 0, max: 60 })
  const fail = faker.number.int({ min: 0, max: 20 })
  return {
    ...base(now),
    id: faker.string.alphanumeric(8),
    title: faker.commerce.productName(),
    code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    value: value(faker.number.int({ min: 1, max: 20 }) * 100),
    verification: {
      last_checked_at: ago(now, faker.number.int({ min: 1, max: 240 }) * 60_000),
      method: faker.helpers.arrayElement(['api', 'crowd', 'manual']),
      score: faker.number.int({ min: 0, max: 100 }),
      success_7d: success,
      fail_7d: fail,
    },
    ...overrides,
  }
}

const OFFER_ID_ALIASES: Record<string, string> = {
  'yandex-cloud-grant': 'f1',
  'github-student-pack': 'f4',
  'cloudflare-free': 'f2',
  'gigachat-api': 'f5',
  'openai-api': 'f6',
  'aws-free': 'f3',
  samokat300: 'o1',
}

export function findMockOfferById(offers: readonly OfferDto[], id: string): OfferDto | undefined {
  const normalized = OFFER_ID_ALIASES[id] ?? id
  return offers.find((item) => item.id === normalized)
}

export const offerHandlers = [
  http.get('*/api/offers/recent', () => {
    const all = allMockOffers(new Date())
    const byId = (id: string) => all.find((item) => item.id === id)!
    return HttpResponse.json({
      stats: { verified_today: 1240, merchants_count: 312 },
      just_now: [byId('o6')],
      earlier_today: [byId('o1'), byId('o3'), byId('f1')],
    })
  }),
  http.get('*/api/offers', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const kind = url.searchParams.get('kind')
    const q = url.searchParams.get('q')?.trim().toLowerCase()
    let items = allMockOffers(new Date())

    if (category && category !== 'all') {
      items = items.filter((item) => item.category_slug === category || item.category_slug.startsWith(`${category}/`))
    }
    if (kind === 'free') {
      items = items.filter((item) => item.category_slug.startsWith('free'))
    } else if (kind) {
      items = items.filter((item) => item.type === kind)
    }
    if (q) {
      items = items.filter(
        (item) =>
          item.merchant.name.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.code?.toLowerCase().includes(q) ?? false) ||
          (item.value.label?.toLowerCase().includes(q) ?? false),
      )
    }
    return HttpResponse.json({ items, total: items.length })
  }),
  http.get('*/api/merchants/:slug/offers', ({ params }) => {
    const slug = String(params['slug'])
    const items = allMockOffers(new Date()).filter((item) => item.merchant.slug === slug)
    return HttpResponse.json({ items, total: items.length })
  }),
  http.get('*/api/offers/:id', ({ params }) => {
    const offer = findMockOfferById(allMockOffers(new Date()), String(params['id']))
    return offer ? HttpResponse.json(offer) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]
