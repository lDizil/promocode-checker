import { Link } from '@tanstack/react-router'

import { Logo, type LogoLinkRenderProps } from '@/common/ui/Logo/index.ts'

export interface HomeLogoProps {
  onClick?: () => void
  className?: string
}

export function HomeLogo({ onClick, className }: HomeLogoProps) {
  return (
    <Logo
      className={className}
      renderLink={({ className: linkClassName, children }: LogoLinkRenderProps) => (
        <Link to="/" className={linkClassName} onClick={onClick}>
          {children}
        </Link>
      )}
    />
  )
}
