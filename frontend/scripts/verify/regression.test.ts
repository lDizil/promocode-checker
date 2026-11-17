import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { chromium, type Browser, type Page } from 'playwright'
import { PNG } from 'pngjs'
import { auditPage } from './audit.ts'
import { diffLayout, diffViolations } from './diff.ts'
import { diffPixels } from './pixels.ts'

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
