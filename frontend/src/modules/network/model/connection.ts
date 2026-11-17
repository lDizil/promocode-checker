import { onlineManager } from '@tanstack/react-query'

// onlineManager starts as online and only learns the truth from later events; seed a first visit offline.
if (typeof window !== 'undefined' && window.navigator.onLine === false) onlineManager.setOnline(false)

/** Server rendering has no browser network state; treat it as online and let the server decide. */
export function isConnectionOnline(): boolean {
  if (typeof window === 'undefined') return true
  return onlineManager.isOnline()
}

/** A route tried to render from cache while offline and found no snapshot to show. */
export class OfflineDataUnavailableError extends Error {
  override readonly name = 'OfflineDataUnavailableError'

  constructor() {
    super('Offline and no cached data is available')
  }
}
