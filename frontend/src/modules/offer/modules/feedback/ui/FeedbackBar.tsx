import { Button } from '@/common/ui/Button/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'

import styles from './FeedbackBar.module.css'

export type FeedbackBarState = 'idle' | 'sent-success' | 'sent-fail' | 'disabled'

export interface FeedbackBarProps {
  state?: FeedbackBarState
  /** True for 3 s after a «worked» vote: shows «Спасибо!…» before settling (DESIGN_SPEC 3.18). */
  fresh?: boolean
  /** The vote is paused until the connection returns; show the queue line instead of the answers. */
  queued?: boolean
  /** Label of the chosen reason for the `sent-fail` line. */
  reasonLabel?: string | null
  /** A vote is on its way; both answers stay visible but inert. */
  pending?: boolean
  onWorked: () => void
  onFailed: () => void
  /** The «Изменить» action that returns the bar to `idle`. */
  onChange: () => void
  className?: string
}

/** DESIGN_SPEC 3.18: «Сработал?» + Да/Нет, then a thank-you line with «Изменить». */
export function FeedbackBar({
  state = 'idle',
  fresh = false,
  queued = false,
  reasonLabel = null,
  pending = false,
  onWorked,
  onFailed,
  onChange,
  className,
}: FeedbackBarProps) {
  // Ended offers hide the bar entirely (DESIGN_SPEC 3.18 / 3.20).
  if (state === 'disabled') return null

  return (
    <div
      className={[styles.bar, className].filter(Boolean).join(' ')}
      data-state={state}
      data-queued={queued ? '' : undefined}
    >
      {state === 'idle' && queued ? (
        <p className={`${styles.sent} ${styles.queued}`}>
          <span aria-live="polite">Отправим, когда появится связь</span>
          {reasonLabel && (
            <>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <span>Причина: {reasonLabel}</span>
            </>
          )}
        </p>
      ) : state === 'idle' ? (
        <>
          <span className={`${styles.prompt} text-body-sm`}>Сработал?</span>
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" icon={icons.ThumbsUp} disabled={pending} onClick={onWorked}>
              Да
            </Button>
            <Button variant="secondary" size="sm" icon={icons.ThumbsDown} disabled={pending} onClick={onFailed}>
              Нет
            </Button>
          </div>
        </>
      ) : (
        <p className={styles.sent}>
          {state === 'sent-success' && fresh ? (
            <>
              <Icon icon={icons.Check} size={16} className={styles.iconSuccess} />
              <span aria-live="polite">Спасибо! Учли в шансе сработать</span>
            </>
          ) : state === 'sent-success' ? (
            <>
              <span aria-live="polite">Вы отметили: сработал</span>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <Button variant="ghost" size="sm" onClick={onChange}>
                Изменить
              </Button>
            </>
          ) : (
            <>
              <span aria-live="polite">
                {reasonLabel ? `Спасибо, разберёмся. Причина: ${reasonLabel}` : 'Спасибо, разберёмся'}
              </span>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              <Button variant="ghost" size="sm" onClick={onChange}>
                Изменить
              </Button>
            </>
          )}
        </p>
      )}
    </div>
  )
}
