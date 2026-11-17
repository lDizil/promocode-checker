import {
  Accordion as Primitive,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/react/accordion'
import type { ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { ChevronDown } from '../Icon/icons.ts'
import styles from './Accordion.module.css'

export interface AccordionItemData {
  /** Stable value for the item; defaults to the question text. */
  id?: string
  question: string
  answer: ReactNode
}

export interface AccordionProps {
  items: AccordionItemData[]
  /** Several answers open at once; a FAQ opens one at a time by default. */
  multiple?: boolean
  /** Values of items open initially. */
  defaultOpen?: string[]
  className?: string
}

/** FAQ accordion for P-04 (DESIGN_SPEC 4.4): questions are h3 buttons, answers are panels. */
export function Accordion({ items, multiple = false, defaultOpen, className }: AccordionProps) {
  return (
    <Primitive
      multiple={multiple}
      defaultValue={defaultOpen}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const value = item.id ?? item.question

        return (
          <AccordionItem key={value} value={value} className={styles.item}>
            <AccordionHeader>
              <AccordionTrigger className={[styles.trigger, 'text-title'].join(' ')}>
                <span className={styles.question}>{item.question}</span>
                <Icon icon={ChevronDown} size={20} className={styles.chevron} />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel className={[styles.panel, 'text-body-sm'].join(' ')}>{item.answer}</AccordionPanel>
          </AccordionItem>
        )
      })}
    </Primitive>
  )
}
