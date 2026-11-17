import {
  SegmentedControl as Primitive,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/react/segmented-control'

import styles from './SegmentedControl.module.css'

export interface SegmentedControlOption {
  value: string
  label: string
}

export interface SegmentedControlProps {
  value: string
  onChange: (value: string) => void
  options: readonly SegmentedControlOption[]
  /** Accessible name of the radio group. */
  label: string
  className?: string
}

export function SegmentedControl({ value, onChange, options, label, className }: SegmentedControlProps) {
  return (
    <Primitive
      aria-label={label}
      className={[styles.control, className].filter(Boolean).join(' ')}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next)
      }}
    >
      <SegmentedControlIndicator className={styles.indicator} />
      {options.map((option) => (
        <SegmentedControlItem className={styles.item} key={option.value} value={option.value}>
          {option.label}
        </SegmentedControlItem>
      ))}
    </Primitive>
  )
}
