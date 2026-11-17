/* eslint-disable unicorn/consistent-function-scoping -- page.evaluate serializes auditPage; helpers must be inside it. */
/**
 * Browser-side layout audit, shared by `pnpm verify:ui` (`page.evaluate(auditPage)`) and the
 * Storybook `afterEach` invariant check.
 *
 * `auditPage` must stay self-contained: Playwright serialises it with `toString()`, so every helper
 * lives inside the function body. Types are stripped before serialisation.
 *
 * Only invariants that do not require design judgement run at runtime. Deliberately not evaluated
 * here (the `Rule` union keeps their names so stored reports stay readable):
 * - `icon-misaligned`/`text-overflow`/`overlap` — intent depends on composition, stacking and
 *   negative margins; pixel diff in `pnpm verify:ui` reports the change without guessing.
 * - `color-not-token` — computed colours are affected by opacity, blending and `color-mix()`;
 *   `scripts/verify/token-lint.ts` checks the source literally instead.
 * - `font-not-in-scale`/`tap-target-small` — computed values vary with inherited defaults and
 *   Figma-derived sizes; the feature's own story/a11y checks own those design rules.
 */

export interface ElementRecord {
  /** Stable identity across runs: landmark › control › own label. */
  key: string
  x: number
  y: number
  w: number
  h: number
  /** Computed text/icon colour. */
  color: string
  /** Computed background colour, empty when transparent. */
  bg: string
  /** `font-size/line-height weight` for text leaves, empty otherwise. */
  font: string
}

export type Rule =
  | 'icon-off-center'
  | 'icon-misaligned'
  | 'text-clipped'
  | 'text-overflow'
  | 'page-overflow-x'
  | 'overlap'
  | 'color-not-token'
  | 'font-not-in-scale'
  | 'tap-target-small'
  | 'broken-image'

export interface Violation {
  rule: Rule
  key: string
  message: string
}

export interface PageAudit {
  elements: ElementRecord[]
  violations: Violation[]
  docWidth: number
  docHeight: number
}

export interface AuditOptions {
  /** Rules to skip, e.g. from a scenario's configuration. */
  disable?: Rule[]
  /** Run only these rules; the Storybook hook passes its reliable subset here. */
  only?: Rule[]
}

/** Rules `auditPage` actually evaluates. Others remain in `Rule` for stored-report compatibility. */
export const RUNTIME_RULES: readonly Rule[] = ['icon-off-center', 'text-clipped', 'broken-image', 'page-overflow-x']

