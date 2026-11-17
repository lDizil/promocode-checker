import {
  Toast as ToastPart,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from '@ui-sdk/react/toast'
import type { CSSProperties, ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { Check, Info, TriangleAlert, X } from '../Icon/icons.ts'
import styles from './Toast.module.css'
import { bindToastActivity } from './toast-activity.ts'

/** DESIGN_SPEC 3.25: a toast disappears after 4 s. */
const TOAST_DURATION = 4000

/**
 * Queue behind `<Toaster />`. It is ui-sdk's toaster with the 4 s default, so every method works:
 * `toast.info`, `toast.success`, `toast.error`, `toast.promise`, `toast.update`, `toast.dismiss`.
 */
export const toast = createToaster<ReactNode>({ duration: TOAST_DURATION })

export type ToastVariant = 'info' | 'success' | 'error'

export interface ToasterProps {
  /** Defaults to the spec position: bottom, start-aligned (bottom-left on desktop). */
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  className?: string
}

/** DESIGN_SPEC 3.25: mounts once near the app root; messages go through `toast`. */
export function Toaster({ side = 'bottom', align = 'start', className }: ToasterProps) {
  return (
    <ToastRegion
      toaster={toast}
      side={side}
      align={align}
      className={[styles.region, className].filter(Boolean).join(' ')}
      aria-label="Уведомления"
      ref={bindToastActivity}
    >
      {(data) => {
        const icon = data.type === 'success' ? Check : data.type === 'error' ? TriangleAlert : Info

        return (
          <ToastPart className={styles.toast}>
            <span className={styles.icon}>
              <Icon icon={icon} size={20} />
            </span>
            <div className={styles.body} data-has-description={data.description ? '' : undefined}>
              <ToastTitle className={styles.title} />
              <ToastDescription className={styles.description} />
            </div>
            {data.action && <ToastAction className={styles.action} />}
            <ToastClose className={styles.close} aria-label="Закрыть уведомление">
              <Icon icon={X} size={16} />
            </ToastClose>
            {Number.isFinite(data.duration) && data.duration > 0 && (
              <span
                key={data.version}
                className={styles.timeline}
                data-toast-timeline=""
                aria-hidden="true"
                style={{ '--toast-duration': `${data.duration}ms` } as CSSProperties}
              />
            )}
          </ToastPart>
        )
      }}
    </ToastRegion>
  )
}
