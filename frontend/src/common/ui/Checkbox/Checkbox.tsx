import { Checkbox as Primitive, CheckboxIndicator } from '@ui-sdk/react/checkbox'
import type { ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { Check } from '../Icon/icons.ts'
import styles from './Checkbox.module.css'

export interface CheckboxProps {
  label: ReactNode
  checked?: boolean | 'indeterminate'
  defaultChecked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  disabled?: boolean
  name?: string
  className?: string
}

/** DESIGN_SPEC 3.43: 20 px square, 1.5 px border, 44 px tap row, long labels wrap. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={[styles.root, className].filter(Boolean).join(' ')}>
      <Primitive {...props} className={styles.box}>
        <CheckboxIndicator className={styles.indicator}>
          {(state) => (state.indeterminate ? <span className={styles.dash} /> : <Icon icon={Check} size={16} />)}
        </CheckboxIndicator>
      </Primitive>
      <span className={styles.label}>{label}</span>
    </label>
  )
}
