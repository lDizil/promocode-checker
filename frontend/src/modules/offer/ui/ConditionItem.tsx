import { Icon, type IconGlyph } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import type { Condition, ConditionKind } from '../model/conditions.ts'
import styles from './ConditionList.module.css'

const ICON: Record<ConditionKind, IconGlyph> = {
  restriction: icons.TriangleAlert,
  deadline: icons.Clock,
  neutral: icons.Info,
}

export interface ConditionItemProps {
  condition: Condition
}

export function ConditionItem({ condition }: ConditionItemProps) {
  const urgent = condition.kind === 'deadline' && condition.urgent
  return (
    <li className={styles.item} data-kind={condition.kind} data-urgent={urgent || undefined}>
      <Icon icon={ICON[condition.kind]} size={16} className={styles.icon} />
      <span className={styles.text}>{condition.text}</span>
    </li>
  )
}
