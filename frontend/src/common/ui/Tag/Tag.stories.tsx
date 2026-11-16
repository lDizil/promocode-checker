import preview from '#.storybook/preview'

import { Tag } from './Tag.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Tag',
  component: Tag,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { children: 'Партнёр' },
})

export const Partner = meta.story({ args: { tone: 'partner' } })
export const User = meta.story({ args: { tone: 'user', children: 'Пользователь' } })
export const Merchant = meta.story({ args: { tone: 'merchant', children: 'Магазин' } })
export const Success = meta.story({ args: { tone: 'success', children: 'Проверен 2 ч назад' } })
export const Danger = meta.story({ args: { tone: 'danger', children: 'Много жалоб' } })

export const AllTones = meta.story({
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag tone="partner">Партнёр</Tag>
      <Tag tone="user">Пользователь</Tag>
      <Tag tone="merchant">Магазин</Tag>
      <Tag tone="success">Официально</Tag>
      <Tag tone="danger">Много жалоб</Tag>
    </div>
  ),
})

export const LongText = meta.story({ args: { tone: 'merchant', children: 'Официальный сайт магазина' } })
