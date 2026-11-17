import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import { isConnectionOnline } from '../model/connection.ts'

// onlineManager installs its default window online/offline listener when the first subscriber arrives.
function subscribe(onStoreChange: () => void) {
  return onlineManager.subscribe(() => onStoreChange())
}

const getServerSnapshot = () => true

/** `true` while the app is online; the server snapshot is `true` to keep SSR deterministic. */
export function useConnectionStatus(): boolean {
  return useSyncExternalStore(subscribe, isConnectionOnline, getServerSnapshot)
}
