import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test, { type TestContext } from 'node:test'
import { fileURLToPath } from 'node:url'

import { appendVerificationTrailers, verificationTrailers } from './gate.ts'
import type { Stamp } from './git.ts'

const verifyDir = dirname(fileURLToPath(import.meta.url))
const gatePath = join(verifyDir, 'gate.ts')
const node = process.execPath
const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null'

const UI = 'frontend/src/Button.tsx'
const STORIES = 'frontend/src/Button.stories.tsx'
const SCENARIOS = 'frontend/scripts/verify/scenarios.ts'
const SCENARIOS_TEST = 'frontend/scripts/verify/scenarios.test.ts'
const PACKAGE = 'frontend/package.json'
const LOCKFILE = 'frontend/pnpm-lock.yaml'
const DOC = 'docs/readme.md'
const STAMP = 'frontend/.verify/stamp.json'

const ACCEPTED = [{ id: 'change-1', title: 'Button height', reason: 'reviewed' }]

type Env = NodeJS.ProcessEnv

function testEnv(repo: string): Env {
  const env: Env = { ...process.env }
  for (const key of [
    'GIT_DIR',
    'GIT_WORK_TREE',
    'GIT_INDEX_FILE',
    'GIT_OBJECT_DIRECTORY',
    'GIT_ALTERNATE_OBJECT_DIRECTORIES',
    'GIT_NAMESPACE',
    'GIT_COMMON_DIR',
    'GIT_CEILING_DIRECTORIES',
    'GIT_CONFIG_COUNT',
    'GIT_CONFIG_PARAMETERS',
    'GIT_DISCOVERY_ACROSS_FILESYSTEM',
    'NODE_TEST_CONTEXT',
  ]) {
    delete env[key]
  }
  env['HOME'] = repo
  env['GIT_CONFIG_GLOBAL'] = nullDevice
  env['GIT_CONFIG_SYSTEM'] = nullDevice
  env['GIT_CONFIG_NOSYSTEM'] = '1'
  env['GIT_ATTR_NOSYSTEM'] = '1'
  env['GIT_AUTHOR_NAME'] = 'Verify Test'
  env['GIT_AUTHOR_EMAIL'] = 'verify@example.com'
  env['GIT_COMMITTER_NAME'] = 'Verify Test'
  env['GIT_COMMITTER_EMAIL'] = 'verify@example.com'
  env['GIT_AUTHOR_DATE'] = '2026-11-17T00:00:00Z'
  env['GIT_COMMITTER_DATE'] = '2026-11-17T00:00:00Z'
  return env
}

interface TestRepo {
  dir: string
  write: (path: string, content: string) => void
  read: (path: string) => string
  git: (...args: string[]) => string
  stage: (...paths: string[]) => void
  head: () => string
  runGate: (...args: string[]) => { status: number | null; stdout: string; stderr: string }
  fingerprint: (source: 'worktree' | 'index') => string
  writeStamp: (accepted?: Stamp['accepted'], fingerprintValue?: string, createdAt?: string) => Stamp
}

function makeRepo(t: TestContext): TestRepo {
  const dir = mkdtempSync(join(tmpdir(), 'verify-gate-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const env = testEnv(dir)

  const write = (path: string, content: string): void => {
    const file = join(dir, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content, 'utf8')
  }
  const read = (path: string): string => readFileSync(join(dir, path), 'utf8')
  const git = (...args: string[]): string => {
    const result = spawnSync('git', args, { cwd: dir, env, encoding: 'utf8' })
    assert.equal(result.status, 0, `git ${args.join(' ')}\n${String(result.stderr ?? '')}`)
    return String(result.stdout ?? '').trim()
  }
  const stage = (...paths: string[]): void => {
    git('add', '--', ...paths)
  }
  const head = (): string => git('rev-parse', 'HEAD')
  const runGate = (...args: string[]) => {
    const result = spawnSync(node, [gatePath, ...args], { cwd: dir, env, encoding: 'utf8' })
    return { status: result.status, stdout: String(result.stdout ?? ''), stderr: String(result.stderr ?? '') }
  }
  const fingerprint = (source: 'worktree' | 'index'): string => {
    const result = runGate('fingerprint', source)
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  const writeStamp = (
    accepted: Stamp['accepted'] = ACCEPTED,
    fingerprintValue = fingerprint('worktree'),
    createdAt = '2026-11-17T00:00:00.000Z',
  ): Stamp => {
    const stamp: Stamp = {
      fingerprint: fingerprintValue,
      base: { ref: 'main', sha: head() },
      accepted,
      createdAt,
    }
    write(STAMP, `${JSON.stringify(stamp, null, 2)}\n`)
    return stamp
  }

  git('init', '-q', '-b', 'main')
  git('config', 'user.name', 'Verify Test')
  git('config', 'user.email', 'verify@example.com')
  git('config', 'commit.gpgsign', 'false')
  write(UI, 'export const Button = () => <button>Base</button>\n')
  write(STORIES, "import { Button } from './Button'\n\nexport default { component: Button }\n")
  write(SCENARIOS, "export const scenarios = ['home']\n")
  write(SCENARIOS_TEST, "import test from 'node:test'\n\ntest('scenario fixture', () => {})\n")
  write(PACKAGE, '{"name":"verify-fixture","private":true}\n')
  write(LOCKFILE, "lockfileVersion: '9.0'\n")
  write(DOC, '# Fixture\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'initial')
  return { dir, write, read, git, stage, head, runGate, fingerprint, writeStamp }
}

test('missing stamp blocks a staged UI change', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /нет frontend\/\.verify\/stamp\.json/)
})

test('stale stamp blocks a staged UI change', (t) => {
  const repo = makeRepo(t)
  const old = repo.writeStamp()

  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
  assert.match(result.stderr, new RegExp(old.fingerprint))
})

test('matching worktree and index pass', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  repo.writeStamp()

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '')
})

