import { Icon, type IconGlyph } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'
import { Popover } from '@/common/ui/Popover/index.ts'

import type { ScoreLevel } from '../model/offer.ts'
import styles from './ScoreBadge.module.css'

const PRESENTATION: Record<ScoreLevel, { icon: IconGlyph; text: (score: number | null) => string }> = {
  high: { icon: icons.ShieldCheck, text: (score) => (score === null ? 'Высокий шанс' : `${score} · Высокий шанс`) },
  medium: { icon: icons.Shield, text: (score) => (score === null ? 'Средний шанс' : `${score} · Средний шанс`) },
  low: { icon: icons.CircleHelp, text: () => 'Под вопросом' },
  unknown: { icon: icons.CircleHelp, text: () => 'Ещё не проверен' },
  ended: { icon: icons.CircleX, text: () => 'Завершён' },
}

export interface ScoreBadgeProps {
  level: ScoreLevel
  /** 0–100; shown next to the level name for high and medium. */
  score?: number | null
  /** «Как мы проверяем» target; P-11 by default. */
  detailsHref?: string
}

/** DESIGN_SPEC 3.13: chance to work, with an explainer on tap. */
export function ScoreBadge({ level, score = null, detailsHref = '/about/verification#score' }: ScoreBadgeProps) {
  const { icon, text } = PRESENTATION[level]
  return (
    <Popover
      label="Шанс сработать"
      presentation="auto"
      align="start"
      trigger={
        <button type="button" className={styles.badge} data-level={level}>
          <Icon icon={icon} size={16} />
          {text(score)}
        </button>
      }
    >
      <p>Шанс считается по отзывам за 7 дней, способу и свежести проверки.</p>
      <a href={detailsHref}>Как мы проверяем →</a>
    </Popover>
  )
}
