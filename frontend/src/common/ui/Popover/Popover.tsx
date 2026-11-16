import { Popover as Root, PopoverContent, PopoverTitle, PopoverTrigger } from '@ui-sdk/react/popover'
import type { ReactElement, ReactNode } from 'react'

import styles from './Popover.module.css'

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverPresentation = 'popover' | 'sheet' | 'auto'

export interface PopoverProps {
  /** The button that opens the panel; ui-sdk merges its trigger props into this element. */
  trigger: ReactElement
  /** Accessible name of the panel; rendered as a visually hidden title. */
  label: string
  children: ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  /** `auto` presents as a bottom sheet on small touch screens (DESIGN_SPEC 3.13). */
  presentation?: PopoverPresentation
  className?: string
}

/** Styled wrapper over the ui-sdk popover: trigger plus a surface-2 panel with an overlay shadow. */
export function Popover({
  trigger,
  label,
  children,
  side = 'bottom',
  align = 'start',
  presentation = 'popover',
  className,
}: PopoverProps) {
  return (
    <Root presentation={presentation}>
      <PopoverTrigger render={trigger as ReactElement<Record<string, unknown>>} />
      <PopoverContent
        side={side}
        align={align}
        sideOffset={4}
        collisionPadding={8}
        className={[styles.content, className].filter(Boolean).join(' ')}
      >
        <PopoverTitle className="visually-hidden">{label}</PopoverTitle>
        {children}
      </PopoverContent>
    </Root>
  )
}
