import { useRouteContext, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'

import { logger } from '@/common/logger.ts'
import { toast } from '@/common/ui/Toast/index.ts'

import { saveThemePreference, type ThemePreference } from '../api/theme.functions.ts'

const SAVE_ERROR = 'Не удалось сохранить тему. Попробуйте ещё раз'

function applyTheme(preference: ThemePreference) {
  if (typeof document === 'undefined') return
  if (preference === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = preference
}

/**
 * The root route puts the preference into router context, so the server HTML is right before paint.
 * A choice is applied synchronously and persisted in order; a failed latest save rolls back.
 */
export function useThemePreference(): [ThemePreference, (next: ThemePreference) => Promise<void>] {
  const router = useRouter()
  const save = useServerFn(saveThemePreference)
  const serverPreference = useRouteContext({ strict: false, select: (context) => context.theme ?? 'system' })
  const [preference, setPreference] = useState<ThemePreference>(serverPreference)
  const current = useRef<ThemePreference>(serverPreference)
  const confirmed = useRef<ThemePreference>(serverPreference)
  const latestChoice = useRef(0)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())

  const setPreferenceValue = (next: ThemePreference): Promise<void> => {
    if (next === current.current) return Promise.resolve()
    latestChoice.current += 1
    const choice = latestChoice.current
    current.current = next
    setPreference(next)
    applyTheme(next)

    const persist = async () => {
      let saved = false
      try {
        await save({ data: next })
        saved = true
        confirmed.current = next
        if (choice !== latestChoice.current) return
        await router.invalidate({ filter: (match) => match.routeId === '__root__' })
        if (choice !== latestChoice.current) applyTheme(current.current)
      } catch (error) {
        if (saved) {
          logger.error('Theme router invalidate failed', { error })
          return
        }
        if (choice !== latestChoice.current) return
        current.current = confirmed.current
        setPreference(confirmed.current)
        applyTheme(confirmed.current)
        toast.error(SAVE_ERROR)
      }
    }

    const result = saveQueue.current.then(persist).catch((error) => {
      logger.error('Theme preference update failed', { error })
    })
    saveQueue.current = result
    return result
  }

  return [preference, setPreferenceValue]
}
