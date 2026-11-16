import { useState } from 'react'

import type { Condition } from '../model/conditions.ts'
import { ConditionItem } from './ConditionItem.tsx'
import styles from './ConditionList.module.css'

const conditionsWord = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'условие'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'условия'
  return 'условий'
}

export interface ConditionListProps {
  conditions: Condition[]
  /** Items shown before «+N»; 4 by default (DESIGN_SPEC 3.15). */
  max?: number
  className?: string
}

/** Two columns from 520 px of card width; expanding shows the rest in place. */
export function ConditionList({ conditions, max = 4, className }: ConditionListProps) {
  const [expanded, setExpanded] = useState(false)

  if (conditions.length === 0) return null

  const hidden = conditions.length - max
  const visible = expanded ? conditions : conditions.slice(0, max)

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <ul className={styles.list}>
        {visible.map((condition) => (
          <ConditionItem key={`${condition.kind}-${condition.text}`} condition={condition} />
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Свернуть' : `+${hidden} ${conditionsWord(hidden)}`}
        </button>
      )}
    </div>
  )
}
