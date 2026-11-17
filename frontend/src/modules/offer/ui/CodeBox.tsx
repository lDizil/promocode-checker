import { Icon } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import styles from './CodeBox.module.css'

export type CodeBoxState = 'default' | 'copied' | 'disabled'

export interface CodeBoxProps {
  code: string
  state?: CodeBoxState
  /** Tap on the whole plate copies the code (DESIGN_SPEC 3.12, C-01). */
  onCopy: () => void
}

/** DESIGN_SPEC 1.8: the code is announced character by character. */
const spaced = (code: string) => [...code].join(' ')

/**
 * The accessible name is built from content, not `aria-label`, so the visible «Копировать» stays part of it
 * (WCAG 2.5.3 label-in-name) while screen readers still get the spelled-out code.
 */
export function CodeBox({ code, state = 'default', onCopy }: CodeBoxProps) {
  return (
    <button type="button" className={styles.root} data-state={state} disabled={state === 'disabled'} onClick={onCopy}>
      <span className="visually-hidden">Промокод {spaced(code)}.</span>
      <span className={[styles.code, 'text-code'].join(' ')} aria-hidden="true">
        {code}
      </span>
      <span className={[styles.action, 'text-caption'].join(' ')}>
        <Icon icon={state === 'copied' ? icons.Check : icons.Copy} size={16} />
        <span className={styles.actionLabel} aria-live="polite">
          {state === 'copied' ? 'Скопировано' : 'Копировать'}
        </span>
        {state === 'disabled' && <span className="visually-hidden">. Оффер завершён</span>}
      </span>
    </button>
  )
}
