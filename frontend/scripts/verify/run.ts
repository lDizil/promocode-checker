import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, type Browser } from 'playwright'
import { PNG } from 'pngjs'

import { auditPage, type Violation } from './audit.ts'
import { diffLayout, diffViolations, mergeFindings, shortHash, type Change, type Finding } from './diff.ts'
import { git, repoRoot, uiFingerprint, verifyDir, stampPath, writeStamp, type Stamp } from './git.ts'
import { beforeAfter, diffPixels } from './pixels.ts'
import { scenarios, themes, viewports, type Scenario, type ViewportName } from './scenarios.ts'

const normalise = (text: string) => text.replace(/127\.0\.0\.1:\d+/g, 'localhost:PORT')

interface Report {
  fingerprint: string
  base: Stamp['base']
  createdAt: string
  complete: boolean
  changes: Change[]
  accepted: Stamp['accepted']
  preexisting: { scenario: string; violations: Violation[] }[]
  fixed: { scenario: string; violations: Violation[] }[]
}

const args = process.argv.slice(2)
const dir = verifyDir()
const reportPath = join(dir, 'report.json')

if (args[0] === 'accept') {
  if (!existsSync(reportPath)) throw new Error('Сначала pnpm verify:ui')
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as Report
  if (!report.complete) throw new Error('Частичный --only прогон не допускает коммит. Запустите полную проверку.')
  if (
    report.fingerprint !== uiFingerprint('worktree') ||
    report.base.sha !== git(['rev-parse', `${report.base.ref}^{commit}`])
  ) {
    throw new Error('Код или база изменились после проверки. Запустите pnpm verify:ui заново.')
  }
  for (const arg of args.slice(1)) {
    const split = arg.indexOf('=')
    const id = arg.slice(0, split)
    const reason = arg.slice(split + 1).trim()
    const change = report.changes.find((c) => c.id === id)
    if (split < 1 || !change || reason.length < 10 || /[\r\n]/.test(reason)) {
      throw new Error(
        `Нужно отдельное 'ID=почему изменение требуется задачей' (≥10 символов), неизвестный ID/all запрещён: ${arg}`,
      )
    }
    report.accepted = report.accepted.filter((a) => a.id !== id)
    report.accepted.push({ id, title: change.title, reason })
  }
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  finish(report)
} else {
  const unknown = args.filter(
    (arg, i) => !['--base', '--only'].includes(arg) && !['--base', '--only'].includes(args[i - 1] ?? ''),
  )
  if (unknown.length) throw new Error(`Неизвестные аргументы: ${unknown.join(' ')}`)
  const baseRef = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'HEAD'
  if (!baseRef || baseRef.startsWith('-')) throw new Error('Укажите commit/ref после --base')
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1]?.split(',') : undefined
  if (args.includes('--only') && !only) throw new Error('Укажите сценарии после --only')
  if (only?.some((name) => !scenarios.some((scenario) => scenario.name === name)))
    throw new Error('Неизвестный сценарий --only')
  const selected = scenarios.filter((s) => !only || only.includes(s.name))
  if (!selected.length) throw new Error('Нет сценариев')
  const fingerprint = uiFingerprint('worktree')
  const sha = git(['rev-parse', '--verify', `${baseRef}^{commit}`])
  mkdirSync(dir, { recursive: true })
  rmSync(stampPath(), { force: true })
  rmSync(reportPath, { force: true })
  const images = join(dir, 'images')
  rmSync(images, { recursive: true, force: true })
  mkdirSync(images)
  const temp = mkdtempSync(join(tmpdir(), 'promocode-verify-'))
  const worktree = join(temp, 'base')
  let browser: Browser | undefined
  const stopServers: (() => void)[] = []
  try {
    git(['worktree', 'add', '--detach', worktree, sha])
    console.log(`База ${baseRef} (${sha.slice(0, 8)}). Установка зависимостей базы…`)
    execFileSync('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts', '--prefer-offline'], {
      cwd: join(worktree, 'frontend'),
      stdio: 'inherit',
      timeout: 180_000,
    })
    const baseServer = await startServer(join(worktree, 'frontend'), join(dir, 'base-server.log'))
    stopServers.push(baseServer.stop)
    const headServer = await startServer(join(repoRoot(), 'frontend'), join(dir, 'head-server.log'))
    stopServers.push(headServer.stop)
    browser = await chromium.launch({ headless: true })
    const perScenario: { scenario: string; findings: Finding[] }[] = []
    const preexisting: Report['preexisting'] = []
    const fixed: Report['fixed'] = []
    for (const scenario of selected) {
      for (const viewport of scenario.viewports ?? (Object.keys(viewports) as ViewportName[])) {
        for (const theme of themes) {
          const name = `${scenario.name}-${viewport}-${theme}`
          console.log(`Проверка ${name}`)
          const base = await capture(browser, baseServer.url, scenario, viewport, theme)
          const head = await capture(browser, headServer.url, scenario, viewport, theme)
          writeFileSync(join(images, `${name}-base.png`), base.png)
          writeFileSync(join(images, `${name}-head.png`), head.png)
          const findings = diffLayout(base.audit, head.audit)
          const violations = diffViolations(base.audit, head.audit)
          findings.push(...violations.introduced)
          preexisting.push({ scenario: name, violations: violations.preexisting })
          fixed.push({ scenario: name, violations: violations.fixed })
          for (const error of new Set(head.errors.filter((e) => !base.errors.includes(e)))) {
            findings.push({
              id: shortHash('console', error),
              kind: 'console',
              title: `ОШИБКА: ${error}`,
              detail: error,
            })
          }
          const pixels = diffPixels(base.png, head.png)
          writeFileSync(join(images, `${name}-diff.png`), PNG.sync.write(pixels.diff))
          // Always report pixel changes; layout changes do not excuse a missing glyph nearby.
          if (pixels.changed > 0) {
            for (const [index, region] of pixels.regions.entries()) {
              const near = head.audit.elements
                .filter(
                  (el) =>
                    el.x < region.x + region.w &&
                    el.x + el.w > region.x &&
                    el.y < region.y + region.h &&
                    el.y + el.h > region.y,
                )
                .toSorted((a, b) => a.w * a.h - b.w * b.h)
                .slice(0, 3)
                .map((el) => el.key)
              findings.push({
                id: shortHash('pixels', name, index, region.x, region.y, region.w, region.h),
                kind: 'pixels',
                title: `ПИКСЕЛИ ${name}: область ${region.w}×${region.h} @ ${region.x},${region.y}`,
                detail: `Рядом: ${near.join('; ') || 'фон/неидентифицированный элемент'}`,
                base: region,
                head: region,
              })
            }
          }
          for (const finding of findings) {
            if (finding.base || finding.head) {
              writeFileSync(
                join(images, `${finding.id}-${name}.png`),
                beforeAfter(base.png, head.png, finding.base, finding.head),
              )
            }
          }
          perScenario.push({ scenario: name, findings })
          writeFileSync(join(dir, `${name}.json`), JSON.stringify({ base: base.audit, head: head.audit }, null, 2))
        }
      }
    }
    if (fingerprint !== uiFingerprint('worktree'))
      throw new Error('Код изменился во время проверки. Результат устарел.')
    const report: Report = {
      fingerprint,
      base: { ref: baseRef, sha },
      createdAt: new Date().toISOString(),
      complete: !only,
      changes: mergeFindings(perScenario),
      accepted: [],
      preexisting,
      fixed,
    }
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    finish(report)
  } finally {
    await browser?.close()
    for (const stop of stopServers) stop()
    if (existsSync(worktree)) git(['worktree', 'remove', '--force', worktree])
    rmSync(temp, { recursive: true, force: true })
  }
}

