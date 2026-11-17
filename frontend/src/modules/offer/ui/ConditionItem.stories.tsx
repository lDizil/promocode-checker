import preview from '#.storybook/preview'

import type { Condition, ConditionKind } from '../model/conditions.ts'
import { ConditionItem } from './ConditionItem.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/ConditionItem',
  component: ConditionItem,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { condition: { kind: 'restriction' as const, text: 'Только первый заказ', urgent: false } },
  render: (args) => (
    <ul style={{ display: 'grid', gap: 8 }}>
      <ConditionItem {...args} />
    </ul>
  ),
})

const SAMPLE: Record<ConditionKind, Condition> = {
  restriction: { kind: 'restriction', text: 'От 1 500 ₽', urgent: false },
  deadline: { kind: 'deadline', text: 'До 30.11.2026', urgent: false },
  neutral: { kind: 'neutral', text: 'Только в приложении', urgent: false },
}

export const Restriction = meta.story({})

export const Deadline = meta.story({ args: { condition: SAMPLE.deadline } })

export const DeadlineUrgent = meta.story({
  args: { condition: { kind: 'deadline', text: 'Осталось 2 дн.', urgent: true } },
})

export const Neutral = meta.story({ args: { condition: SAMPLE.neutral } })

export const AllKinds = meta.story({
  render: () => (
    <ul style={{ display: 'grid', gap: 8 }}>
      <ConditionItem condition={SAMPLE.restriction} />
      <ConditionItem condition={SAMPLE.deadline} />
      <ConditionItem condition={{ kind: 'deadline', text: 'Осталось 2 дн.', urgent: true }} />
      <ConditionItem condition={SAMPLE.neutral} />
    </ul>
  ),
})
