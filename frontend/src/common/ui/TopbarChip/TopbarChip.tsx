import type { ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import styles from './TopbarChip.module.css'

export interface TopbarChipProps {
  icon?: IconGlyph
  children: ReactNode
  className?: string
}

/** DESIGN_SPEC 3.1: compact status pill in the desktop Topbar (36 high, surface-1). */
export function TopbarChip({ icon, children, className }: TopbarChipProps) {
  return (
    <div className={[styles.root, 'text-caption', className].filter(Boolean).join(' ')}>
      {icon && <Icon icon={icon} size={16} className={styles.icon} />}
      <span>{children}</span>
    </div>
  )
}
