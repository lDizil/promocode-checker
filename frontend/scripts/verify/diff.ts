import { createHash } from 'node:crypto'

import type { ElementRecord, PageAudit, Violation } from './audit.ts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type ChangeKind = 'removed' | 'added' | 'resized' | 'moved' | 'restyled' | 'pixels' | 'violation' | 'console'

/** One finding for one scenario; findings with the same id merge across scenarios. */
export interface Finding {
  id: string
  kind: ChangeKind
  title: string
  detail: string
  /** Where to crop the before/after picture, in page coordinates. */
  base?: Rect
  head?: Rect
}

export interface Change {
  id: string
  kind: ChangeKind
  title: string
  /** `scenario: detail` lines. */
  details: string[]
  scenarios: string[]
  crops: { scenario: string; base?: Rect; head?: Rect }[]
}

export const shortHash = (...parts: (string | number)[]) =>
  createHash('sha1').update(parts.join('\u0000')).digest('hex').slice(0, 6)

const rectOf = (record: ElementRecord): Rect => ({ x: record.x, y: record.y, w: record.w, h: record.h })
const union = (rects: Rect[]): Rect | undefined => {
  if (rects.length === 0) return undefined
  const x = Math.min(...rects.map((r) => r.x))
  const y = Math.min(...rects.map((r) => r.y))
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  }
}
const parentOf = (key: string) => {
  const parts = key.split(' › ')
  return { context: parts.slice(0, -1).join(' › ') || 'страница', own: parts.at(-1) ?? key }
}

/** Element-level before/after comparison: what disappeared, appeared, changed size, position or style. */
export function diffLayout(base: PageAudit, head: PageAudit): Finding[] {
  const findings: Finding[] = []
  const before = new Map(base.elements.map((el) => [el.key, el]))
  const after = new Map(head.elements.map((el) => [el.key, el]))

  for (const [kind, from, to] of [
    ['removed', before, after],
    ['added', after, before],
  ] as const) {
    const byContext = new Map<string, ElementRecord[]>()
    for (const [key, record] of from) {
      if (to.has(key)) continue
      const { context } = parentOf(key)
      byContext.set(context, [...(byContext.get(context) ?? []), record])
    }
    for (const [context, records] of byContext) {
      const owns = records.map((r) => parentOf(r.key).own)
      const listed = owns.slice(0, 6).join(', ') + (owns.length > 6 ? ` и ещё ${owns.length - 6}` : '')
      const area = union(records.map(rectOf))
      findings.push({
        id: shortHash(kind, context, ...owns.toSorted()),
        kind,
        title: `${kind === 'removed' ? 'ПРОПАЛО' : 'ПОЯВИЛОСЬ'} в «${context}»: ${listed}`,
        detail: records
          .map((r) => `${parentOf(r.key).own} ${r.w}×${r.h} @ ${r.x},${r.y}`)
          .slice(0, 6)
          .join('; '),
        ...(kind === 'removed' ? { base: area } : { head: area }),
      })
    }
  }

  const moves = new Map<string, { a: ElementRecord; b: ElementRecord }[]>()
  for (const [key, a] of before) {
    const b = after.get(key)
    if (!b) continue
    const dw = b.w - a.w
    const dh = b.h - a.h
    if (Math.abs(dw) >= 1 || Math.abs(dh) >= 1) {
      findings.push({
        id: shortHash('resized', key, a.w, a.h, b.w, b.h),
        kind: 'resized',
        title: `РАЗМЕР «${key}»: ${a.w}×${a.h} → ${b.w}×${b.h}`,
        detail: `ширина ${signed(dw)}, высота ${signed(dh)}`,
        base: rectOf(a),
        head: rectOf(b),
      })
    } else if (a.x !== b.x || a.y !== b.y) {
      const shift = `${signed(b.x - a.x)},${signed(b.y - a.y)}`
      moves.set(shift, [...(moves.get(shift) ?? []), { a, b }])
    }
    const styles: string[] = []
    if (a.color !== b.color) styles.push(`цвет ${a.color} → ${b.color}`)
    if (a.bg !== b.bg) styles.push(`фон ${a.bg || 'нет'} → ${b.bg || 'нет'}`)
    if (a.font !== b.font) styles.push(`шрифт ${a.font} → ${b.font}`)
    if (styles.length > 0) {
      findings.push({
        id: shortHash('restyled', key, ...styles),
        kind: 'restyled',
        title: `СТИЛЬ «${key}»: ${styles.join('; ')}`,
        detail: styles.join('; '),
        base: rectOf(a),
        head: rectOf(b),
      })
    }
  }
  for (const [shift, pairs] of moves) {
    const keys = pairs.map((p) => p.b.key)
    findings.push({
      id: shortHash('moved', shift, ...keys.toSorted().slice(0, 3)),
      kind: 'moved',
      title: `СДВИГ на (${shift}) px: ${pairs.length} элем., например «${keys[0]}»`,
      detail: keys.slice(0, 5).join('; ') + (keys.length > 5 ? ` и ещё ${keys.length - 5}` : ''),
      base: union(pairs.map((p) => rectOf(p.a))),
      head: union(pairs.map((p) => rectOf(p.b))),
    })
  }
  if (base.docHeight !== head.docHeight || base.docWidth !== head.docWidth) {
    findings.push({
      id: shortHash('page-size', base.docWidth, base.docHeight, head.docWidth, head.docHeight),
      kind: 'resized',
      title: `РАЗМЕР страницы: ${base.docWidth}×${base.docHeight} → ${head.docWidth}×${head.docHeight}`,
      detail: 'обычно следствие изменений выше',
    })
  }
  return findings
}

const violationKey = (v: Violation) => `${v.rule}|${v.key}`

/** Layout invariants: only violations the change introduced block; pre-existing ones are listed separately. */
export function diffViolations(base: PageAudit, head: PageAudit) {
  const before = new Set(base.violations.map(violationKey))
  const after = new Set(head.violations.map(violationKey))
  const rects = new Map(head.elements.map((el) => [el.key, rectOf(el)]))
  const introduced: Finding[] = head.violations
    .filter((v) => !before.has(violationKey(v)))
    .map((v) => ({
      id: shortHash('violation', v.rule, v.key),
      kind: 'violation',
      title: `НАРУШЕНИЕ ${v.rule}: «${v.key}» — ${v.message}`,
      detail: v.message,
      head: rects.get(v.key),
    }))
  return {
    introduced,
    preexisting: head.violations.filter((v) => before.has(violationKey(v))),
    fixed: base.violations.filter((v) => !after.has(violationKey(v))),
  }
}

/** Merge per-scenario findings into report entries keyed by id. */
export function mergeFindings(perScenario: { scenario: string; findings: Finding[] }[]): Change[] {
  const changes = new Map<string, Change>()
  for (const { scenario, findings } of perScenario) {
    for (const finding of findings) {
      const change = changes.get(finding.id) ?? {
        id: finding.id,
        kind: finding.kind,
        title: finding.title,
        details: [],
        scenarios: [],
        crops: [],
      }
      change.scenarios.push(scenario)
      change.details.push(`${scenario}: ${finding.detail}`)
      change.crops.push({ scenario, base: finding.base, head: finding.head })
      changes.set(finding.id, change)
    }
  }
  return [...changes.values()]
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}
