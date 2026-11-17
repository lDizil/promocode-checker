// A decorative countdown follows the same page-activity pauses as ui-sdk's timer.
export function bindToastActivity(region: HTMLElement | null) {
  if (!region) return
  const document = region.ownerDocument
  const window = document.defaultView
  if (!window) return

  const sync = () => region.toggleAttribute('data-page-paused', document.hidden || !document.hasFocus())
  sync()
  window.addEventListener('focus', sync)
  window.addEventListener('blur', sync)
  document.addEventListener('visibilitychange', sync)

  return () => {
    window.removeEventListener('focus', sync)
    window.removeEventListener('blur', sync)
    document.removeEventListener('visibilitychange', sync)
  }
}
