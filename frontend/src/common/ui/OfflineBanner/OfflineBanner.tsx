import { Icon } from '../Icon/Icon.tsx'
import { WifiOff } from '../Icon/icons.ts'
import styles from './OfflineBanner.module.css'

export interface OfflineBannerProps {
  /** Formatted time of the saved snapshot, e.g. «14:20». */
  since?: string
  /** Full sentence override; by default the spec copy is built from `since`. */
  message?: string
  sticky?: boolean
  className?: string
}

/** DESIGN_SPEC 3.29: a bar under the header that explains saved data while offline. */
export function OfflineBanner({ since, message, sticky = false, className }: OfflineBannerProps) {
  const text = message ?? `Нет соединения. Показываем сохранённые данные${since ? ` от ${since}` : ''}`

  return (
    <div role="status" className={[styles.root, className].filter(Boolean).join(' ')} data-sticky={sticky || undefined}>
      <Icon icon={WifiOff} size={16} />
      <span>{text}</span>
    </div>
  )
}
