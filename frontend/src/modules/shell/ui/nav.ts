import { icons, type IconGlyph } from '@/common/ui/Icon/index.ts'

export interface ShellNavItem {
  label: string
  to: string
  icon: IconGlyph
}

export const SHELL_NAV: readonly ShellNavItem[] = [
  { label: 'Главная', to: '/', icon: icons.House },
  { label: 'Каталог', to: '/catalog', icon: icons.LayoutGrid },
  { label: 'Как мы проверяем', to: '/about/verification', icon: icons.ShieldCheck },
]
