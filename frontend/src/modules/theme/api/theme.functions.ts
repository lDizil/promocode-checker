import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

export const themePreference = z.enum(['system', 'light', 'dark'])
export type ThemePreference = z.infer<typeof themePreference>

const COOKIE = 'theme'
const YEAR_S = 60 * 60 * 24 * 365

// Read on the server during SSR so <html data-theme> is right before paint (ADR 0001).
export const getThemePreference = createServerFn({ method: 'GET' }).handler((): ThemePreference => {
  const parsed = themePreference.safeParse(getCookie(COOKIE))
  return parsed.success ? parsed.data : 'system'
})

export const saveThemePreference = createServerFn({ method: 'POST' })
  .validator(themePreference)
  .handler(({ data }) => {
    setCookie(COOKIE, data, { path: '/', maxAge: YEAR_S, sameSite: 'lax' })
    return data
  })
