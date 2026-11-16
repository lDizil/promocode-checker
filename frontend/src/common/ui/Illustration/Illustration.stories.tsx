import preview from '#.storybook/preview'

import { Illustration, type IllustrationName } from './Illustration.tsx'

const NAMES: IllustrationName[] = ['grocery-bag', 'parcel', 'cloud-coin', 'empty-cart', 'plug']

const meta = preview.meta({
  title: 'UI/Illustration',
  component: Illustration,
  args: { name: 'empty-cart' as const },
})

export const Single = meta.story()

export const All = meta.story({
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'end' }}>
      {NAMES.map((name) => (
        <Illustration key={name} name={name} />
      ))}
    </div>
  ),
})