test('a later staged UI edit invalidates a previously valid stamp', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  repo.writeStamp()

  repo.write(UI, 'export const Button = () => <button>Changed again</button>\n')
  repo.stage(UI)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
})

test('a later staged verifier edit invalidates a previously valid stamp', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  repo.writeStamp()

  repo.write(SCENARIOS, "export const scenarios = ['home', 'merchant']\n")
  repo.stage(SCENARIOS)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
})

test('staged package and lockfile edits invalidate a previously valid stamp', (t) => {
  for (const path of [PACKAGE, LOCKFILE]) {
    const repo = makeRepo(t)
    repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
    repo.stage(UI)
    repo.writeStamp()

    const content =
      path === PACKAGE
        ? '{"name":"verify-fixture","private":true,"sideEffects":false}\n'
        : "lockfileVersion: '9.0'\nsettings: {}\n"
    repo.write(path, content)
    repo.stage(path)

    const result = repo.runGate('pre-commit')
    assert.equal(result.status, 1, `${path}: ${result.stderr}`)
    assert.match(result.stderr, /stamp устарел/)
  }
})

test('a moved base ref invalidates even when the fingerprint matches', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  const stamp = repo.writeStamp()

  repo.git('reset')
  repo.git('commit', '-q', '--allow-empty', '-m', 'move base')
  repo.stage(UI)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /база сдвинулась после проверки/)
  assert.match(result.stderr, new RegExp(stamp.base.sha))
})

test('partial staging is blocked even when the stamp matches the index', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Staged</button>\n')
  repo.stage(UI)
  repo.writeStamp()

  repo.write(UI, 'export const Button = () => <button>Unstaged</button>\n')

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /индекс и рабочее дерево расходятся/)
  assert.match(result.stderr, /frontend\/src\/Button\.tsx/)
})

test('tests and stories are not gated', (t) => {
  const repo = makeRepo(t)
  repo.write(STORIES, "import { Button } from './Button'\n\nexport default { component: Button, title: 'Changed' }\n")
  repo.write(SCENARIOS_TEST, "import test from 'node:test'\n\ntest('changed fixture', () => {})\n")
  repo.stage(STORIES, SCENARIOS_TEST)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 0, result.stderr)
})

test('merge commits are exempt', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Merge</button>\n')
  repo.stage(UI)
  repo.write('.git/MERGE_HEAD', `${repo.head()}\n`)

  const result = repo.runGate('pre-commit')
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /merge commit/)
})

test('trailers are appended to a verified UI commit before message comments', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  const stamp = repo.writeStamp()
  const message = [
    'BR-813: fix button',
    '',
    'Body line.',
    '',
    '# Please enter the commit message for your changes.',
    '# Lines starting with # will be ignored.',
    '',
  ].join('\n')
  repo.write('message.txt', message)

  const result = repo.runGate('prepare-commit-msg', 'message.txt', 'message')
  assert.equal(result.status, 0, result.stderr)
  const saved = repo.read('message.txt')
  assert.match(saved, /^BR-813: fix button$/m)
  assert.match(saved, /^Body line\.$/m)
  assert.match(saved, new RegExp(`^Verified-Fingerprint: ${stamp.fingerprint}$`, 'm'))
  assert.match(saved, /^Verified-Base: main@[0-9a-f]+$/m)
  assert.match(saved, /^Verified-Change: \{"id":"change-1","title":"Button height","reason":"reviewed"\}$/m)
  assert.ok(saved.indexOf('Verified-Fingerprint') < saved.indexOf('# Please enter'))

  // A subsequent commit-msg run is idempotent and does not duplicate trailers.
  const commitMsg = repo.runGate('commit-msg', 'message.txt')
  assert.equal(commitMsg.status, 0, commitMsg.stderr)
  assert.equal(repo.read('message.txt'), saved)
})

