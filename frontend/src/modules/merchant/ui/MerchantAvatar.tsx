import styles from './MerchantAvatar.module.css'

export type MerchantAvatarSize = 24 | 32 | 48 | 64

export interface MerchantAvatarProps {
  name: string
  /** DESIGN_SPEC 3.5: the first letter of the name stands in when there is no logo. */
  logoUrl?: string | null
  /** 24 in dense rows, 32 in autocomplete, 48 in MerchantTile, 64 in the merchant header. */
  size?: MerchantAvatarSize
  className?: string
}

/** DESIGN_SPEC 3.5: a `surface-2` square with the logo inset 4 px, decorative next to the name. */
export function MerchantAvatar({ name, logoUrl = null, size = 48, className }: MerchantAvatarProps) {
  return (
    <span
      className={[styles.avatar, className].filter(Boolean).join(' ')}
      data-slot="merchant-avatar"
      data-size={size}
      aria-hidden="true"
    >
      {logoUrl === null ? (
        <span className={styles.letter}>{[...name.trim()][0]?.toLocaleUpperCase('ru-RU') ?? '?'}</span>
      ) : (
        <img className={styles.logo} src={logoUrl} alt="" />
      )}
    </span>
  )
}