function finish(report: Report) {
  const pending = report.changes.filter((c) => !report.accepted.some((a) => a.id === c.id))
  const lines = [
    '# UI verification',
    '',
    `Base: ${report.base.ref} (${report.base.sha.slice(0, 8)}). Fingerprint: ${report.fingerprint}.`,
    '',
    `Изменений: ${report.changes.length}; требуют решения: ${pending.length}.`,
    '',
    '**Слева было, справа стало.** Не принимайте изменения, которых нет в задаче. База — не доказательство соответствия Figma.',
    '',
  ]
  for (const change of report.changes) {
    const accepted = report.accepted.find((a) => a.id === change.id)
    lines.push(
      `## ${change.id} — ${change.title}`,
      '',
      accepted ? `Принято: ${accepted.reason}` : '**Требует решения**',
      '',
      ...change.details.map((d) => `- ${d}`),
      '',
    )
    const crop = change.crops.find((c) => c.base || c.head)
    if (crop) lines.push(`![Было / стало](images/${change.id}-${crop.scenario}.png)`, '')
  }
  lines.push('## Существовавшие нарушения (не введены изменением)', '')
  for (const { scenario, violations } of report.preexisting) {
    for (const v of violations) lines.push(`- ${scenario}: ${v.rule}: ${v.key} — ${v.message}`)
  }
  lines.push('', '## Исправленные нарушения', '')
  for (const { scenario, violations } of report.fixed) {
    for (const v of violations) lines.push(`- ${scenario}: ${v.rule}: ${v.key}`)
  }
  writeFileSync(join(dir, 'report.md'), lines.join('\n'))
  console.log(`\n${pending.length ? 'FAIL' : 'PASS'}: ${pending.length} требуют решения. .verify/report.md`)
  for (const change of pending) console.log(`  ${change.id} ${change.title}`)
  if (pending.length) {
    console.log(
      "Исправьте неожиданные изменения. Намеренные: pnpm verify:ui accept 'ID=причина из задачи' (каждое отдельно).",
    )
    process.exitCode = 1
  } else if (report.complete) {
    const value: Stamp = {
      fingerprint: report.fingerprint,
      base: report.base,
      accepted: report.accepted,
      createdAt: report.createdAt,
    }
    writeStamp(value)
    console.log('Свежая проверка записана в .verify/stamp.json')
  }
}

