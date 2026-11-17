import { useState } from 'react'

import { plural, type PluralForms } from '@/common/plural.ts'

import type { Condition } from '../model/conditions.ts'
import { ConditionItem } from './ConditionItem.tsx'
import styles from './ConditionList.module.css'

const CONDITION_FORMS: PluralForms = { one: 'условие', few: 'условия', many: 'условий' }

export interface ConditionListProps {
  conditions: Condition[]
  /** Items shown before «+N»; 4 by default (DESIGN_SPEC 3.15). */
  max?: number
  /** Card layout: 2 columns from 520 px by default, 1 on the merchant page (DESIGN_SPEC 4.4). */
  columns?: 1 | 2
  className?: string
}

/** Expanding shows the rest in place, in the card's column layout. */
export function ConditionList({ conditions, max = 4, columns = 2, className }: ConditionListProps) {
  const [expanded, setExpanded] = useState(false)

  if (conditions.length === 0) return null

  const hidden = conditions.length - max
  const visible = expanded ? conditions : conditions.slice(0, max)

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <ul className={styles.list} data-columns={columns}>
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
          {expanded ? 'Свернуть' : `+${hidden} ${plural(hidden, CONDITION_FORMS)}`}
        </button>
      )}
    </div>
  )
}
