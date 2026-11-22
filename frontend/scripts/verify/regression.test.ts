import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { chromium, type Browser, type Page } from 'playwright'
import { PNG } from 'pngjs'

import { auditPage, type PageAudit } from './audit.ts'
import { diffLayout, diffViolations } from './diff.ts'
import { diffPixels } from './pixels.ts'
import { readBaseScenarioNames } from './run.ts'

let browser: Browser
let page: Page
before(async () => {
  browser = await chromium.launch({ headless: true })
  page = await browser.newPage({ viewport: { width: 390, height: 844 } })
})
after(async () => {
  await browser?.close()
})

const fixture = (height: number, notification: boolean, offset = 0) => `<!doctype html><html><body>
<style>body{margin:0}header{display:flex;gap:8px}button{display:flex;align-items:center;justify-content:center;width:40px;height:${height}px;padding:0;border:0}svg{display:block;width:20px;height:20px;transform:translateY(${offset}px)}</style>
<header><button aria-label="Sidebar"><svg class="lucide lucide-panel-right"><path d="M1 1h18v18H1z"/></svg></button>
${notification ? '<button aria-label="Notifications"><svg class="lucide lucide-bell"><path d="M2 2h16v16H2z"/></svg></button>' : ''}</header>
</body></html>`

test('reports taller sidebar control and missing neighboring notification icon', async () => {
  await page.setContent(fixture(40, true))
  const base = await page.evaluate(auditPage, null)
  await page.setContent(fixture(56, false))
  const head = await page.evaluate(auditPage, null)
  const changes = diffLayout(base, head)
  assert.ok(
    changes.some((c) => c.kind === 'resized' && c.title.includes('Sidebar') && c.title.includes('40×40 → 40×56')),
  )
  assert.ok(changes.some((c) => c.kind === 'removed' && c.title.includes('Notifications')))
  assert.ok(changes.some((c) => c.kind === 'removed' && c.title.includes('icon:bell')))
})

test('detects an off-center icon rather than trusting the screenshot reviewer', async () => {
  await page.setContent(fixture(40, true))
  const base = await page.evaluate(auditPage, null)
  assert.equal(base.violations.filter((v) => v.rule === 'icon-off-center').length, 0)
  await page.setContent(fixture(40, true, 5))
  const head = await page.evaluate(auditPage, null)
  const violations = diffViolations(base, head)
  assert.ok(violations.introduced.some((v) => v.title.includes('icon-off-center') && v.title.includes('Sidebar')))
})

test('a clipped menu label does not turn an icon-and-text link into an icon-only control', async () => {
  await page.setContent(`<!doctype html><html><body>
    <div style="width:48px;overflow:hidden">
      <a href="/" style="display:flex;align-items:center;gap:64px;width:280px;height:44px">
        <svg style="width:20px;height:20px;flex:none"><path d="M1 1h18v18H1z"/></svg>
        <span>Главная</span>
      </a>
    </div>
  </body></html>`)
  const audit = await page.evaluate(auditPage, null)
  assert.equal(audit.violations.filter((v) => v.rule === 'icon-off-center').length, 0)
})

test('hidden accessibility labels do not exempt an off-center icon-only control', async () => {
  for (const hidden of ['display:none', 'position:absolute;width:1px;height:1px;overflow:hidden']) {
    await page.setContent(`<!doctype html><html><body>
      <button aria-label="Меню" style="display:flex;align-items:center;justify-content:start;width:80px;height:44px">
        <svg style="width:20px;height:20px"><path d="M1 1h18v18H1z"/></svg>
        <span style="${hidden}">Меню</span>
      </button>
    </body></html>`)
    const audit = await page.evaluate(auditPage, null)
    assert.ok(
      audit.violations.some((v) => v.rule === 'icon-off-center'),
      hidden,
    )
  }
})

test('detects text clipped by an ancestor or inside an element that also has an icon child', async () => {
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="width:60px;overflow:hidden;white-space:nowrap">
      <span>Очень длинный текст заголовка</span>
    </div>
    <button style="display:inline-flex;align-items:center;gap:4px;width:64px;overflow:hidden;white-space:nowrap">
      <svg style="width:16px;height:16px;flex:none"><path d="M1 1h14v14H1z"/></svg>
      Применить длинный код
    </button>
  </body></html>`)
  const audit = await page.evaluate(auditPage, null)
  const clipped = audit.violations.filter((v) => v.rule === 'text-clipped')
  assert.ok(clipped.some((v) => v.key.includes('Очень длинный текст')))
  assert.ok(clipped.some((v) => v.key.includes('Применить длинный код')))
})

test('viewportOnly excludes elements below the viewport when auditing modal states', async () => {
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="height:200px"><span>Видимый блок</span></div>
    <div style="margin-top:1200px"><span>Скрытый за экраном</span></div>
  </body></html>`)
  const full = await page.evaluate(auditPage, { viewportOnly: false })
  const viewport = await page.evaluate(auditPage, { viewportOnly: true })
  assert.ok(full.elements.some((el) => el.key.includes('Скрытый за экраном')))
  assert.ok(!viewport.elements.some((el) => el.key.includes('Скрытый за экраном')))
  assert.ok(viewport.elements.some((el) => el.key.includes('Видимый блок')))
})

test('worsened violations are reported as introduced rather than hidden as preexisting', () => {
  const base: PageAudit = {
    elements: [],
    docWidth: 410,
    docHeight: 844,
    violations: [{ rule: 'page-overflow-x', key: 'document', message: 'горизонтальный скролл: 410 > 390 px' }],
  }
  const head: PageAudit = {
    elements: [],
    docWidth: 620,
    docHeight: 844,
    violations: [{ rule: 'page-overflow-x', key: 'document', message: 'горизонтальный скролл: 620 > 390 px' }],
  }
  const diff = diffViolations(base, head)
  assert.equal(diff.introduced.length, 1)
  assert.match(diff.introduced[0]!.title, /620 > 390/)
  assert.equal(diff.preexisting.length, 0)
  assert.equal(diff.fixed.length, 0)
})

test('readBaseScenarioNames extracts scenario names from base worktree or returns undefined when absent', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-scenarios-'))
  try {
    assert.equal(readBaseScenarioNames(dir), undefined)
    const scenariosFile = join(dir, 'frontend', 'scripts', 'verify', 'scenarios.ts')
    mkdirSync(join(dir, 'frontend', 'scripts', 'verify'), { recursive: true })
    writeFileSync(
      scenariosFile,
      `export const scenarios = [{ name: 'home', path: '/' }, { name: "menu-open", path: '/m/samokat' }]\n`,
    )
    const names = readBaseScenarioNames(dir)
    assert.deepEqual([...(names ?? [])].toSorted(), ['home', 'menu-open'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('detects visual glyph changes when geometry and accessible labels stay the same', async () => {
  const base = new PNG({ width: 32, height: 32 })
  base.data.fill(255)
  const head = PNG.sync.read(PNG.sync.write(base))
  for (let y = 8; y < 24; y++)
    for (let x = 8; x < 24; x++) {
      const offset = (y * 32 + x) * 4
      head.data[offset] = 0
      head.data[offset + 1] = 0
      head.data[offset + 2] = 0
    }
  const changed = diffPixels(PNG.sync.write(base), PNG.sync.write(head))
  assert.ok(changed.changed >= 200)
  assert.ok(changed.regions.some((r) => r.x <= 8 && r.y <= 8 && r.x + r.w >= 24 && r.y + r.h >= 24))
  assert.equal(diffPixels(PNG.sync.write(base), PNG.sync.write(base)).changed, 0)
})
