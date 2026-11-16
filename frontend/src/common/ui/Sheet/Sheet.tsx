import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ui-sdk/react/dialog'
import type { ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { X } from '../Icon/icons.ts'
import styles from './Sheet.module.css'

/** `auto` is a bottom sheet on small touch screens and a centered panel elsewhere (DESIGN_SPEC 3.19). */
export type SheetPresentation = 'auto' | 'sheet' | 'dialog'

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Announced to screen readers in addition to the title. */
  description?: string
  presentation?: SheetPresentation
  children: ReactNode
  className?: string
}

/**
 * Responsive overlay used by sheets such as `FailReasonSheet`: a bottom sheet on mobile,
 * a dialog panel on desktop; title and close button are built in.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  presentation = 'auto',
  children,
  className,
}: SheetProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)} presentation={presentation}>
      <DialogBackdrop className={styles.backdrop} />
      <DialogContent className={[styles.content, className].filter(Boolean).join(' ')}>
        <header className={styles.header}>
          <DialogTitle className={`${styles.title} text-h2`}>{title}</DialogTitle>
          <DialogClose className={styles.close} aria-label="Закрыть">
            <Icon icon={X} size={20} />
          </DialogClose>
        </header>
        {description && <DialogDescription className="visually-hidden">{description}</DialogDescription>}
        <div className={styles.body}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
