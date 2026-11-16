import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import { Check } from '../Icon/icons.ts'
import styles from './StepList.module.css'

export type StepState = 'done' | 'current' | 'upcoming'

export interface StepListItem {
  title: string
  /** Shown as a 240 px column on desktop only (DESIGN_SPEC 3.33). */
  description?: string
  state?: StepState
  /** Square glyph; without it the step number is shown instead. */
  icon?: IconGlyph
}

export interface StepListProps {
  steps: StepListItem[]
  /** Accessible name for the list, e.g. «Как применить код». */
  label?: string
  className?: string
}

/** DESIGN_SPEC 3.33: timeline with 28 px squares, highlight connector and per-step done/current/upcoming. */
export function StepList({ steps, label, className }: StepListProps) {
  return (
    <ol className={[styles.root, className].filter(Boolean).join(' ')} aria-label={label}>
      {steps.map((step, index) => {
        const state = step.state ?? 'upcoming'
        return (
          <li key={step.title} className={styles.item} data-state={state}>
            <span className={styles.marker} aria-hidden="true">
              {step.icon ? (
                <Icon icon={step.icon} size={16} />
              ) : (
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              )}
              {state === 'done' && (
                <span className={styles.doneBadge}>
                  <Icon icon={Check} size={12} />
                </span>
              )}
            </span>
            <span className={`text-title ${styles.title}`}>{step.title}</span>
            {step.description && <span className={styles.description}>{step.description}</span>}
          </li>
        )
      })}
    </ol>
  )
}
