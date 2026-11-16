import preview from '#.storybook/preview'

import { ScoreBar } from './ScoreBar.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/ScoreBar',
  component: ScoreBar,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { variant: 'progress' as const, level: 'high' as const, score: 86, success7d: 41, fail7d: 6 },
})

export const ProgressHigh = meta.story({})

export const ProgressMedium = meta.story({ args: { level: 'medium', score: 58, success7d: 7, fail7d: 5 } })

export const ProgressLow = meta.story({ args: { level: 'low', score: 22, success7d: 3, fail7d: 11 } })

export const ProgressWithoutReviews = meta.story({ args: { level: 'unknown', score: null, success7d: 0, fail7d: 0 } })

export const SegmentedHigh = meta.story({ args: { variant: 'segmented' } })

export const SegmentedMedium = meta.story({ args: { variant: 'segmented', level: 'medium', score: 58 } })

export const SegmentedUnknown = meta.story({ args: { variant: 'segmented', level: 'unknown', score: null } })

export const AllVariants = meta.story({
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <ScoreBar variant="progress" level="high" score={86} success7d={41} fail7d={6} />
      <ScoreBar variant="progress" level="low" score={22} success7d={3} fail7d={11} />
      <ScoreBar variant="segmented" level="high" score={86} />
      <ScoreBar variant="segmented" level="medium" score={58} />
    </div>
  ),
})
