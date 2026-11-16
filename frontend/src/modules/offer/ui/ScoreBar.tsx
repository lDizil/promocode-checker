import type { ScoreLevel } from '../model/offer.ts'
import styles from './ScoreBar.module.css'

const SEGMENTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export interface ScoreBarProps {
  /** `progress` sits on OfferCard, `segmented` on the offer page (DESIGN_SPEC 3.13). */
  variant?: 'progress' | 'segmented'
  level: ScoreLevel
  score?: number | null
  success7d?: number
  fail7d?: number
}

const clamp = (value: number) => Math.min(10, Math.max(0, value))

export function ScoreBar({ variant = 'progress', level, score = null, success7d = 0, fail7d = 0 }: ScoreBarProps) {
  const total = success7d + fail7d

  if (variant === 'segmented') {
    const filled = score === null ? 0 : clamp(Math.round(score / 10))
    return (
      <div className={styles.segmented} data-level={level}>
        <span className={styles.segmentedLabel}>Шанс сработать</span>
        <span
          className={styles.segmentedRow}
          role="img"
          aria-label={score === null ? 'Шанс сработать: нет данных' : `Шанс сработать: ${score} из 100`}
        >
          <span className={styles.ticks} data-level={level}>
            {SEGMENTS.map((segment) => (
              <span key={segment} className={styles.tick} data-on={segment < filled || undefined} />
            ))}
          </span>
          {score !== null && <span className={`text-h2 ${styles.value}`}>{score}</span>}
        </span>
      </div>
    )
  }

  const filled = clamp(total > 0 ? Math.round((success7d / total) * 10) : score === null ? 0 : Math.round(score / 10))
  return (
    <div
      className={styles.progress}
      role="img"
      aria-label={
        total > 0 ? `Шанс сработать: ${success7d} из ${total} сработали` : `Шанс сработать: ${score ?? 0} из 100`
      }
    >
      <span className={styles.segments} data-level={level}>
        {SEGMENTS.map((segment) => (
          <span key={segment} className={styles.segment} data-on={segment < filled || undefined} />
        ))}
      </span>
      {total > 0 && (
        <span className={styles.caption}>
          {success7d} из {total}
        </span>
      )}
    </div>
  )
}