async function capture(
  browser: Browser,
  url: string,
  scenario: Scenario,
  viewport: ViewportName,
  theme: 'light' | 'dark',
) {
  const context = await browser.newContext({
    viewport: viewports[viewport],
    colorScheme: theme,
    reducedMotion: 'reduce',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  })
  try {
    await context.addCookies([{ name: 'theme', value: theme, url }])
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(normalise(error.message)))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(normalise(message.text()))
    })
    page.on('response', (response) => {
      if (response.status() >= 500) errors.push(`HTTP ${response.status()} ${normalise(response.url())}`)
    })
    await page.goto(`${url}${scenario.path}`, { waitUntil: 'networkidle', timeout: 60_000 })
    await page.locator('main').waitFor({ state: 'visible' })
    await page.addStyleTag({
      content:
        '*,*::before,*::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
    })
    await scenario.steps?.(page)
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page.evaluate(async () => {
      const { promise, resolve } = Promise.withResolvers<void>()
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      await promise
    })
    const audit = await page.evaluate(auditPage, null)
    // A modal locks the background: content below the viewport is not part of that user state.
    // Full-page capture there asks Chromium to rasterize offscreen text behind a fixed overlay,
    // which can produce compositor-only differences. Ordinary page scenarios cover the full page.
    const modalOpen = (await page.locator('[aria-modal="true"]:visible, dialog:modal').count()) > 0
    const png = await page.screenshot({ fullPage: !modalOpen, animations: 'disabled' })
    return { audit, png, errors }
  } finally {
    await context.close()
  }
}

async function startServer(cwd: string, logPath: string) {
  const { promise, resolve, reject } = Promise.withResolvers<number>()
  const server = createServer()
  server.on('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') return reject(new Error('Нет порта'))
    server.close(() => resolve(address.port))
  })
  const port = await promise
  const child = spawn('pnpm', ['dev', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd,
    detached: true,
    env: { ...process.env, VITE_API_MOCKS: 'on' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (data: Buffer) => {
    log += data.toString()
  })
  child.stderr.on('data', (data: Buffer) => {
    log += data.toString()
  })
  let spawnError: Error | undefined
  child.on('error', (error) => {
    spawnError = error
  })
  const url = `http://127.0.0.1:${port}`
  const stop = () => {
    writeFileSync(logPath, log)
    if (child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error
      }
    }
  }
  try {
    const deadline = Date.now() + 90_000
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError
      if (child.exitCode !== null) throw new Error(`Dev server exited ${child.exitCode}\n${log}`)
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
        if (response.ok) return { url, stop }
      } catch {
        /* wait for listener */
      }
      await delay(200)
    }
    throw new Error(`Dev server timeout\n${log}`)
  } catch (error) {
    stop()
    throw error
  }
}
