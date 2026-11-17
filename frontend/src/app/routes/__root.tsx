import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Toaster } from '@/common/ui/Toast/index.ts'
import { AppShell } from '@/modules/shell/index.ts'
import { getThemePreference, type ThemePreference } from '@/modules/theme/index.ts'
import { ErrorPage } from '@/pages/error.tsx'
import { NotFoundPage } from '@/pages/not-found.tsx'

import globalCss from '../styles/global.css?url'
import tokensCss from '../styles/tokens.css?url'

export interface RouterContext {
  queryClient: QueryClient
  theme: ThemePreference
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600;700&display=swap&subset=cyrillic'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => ({ theme: await getThemePreference() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Рабочий код — проверенные промокоды и бесплатные офферы' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONTS },
      { rel: 'stylesheet', href: tokensCss },
      { rel: 'stylesheet', href: globalCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
})

/** Document + app shell; also wraps root error/not-found states, so navigation survives a failure. */
function RootDocument({ children }: { children: ReactNode }) {
  const { theme } = Route.useRouteContext()
  return (
    <html lang="ru" data-theme={theme === 'system' ? undefined : theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