test('interactive commits receive trailers via commit-msg after the editor saves a message', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  const stamp = repo.writeStamp()
  const template = '# Please enter the commit message for your changes.\n'
  repo.write('message.txt', template)

  const prepare = repo.runGate('prepare-commit-msg', 'message.txt')
  assert.equal(prepare.status, 0, prepare.stderr)
  assert.equal(repo.read('message.txt'), template)

  repo.write('message.txt', `BR-813: interactive commit\n\n${template}`)
  const commitMsg = repo.runGate('commit-msg', 'message.txt')
  assert.equal(commitMsg.status, 0, commitMsg.stderr)
  const saved = repo.read('message.txt')
  assert.match(saved, /^BR-813: interactive commit$/m)
  assert.match(saved, new RegExp(`^Verified-Fingerprint: ${stamp.fingerprint}$`, 'm'))
})

test('stale trailers from --amend are replaced with the fresh stamp trailers', (t) => {
  const repo = makeRepo(t)
  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  const stamp = repo.writeStamp()
  const message = [
    'BR-813: fix button',
    '',
    'Verified-Fingerprint: 0123456789abcdef',
    'Verified-Base: main@0000000',
    'Verified-At: 2026-11-16T00:00:00.000Z',
    'Verified-Change: {"id":"old","title":"Old","reason":"stale"}',
    '',
  ].join('\n')
  repo.write('message.txt', message)

  const result = repo.runGate('prepare-commit-msg', 'message.txt', 'commit', 'HEAD')
  assert.equal(result.status, 0, result.stderr)
  const saved = repo.read('message.txt')
  assert.doesNotMatch(saved, /0123456789abcdef/)
  assert.doesNotMatch(saved, /"id":"old"/)
  assert.match(saved, new RegExp(`^Verified-Fingerprint: ${stamp.fingerprint}$`, 'm'))
  assert.match(saved, /^Verified-Change: \{"id":"change-1","title":"Button height","reason":"reviewed"\}$/m)
})

test('trailers are not appended to unrelated or merge commits', (t) => {
  const repo = makeRepo(t)
  repo.write(DOC, '# Fixture changed\n')
  repo.stage(DOC)
  const docsMessage = 'BR-813: docs only\n'
  repo.write('docs-message.txt', docsMessage)

  const docsResult = repo.runGate('prepare-commit-msg', 'docs-message.txt', 'message')
  assert.equal(docsResult.status, 0, docsResult.stderr)
  assert.equal(repo.read('docs-message.txt'), docsMessage)

  repo.write(UI, 'export const Button = () => <button>Changed</button>\n')
  repo.stage(UI)
  repo.writeStamp()
  const mergeMessage = 'BR-813: merge branch\n'
  repo.write('merge-message.txt', mergeMessage)
  const mergeResult = repo.runGate('prepare-commit-msg', 'merge-message.txt', 'merge')
  assert.equal(mergeResult.status, 0, mergeResult.stderr)
  assert.equal(repo.read('merge-message.txt'), mergeMessage)
})

test('trailer helpers keep the body, update stale trailers, and preserve empty messages', (t) => {
  const stamp: Stamp = {
    fingerprint: '0123456789abcdef',
    base: { ref: 'main', sha: 'a'.repeat(40) },
    accepted: ACCEPTED,
    createdAt: '2026-11-17T00:00:00.000Z',
  }
  assert.deepEqual(verificationTrailers(stamp), [
    'Verified-Fingerprint: 0123456789abcdef',
    `Verified-Base: main@${'a'.repeat(40)}`,
    'Verified-At: 2026-11-17T00:00:00.000Z',
    'Verified-Change: {"id":"change-1","title":"Button height","reason":"reviewed"}',
  ])

  const dir = mkdtempSync(join(tmpdir(), 'verify-message-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const file = join(dir, 'message.txt')
  writeFileSync(file, 'Subject\n', 'utf8')
  assert.equal(appendVerificationTrailers(file, stamp), 'added')
  assert.equal(appendVerificationTrailers(file, stamp), 'unchanged')

  const updatedStamp: Stamp = { ...stamp, fingerprint: 'fedcba9876543210' }
  assert.equal(appendVerificationTrailers(file, updatedStamp), 'updated')
  const saved = readFileSync(file, 'utf8')
  assert.match(saved, /^Subject\n\nVerified-Fingerprint: fedcba9876543210\n/m)

  const emptyFile = join(dir, 'empty.txt')
  writeFileSync(emptyFile, '# Only comments\n', 'utf8')
  assert.equal(appendVerificationTrailers(emptyFile, stamp), 'skipped-empty')
  assert.equal(readFileSync(emptyFile, 'utf8'), '# Only comments\n')
})
