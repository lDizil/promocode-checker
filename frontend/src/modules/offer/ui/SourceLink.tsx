import { Icon } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import type { SourceKind } from '../model/offer.ts'
import styles from './SourceLink.module.css'

export interface SourceLinkProps {
  source: { kind: SourceKind; name: string | null; url: string | null }
  className?: string
}

function label({ kind, name }: SourceLinkProps['source']): string {
  switch (kind) {
    case 'partner_api':
      return `Источник: партнёрская сеть${name ? ` ${name}` : ''}`
    case 'partner_channel':
      return `Источник: канал-партнёр${name ? ` @${name.replace(/^@/, '')}` : ''}`
    case 'official_page':
      return 'Источник: сайт магазина'
    case 'user_submission':
      return 'Источник: прислал пользователь'
  }
}

/** DESIGN_SPEC 3.17: caption source line; opens the source page in a new tab. */
export function SourceLink({ source, className }: SourceLinkProps) {
  const content = (
    <>
      {label(source)}
      {source.url && <Icon icon={icons.ExternalLink} size={12} className={styles.icon} />}
    </>
  )

  return (
    <p className={[styles.root, className].filter(Boolean).join(' ')}>
      {source.url ? (
        <a className={styles.link} href={source.url} target="_blank" rel="noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
    </p>
  )
}
