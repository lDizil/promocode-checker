import { Switch, SwitchThumb } from '@ui-sdk/react/switch'
import { useId, useRef } from 'react'

import { SegmentedControl, type SegmentedControlOption } from '../SegmentedControl/SegmentedControl.tsx'
import styles from './ThemeToggle.module.css'

export type ThemeValue = 'system' | 'light' | 'dark'

const SEGMENTED_OPTIONS: readonly (SegmentedControlOption & { value: ThemeValue })[] = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]

const LONG_PRESS_MS = 600
/** A click right after a long press must not also toggle light/dark. */
const LONG_PRESS_BLOCK_MS = 1000

const SWITCH_LABELS: Record<ThemeValue, string> = {
  system: 'Тема: как в системе',
  light: 'Тема: светлая',
  dark: 'Тема: тёмная',
}

export interface ThemeToggleProps {
  value: ThemeValue
  onChange: (value: ThemeValue) => void
  /**
   * `switch` is the desktop control from DESIGN_SPEC 3.40; `segmented` is the
   * mobile MenuDrawer control (3.2, 3.45).
   */
  variant?: 'switch' | 'segmented'
  className?: string
}

export function ThemeToggle({ value, onChange, variant = 'switch', className }: ThemeToggleProps) {
  if (variant === 'segmented') {
    return (
      <SegmentedControl
        className={className}
        label="Тема"
        value={value}
        options={SEGMENTED_OPTIONS}
        onChange={(next) => {
          const option = SEGMENTED_OPTIONS.find((candidate) => candidate.value === next)
          if (option) onChange(option.value)
        }}
      />
    )
  }

  return <ThemeSwitch value={value} onChange={onChange} className={className} />
}

function ThemeSwitch({ value, onChange, className }: Pick<ThemeToggleProps, 'value' | 'onChange' | 'className'>) {
  const hintId = useId()
  const pressStartedAt = useRef<number | null>(null)
  const lastLongPressAt = useRef(Number.NEGATIVE_INFINITY)

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-state={value}>
      <span className={styles.label} data-active={value === 'light' ? '' : undefined}>
        Светлая
      </span>
      <Switch
        className={styles.switch}
        checked={value === 'dark'}
        aria-label={SWITCH_LABELS[value]}
        aria-describedby={hintId}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          pressStartedAt.current = performance.now()
        }}
        onPointerUp={() => {
          const startedAt = pressStartedAt.current
          pressStartedAt.current = null
          if (startedAt === null || performance.now() - startedAt < LONG_PRESS_MS) return
          lastLongPressAt.current = performance.now()
          onChange('system')
        }}
        onPointerLeave={() => {
          pressStartedAt.current = null
        }}
        onPointerCancel={() => {
          pressStartedAt.current = null
        }}
        onClickCapture={(event) => {
          if (performance.now() - lastLongPressAt.current < LONG_PRESS_BLOCK_MS) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          lastLongPressAt.current = performance.now()
          onChange('system')
        }}
        onKeyDown={(event) => {
          if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
            event.preventDefault()
            lastLongPressAt.current = performance.now()
            onChange('system')
          }
        }}
        onCheckedChange={(checked) => {
          if (performance.now() - lastLongPressAt.current < LONG_PRESS_BLOCK_MS) return
          onChange(checked ? 'dark' : 'light')
        }}
      >
        <SwitchThumb className={styles.thumb} />
      </Switch>
      <span className={styles.label} data-active={value === 'dark' ? '' : undefined}>
        Тёмная
      </span>
      <span className="visually-hidden" id={hintId}>
        Долгое нажатие или Shift+F10 — как в системе
      </span>
    </div>
  )
}
