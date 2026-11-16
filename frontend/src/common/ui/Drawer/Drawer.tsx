import { Drawer as Primitive, DrawerBackdrop, DrawerContent, DrawerTitle } from '@ui-sdk/react/drawer'
import type { ReactNode } from 'react'

import styles from './Drawer.module.css'

export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side: DrawerSide
  /** Accessible dialog name; the visible heading is supplied by the content. */
  label: string
  children: ReactNode
  className?: string
}

export function Drawer({ open, onOpenChange, side, label, children, className }: DrawerProps) {
  return (
    <Primitive open={open} onOpenChange={onOpenChange} side={side}>
      <DrawerBackdrop className={styles.backdrop} />
      <DrawerContent className={[styles.content, className].filter(Boolean).join(' ')}>
        <DrawerTitle className="visually-hidden">{label}</DrawerTitle>
        {children}
      </DrawerContent>
    </Primitive>
  )
}
