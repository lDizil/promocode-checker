import { useRouteContext, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { saveThemePreference, type ThemePreference } from '../api/theme.functions.ts'

/** The root route puts the preference into router context; saving re-runs it to update <html>. */
export function useThemePreference(): [ThemePreference, (next: ThemePreference) => Promise<void>] {
  const router = useRouter()
  const save = useServerFn(saveThemePreference)
  const preference = useRouteContext({ strict: false, select: (context) => context.theme ?? 'system' })
  const setPreference = async (next: ThemePreference) => {
    await save({ data: next })
    await router.invalidate()
  }
  return [preference, setPreference]
}
