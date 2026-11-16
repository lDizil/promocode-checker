import { faker } from '@faker-js/faker'
import { expect } from 'storybook/test'

import preview, { STORY_NOW } from '#.storybook/preview'

import { makeOfferDto, samokatOffers } from '../api/offer.mocks.ts'
import { buildConditions, type Condition } from '../model/conditions.ts'
import { toOffer } from '../model/offer.ts'
import { ConditionList } from './ConditionList.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const offers = samokatOffers(STORY_NOW).map(toOffer)
const collapsed = buildConditions(offers[0]!, STORY_NOW)

faker.seed(7)
const manyConditions = buildConditions(
  toOffer(
    makeOfferDto(faker, STORY_NOW, {
      conditions: {
        min_order: 2500,
        categories_include: [],
        categories_exclude: [],
        customer_type: 'new',
        stackable_with: [],
        platform: 'app',
        region_allow: [],
        region_deny: [],
        requirements: ['card', 'phone', 'kyc'],
      },
      gotchas: [
        'Не суммируется с баллами',
        'Не действует на алкоголь',
        'Только для Москвы',
        'Один код на аккаунт',
        'Не действует в праздники',
        'Только на первый заказ в приложении',
        'Не суммируется с подпиской',
        'Не действует на товары по акции',
      ],
      expires_at: '2026-11-18T23:59:59+03:00',
    }),
  ),
  STORY_NOW,
)

const kinds: Condition[] = [
  { kind: 'restriction', text: 'От 1 500 ₽', urgent: false },
  { kind: 'deadline', text: 'Осталось 2 дн.', urgent: true },
  { kind: 'neutral', text: 'Только в приложении', urgent: false },
]

const meta = preview.meta({
  title: 'Offer/ConditionList',
  component: ConditionList,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { conditions: collapsed },
})

export const Collapsed = meta.story({})

export const ManyConditions = meta.story({ args: { conditions: manyConditions } })

export const AllKinds = meta.story({ args: { conditions: kinds } })

export const Empty = meta.story({
  args: { conditions: [] },
  render: (args) => (
    <div>
      <ConditionList {...args} />
      <span className="text-caption">Список условий пуст и не занимает места</span>
    </div>
  ),
})

export const Expand = meta.story({
  args: { conditions: manyConditions },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: /^\+\d+ услови/ })
    await userEvent.click(toggle)
    await expect(canvas.getByText('Не действует на товары по акции')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Свернуть' })).toBeVisible()
  },
})
