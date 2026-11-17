import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { PromoBlock } from './PromoBlock.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/PromoBlock',
  component: PromoBlock,
  parameters: { design: { type: 'figma', url: FIGMA } },
})

export const Submit = meta.story({
  args: { actionHref: '/submit' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: /Прислать код/ })).toHaveAttribute('href', '/submit')
  },
})

export const CustomCopy = meta.story({
  args: {
    title: 'Знаете код для Самоката?',
    description: 'Пришлите — проверим и опубликуем',
    actionLabel: 'Прислать код Самоката',
    actionHref: '/submit?merchant=samokat',
  },
})

export const RouterLinkRender = meta.story({
  args: { actionRender: <a href="/submit?merchant=samokat" data-router-link="" /> },
})

export const InSidebar = meta.story({
  render: () => (
    <div style={{ inlineSize: 192 }}>
      <PromoBlock actionHref="/submit" />
    </div>
  ),
})

export const LongText = meta.story({
  args: {
    title: 'Знаете рабочий код для магазина, которого нет на сайте?',
    description: 'Пришлите его нам — проверим вручную и опубликуем, если он сработает у нескольких пользователей',
    actionLabel: 'Прислать код магазина',
    actionHref: '/submit',
  },
})
