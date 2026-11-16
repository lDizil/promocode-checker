import { Radio as Primitive, RadioGroup as PrimitiveGroup, RadioIndicator } from '@ui-sdk/react/radio'
import type { ReactNode } from 'react'

import styles from './Radio.module.css'

export interface RadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps {
  options: readonly RadioOption[]
  value: string | null
  onValueChange: (value: string) => void
  /** Accessible name of the group; a Sheet title usually carries the visible context. */
  label?: string
  name?: string
  disabled?: boolean
  className?: string
}

/** DESIGN_SPEC 3.44: 20 px circle, a 6 px `primary` ring when checked, one tab stop per group. */
export function RadioGroup({ options, value, onValueChange, label, name, disabled, className }: RadioGroupProps) {
  return (
    <PrimitiveGroup
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next)
      }}
      aria-label={label}
      name={name}
      disabled={disabled}
      className={[styles.group, className].filter(Boolean).join(' ')}
    >
      {options.map((option) => (
        <label className={styles.option} data-disabled={option.disabled ? '' : undefined} key={option.value}>
          <Primitive className={styles.radio} value={option.value} disabled={option.disabled}>
            <RadioIndicator />
          </Primitive>
          <span className={`${styles.label} text-body`}>{option.label}</span>
        </label>
      ))}
    </PrimitiveGroup>
  )
}
