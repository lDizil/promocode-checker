import type { LucideIcon } from 'lucide-react'

export type IconGlyph = LucideIcon

export type IconSize = 12 | 16 | 20

export interface IconProps {
  icon: IconGlyph
  /** DESIGN_SPEC 1.6: 20 in menus and buttons, 16 in tags and conditions; 12 only inside AdLabel. */
  size?: IconSize
  /** Decorative by default; pass a label only when the icon is the sole carrier of meaning. */
  label?: string
  className?: string
}

export function Icon({ icon: Glyph, size = 20, label, className }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={1.5}
      color="currentColor"
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable={false}
    />
  )
}