export function auditPage(rootArg?: Element | null, options?: AuditOptions): PageAudit {
  const root = rootArg ?? document.body
  const doc = root.ownerDocument
  const win = doc.defaultView ?? window
  const docElement = doc.documentElement
  const scrollX = win.scrollX
  const scrollY = win.scrollY
  const docWidth = docElement.scrollWidth
  const docHeight = docElement.scrollHeight
  /** `scrollWidth` above `clientWidth` is the standard horizontal-overflow test (excludes scrollbars). */
  const viewportWidth = docElement.clientWidth
  const disabled = new Set(options?.disable ?? [])
  const only = options?.only ? new Set(options.only) : undefined
  const violations: Violation[] = []

  function report(rule: Rule, key: string, message: string): void {
    if (!disabled.has(rule) && (!only || only.has(rule))) violations.push({ rule, key, message })
  }

  const INTERACTIVE =
    'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],' +
    '[role=checkbox],[role=radio],[role=switch],[role=menuitem],[role=option],[role=combobox],[role=textbox],' +
    '[role=slider],[tabindex]:not([tabindex="-1"])'
  const LANDMARK =
    'header,nav,main,aside,footer,form,dialog,[role=dialog],[role=alertdialog],[role=banner],[role=navigation],' +
    '[role=main],[role=complementary],[role=contentinfo],[role=region],[role=search],[role=status],' +
    'section[aria-label],section[aria-labelledby]'

  const styles = new Map<Element, CSSStyleDeclaration>()
  function styleOf(el: Element): CSSStyleDeclaration {
    const cached = styles.get(el)
    if (cached) return cached
    const style = win.getComputedStyle(el)
    styles.set(el, style)
    return style
  }
  const rects = new Map<Element, DOMRect>()
  function rectOf(el: Element): DOMRect {
    const cached = rects.get(el)
    if (cached) return cached
    const rect = el.getBoundingClientRect()
    rects.set(el, rect)
    return rect
  }

  function clean(text: string | null | undefined, max = 40): string {
    const value = (text ?? '').replace(/\s+/g, ' ').trim()
    return value.length > max ? `${value.slice(0, max - 1)}…` : value
  }
  function isIcon(el: Element): boolean {
    return el.localName === 'svg' || el.localName === 'img' || el.getAttribute('role') === 'img'
  }

  const visibleCache = new Map<Element, boolean>()
  function visible(el: Element): boolean {
    const cached = visibleCache.get(el)
    if (cached !== undefined) return cached
    const rect = rectOf(el)
    const style = styleOf(el)
    const result =
      rect.width > 1 &&
      rect.height > 1 &&
      rect.right + scrollX > 0 &&
      rect.left + scrollX < docWidth &&
      rect.bottom + scrollY > 0 &&
      rect.top + scrollY < docHeight &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      !clippedAway(el, rect)
    visibleCache.set(el, result)
    return result
  }
  /** Visual content collapsed by an overflow-hidden ancestor is not audited. */
  function clippedAway(el: Element, rect: DOMRect): boolean {
    for (
      let parent = el.parentElement;
      parent && parent !== root && parent !== doc.body;
      parent = parent.parentElement
    ) {
      const style = styleOf(parent)
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
      const box = rectOf(parent)
      if (box.width <= 1 || box.height <= 1) return true
      const overlapX = Math.min(rect.right, box.right) - Math.max(rect.left, box.left)
      const overlapY = Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top)
      if ((style.overflowX === 'hidden' || style.overflowX === 'clip') && overlapX <= 0) return true
      if ((style.overflowY === 'hidden' || style.overflowY === 'clip') && overlapY <= 0) return true
    }
    return false
  }

  function directText(el: Element): string {
    let text = ''
    for (const node of el.childNodes) if (node.nodeType === 3) text += node.textContent ?? ''
    return clean(text)
  }
  function hasVisibleText(el: Element): boolean {
    if (directText(el) !== '') return true
    for (const node of el.querySelectorAll('*')) {
      if (directText(node) !== '' && visible(node)) return true
    }
    return false
  }
  interface TextBox {
    left: number
    top: number
    right: number
    bottom: number
  }
  /**
   * Bounding box of the element's own (trimmed) text nodes. Text in child elements is excluded,
   * and the clipping rule below only runs for text-only leaves, so a child overflowing a box is
   * never attributed to the parent's text.
   */
  function directTextBox(el: Element): TextBox | null {
    let box: TextBox | null = null
    for (const node of el.childNodes) {
      if (node.nodeType !== 3) continue
      const raw = node.textContent ?? ''
      const start = raw.length - raw.trimStart().length
      const end = raw.trimEnd().length
      if (end <= start) continue
      const range = doc.createRange()
      range.setStart(node, start)
      range.setEnd(node, end)
      const text = range.getBoundingClientRect()
      if (text.width <= 0 && text.height <= 0) continue
      box = box
        ? {
            left: Math.min(box.left, text.left),
            top: Math.min(box.top, text.top),
            right: Math.max(box.right, text.right),
            bottom: Math.max(box.bottom, text.bottom),
          }
        : { left: text.left, top: text.top, right: text.right, bottom: text.bottom }
    }
    return box
  }

  function imageName(img: HTMLImageElement): string {
    const alt = clean(img.alt)
    if (alt) return alt
    const src = img.currentSrc || img.getAttribute('src') || ''
    if (/^data:/i.test(src)) return 'data-uri'
    const path = src.split(/[?#]/)[0] ?? ''
    return clean(path.slice(path.lastIndexOf('/') + 1)) || 'img'
  }
  function iconName(el: Element): string {
    if (el.localName === 'img') return imageName(el as HTMLImageElement)
    const lucide = [...el.classList].find((name) => name.startsWith('lucide-'))
    if (lucide) return lucide.slice('lucide-'.length)
    return clean(el.getAttribute('aria-label')) || clean(el.getAttribute('data-icon')) || el.localName
  }
  function accessibleName(el: Element): string {
    const labelledby = el.getAttribute('aria-labelledby')
    if (labelledby) {
      const text = labelledby
        .split(/\s+/)
        .map((id) => doc.getElementById(id)?.textContent ?? '')
        .join(' ')
      if (clean(text)) return clean(text)
    }
    const label = el.getAttribute('aria-label') ?? el.getAttribute('title')
    if (clean(label)) return clean(label)
    if (el instanceof HTMLInputElement) {
      return clean(el.labels?.[0]?.textContent) || clean(el.placeholder) || el.name || el.type
    }
    if (el instanceof HTMLTextAreaElement) {
      return clean(el.labels?.[0]?.textContent) || clean(el.placeholder) || el.name || 'textbox'
    }
    if (el instanceof HTMLSelectElement) {
      return clean(el.labels?.[0]?.textContent) || el.name || 'combobox'
    }
    return clean(el.textContent)
  }
  function roleOf(el: Element): string {
    const role = el.getAttribute('role')
    if (role) return role
    if (el.localName === 'a') return 'link'
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'range') return el.type
      if (el.type === 'search') return 'searchbox'
      return 'textbox'
    }
    if (el.localName === 'textarea') return 'textbox'
    if (el.localName === 'select') return 'combobox'
    return el.localName
  }
  function ownLabel(el: Element): string {
    if (isIcon(el)) return `icon:${iconName(el)}`
    if (el.matches(INTERACTIVE)) return `${roleOf(el)} "${accessibleName(el)}"`
    if (/^h[1-6]$/.test(el.localName)) return `${el.localName} "${clean(el.textContent)}"`
    if (el.matches(LANDMARK)) {
      const name = accessibleName(el)
      return name && (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby'))
        ? `${roleOf(el)} "${name}"`
        : roleOf(el)
    }
    return `text "${directText(el)}"`
  }
  function contextOf(el: Element): string[] {
    const parts: string[] = []
    const control = el.parentElement?.closest(INTERACTIVE)
    if (control && root.contains(control)) parts.unshift(ownLabel(control))
    const landmark = el.parentElement?.closest(LANDMARK)
    if (landmark && root.contains(landmark)) parts.unshift(ownLabel(landmark))
    return parts
  }

  // ---- collect meaningful elements -------------------------------------------------------------
  const tracked: Element[] = []
  for (const el of root.querySelectorAll('*')) {
    // SVG internals are geometry noise; the root <svg> carries the icon identity.
    if (el.closest('svg') && el.localName !== 'svg') continue
    if (el.localName === 'svg' && el.parentElement?.closest('svg')) continue
    const meaningful =
      isIcon(el) ||
      el.matches(INTERACTIVE) ||
      el.matches(LANDMARK) ||
      /^h[1-6]$/.test(el.localName) ||
      directText(el) !== ''
    if (meaningful && visible(el)) tracked.push(el)
  }

  const keys = new Map<Element, string>()
  const seen = new Map<string, number>()
  for (const el of tracked) {
    const base = [...contextOf(el), ownLabel(el)].join(' › ')
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    keys.set(el, count === 1 ? base : `${base} #${count}`)
  }
  const keyOf = (el: Element): string => keys.get(el) ?? ownLabel(el)

  const elements: ElementRecord[] = tracked.map((el) => {
    const rect = rectOf(el)
    const style = styleOf(el)
    const bg = style.backgroundColor
    return {
      key: keyOf(el),
      x: Math.round(rect.left + scrollX),
      y: Math.round(rect.top + scrollY),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      color: style.color,
      bg: bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' ? '' : bg,
      font: directText(el) ? `${style.fontSize}/${style.lineHeight} ${style.fontWeight}` : '',
    }
  })

  // ---- invariants ------------------------------------------------------------------------------
  for (const el of tracked) {
    const key = keyOf(el)
    const rect = rectOf(el)
    const style = styleOf(el)

    if (el.matches(INTERACTIVE)) {
      const icons: Element[] = []
      for (const icon of el.querySelectorAll('svg,img')) {
        if (icon.parentElement?.closest('svg')) continue
        if (visible(icon)) icons.push(icon)
      }
      const icon = icons.length === 1 ? icons[0] : undefined
      if (icon && !hasVisibleText(el)) {
        const iconRect = rectOf(icon)
        const dx = iconRect.left + iconRect.width / 2 - (rect.left + rect.width / 2)
        const dy = iconRect.top + iconRect.height / 2 - (rect.top + rect.height / 2)
        // A 0.5 px difference is normal for odd/even pixel grids; 1.5 px is visibly off-centre.
        if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) {
          report('icon-off-center', key, `иконка смещена от центра на (${dx.toFixed(1)}, ${dy.toFixed(1)}) px`)
        }
      }
    }

    const text = directText(el)
    if (text && el.children.length === 0) {
      const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip'
      const clipsY = style.overflowY === 'hidden' || style.overflowY === 'clip'
      if ((clipsX || clipsY) && el.clientWidth > 0 && el.clientHeight > 0) {
        const textBox = directTextBox(el)
        if (textBox) {
          const contentLeft = rect.left + el.clientLeft
          const contentTop = rect.top + el.clientTop
          const contentRight = contentLeft + el.clientWidth
          const contentBottom = contentTop + el.clientHeight
          const overX = Math.max(textBox.right - contentRight, contentLeft - textBox.left)
          const overY = Math.max(textBox.bottom - contentBottom, contentTop - textBox.top)
          const ellipsis = style.textOverflow === 'ellipsis'
          const clamp = ['-webkit-line-clamp', 'line-clamp'].some((name) => {
            const value = style.getPropertyValue(name)
            return value !== '' && value !== 'none'
          })
          const clippedX = clipsX && !ellipsis && overX > 1
          const clippedY = clipsY && !clamp && overY > 1
          if (clippedX || clippedY) {
            const axes: string[] = []
            if (clippedX) axes.push(`по ширине на ${Math.round(overX)} px`)
            if (clippedY) axes.push(`по высоте на ${Math.round(overY)} px`)
            report('text-clipped', key, `текст не помещается в контейнер ${axes.join(' и ')}`)
          }
        }
      }
    }

    if (el.localName === 'img') {
      const img = el as HTMLImageElement
      const src = img.currentSrc || img.getAttribute('src') || ''
      // `complete === false` means loading/lazy, not broken; an empty src is a deliberate placeholder.
      if (src && img.complete && img.naturalWidth === 0) {
        report('broken-image', key, `картинка не загрузилась: ${imageName(img)}`)
      }
    }
  }

  if (root === doc.body && docWidth > viewportWidth + 1) {
    const culprits = tracked
      .filter((el) => rectOf(el).right + scrollX > viewportWidth + 1)
      .slice(0, 3)
      .map(keyOf)
    report(
      'page-overflow-x',
      'document',
      `горизонтальный скролл: ${docWidth} > ${viewportWidth} px${
        culprits.length > 0 ? `; выходят: ${culprits.join('; ')}` : ''
      }`,
    )
  }

  return { elements, violations, docWidth, docHeight }
}
