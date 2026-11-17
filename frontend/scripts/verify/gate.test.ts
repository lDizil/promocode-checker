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

function write(repo: string, path: string, content: string): void {
  const file = join(repo, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content, 'utf8')
}

function gitResult(repo: string, env: Env, args: string[]) {
  const result = spawnSync('git', args, { cwd: repo, env, encoding: 'utf8' })
  return { status: result.status, stdout: String(result.stdout ?? ''), stderr: String(result.stderr ?? '') }
}

function git(repo: string, env: Env, args: string[]): string {
  const result = gitResult(repo, env, args)
  assert.equal(result.status, 0, `git ${args.join(' ')}\n${result.stderr}`)
  return result.stdout.trim()
}

function stage(repo: string, env: Env, ...paths: string[]): void {
  git(repo, env, ['add', '--', ...paths])
}

function head(repo: string, env: Env): string {
  return git(repo, env, ['rev-parse', 'HEAD'])
}

function runGate(repo: string, env: Env, args: string[]) {
  const result = spawnSync(node, [gatePath, ...args], { cwd: repo, env, encoding: 'utf8' })
  return { status: result.status, stdout: String(result.stdout ?? ''), stderr: String(result.stderr ?? '') }
}

function fingerprint(repo: string, env: Env, source: 'worktree' | 'index'): string {
  const result = runGate(repo, env, ['fingerprint', source])
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function makeRepo(t: TestContext): { repo: string; env: Env } {
  const repo = mkdtempSync(join(tmpdir(), 'verify-gate-'))
  t.after(() => rmSync(repo, { recursive: true, force: true }))
  const env = testEnv(repo)
  git(repo, env, ['init', '-q', '-b', 'main'])
  git(repo, env, ['config', 'user.name', 'Verify Test'])
  git(repo, env, ['config', 'user.email', 'verify@example.com'])
  git(repo, env, ['config', 'commit.gpgsign', 'false'])
  write(repo, UI, 'export const Button = () => <button>Base</button>\n')
  write(repo, STORIES, "import { Button } from './Button'\n\nexport default { component: Button }\n")
  write(repo, SCENARIOS, "export const scenarios = ['home']\n")
  write(repo, SCENARIOS_TEST, "import test from 'node:test'\n\ntest('scenario fixture', () => {})\n")
  write(repo, PACKAGE, '{"name":"verify-fixture","private":true}\n')
  write(repo, LOCKFILE, "lockfileVersion: '9.0'\n")
  write(repo, DOC, '# Fixture\n')
  git(repo, env, ['add', '-A'])
  git(repo, env, ['commit', '-q', '-m', 'initial'])
  return { repo, env }
}

function writeStamp(
  repo: string,
  env: Env,
  accepted: Stamp['accepted'] = ACCEPTED,
  fingerprintValue = fingerprint(repo, env, 'worktree'),
  createdAt = '2026-11-17T00:00:00.000Z',
): Stamp {
  const stamp: Stamp = {
    fingerprint: fingerprintValue,
    base: { ref: 'main', sha: head(repo, env) },
    accepted,
    createdAt,
  }
  write(repo, STAMP, `${JSON.stringify(stamp, null, 2)}\n`)
  return stamp
}

test('missing stamp blocks a staged UI change', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /нет frontend\/\.verify\/stamp\.json/)
})

test('stale stamp blocks a staged UI change', (t) => {
  const { repo, env } = makeRepo(t)
  const old = writeStamp(repo, env)

  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
  assert.match(result.stderr, new RegExp(old.fingerprint))
})

test('matching worktree and index pass', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '')
})

test('a later staged UI edit invalidates a previously valid stamp', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)

  write(repo, UI, 'export const Button = () => <button>Changed again</button>\n')
  stage(repo, env, UI)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
})

test('a later staged verifier edit invalidates a previously valid stamp', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)

  write(repo, SCENARIOS, "export const scenarios = ['home', 'merchant']\n")
  stage(repo, env, SCENARIOS)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /stamp устарел/)
})

test('staged package and lockfile edits invalidate a previously valid stamp', (t) => {
  for (const path of [PACKAGE, LOCKFILE]) {
    const { repo, env } = makeRepo(t)
    write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
    stage(repo, env, UI)
    writeStamp(repo, env)

    const content =
      path === PACKAGE
        ? '{"name":"verify-fixture","private":true,"sideEffects":false}\n'
        : "lockfileVersion: '9.0'\nsettings: {}\n"
    write(repo, path, content)
    stage(repo, env, path)

    const result = runGate(repo, env, ['pre-commit'])
    assert.equal(result.status, 1, `${path}: ${result.stderr}`)
    assert.match(result.stderr, /stamp устарел/)
  }
})

test('a moved base ref invalidates even when the fingerprint matches', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  const stamp = writeStamp(repo, env)

  git(repo, env, ['reset'])
  git(repo, env, ['commit', '-q', '--allow-empty', '-m', 'move base'])
  stage(repo, env, UI)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /база сдвинулась после проверки/)
  assert.match(result.stderr, new RegExp(stamp.base.sha))
})

test('partial staging is blocked even when the stamp matches the index', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Staged</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)

  write(repo, UI, 'export const Button = () => <button>Unstaged</button>\n')

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /индекс и рабочее дерево расходятся/)
  assert.match(result.stderr, /frontend\/src\/Button\.tsx/)
})

test('tests and stories are not gated', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, STORIES, "import { Button } from './Button'\n\nexport default { component: Button, title: 'Changed' }\n")
  write(repo, SCENARIOS_TEST, "import test from 'node:test'\n\ntest('changed fixture', () => {})\n")
  stage(repo, env, STORIES, SCENARIOS_TEST)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 0, result.stderr)
})

test('merge commits are exempt', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Merge</button>\n')
  stage(repo, env, UI)
  write(repo, '.git/MERGE_HEAD', `${head(repo, env)}\n`)

  const result = runGate(repo, env, ['pre-commit'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /merge commit/)
})

test('trailers are appended to a verified UI commit before message comments', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  const stamp = writeStamp(repo, env)
  const message = [
    'BR-813: fix button',
    '',
    'Body line.',
    '',
    '# Please enter the commit message for your changes.',
    '# Lines starting with # will be ignored.',
    '',
  ].join('\n')
  write(repo, 'message.txt', message)

  const result = runGate(repo, env, ['prepare-commit-msg', 'message.txt', 'message'])
  assert.equal(result.status, 0, result.stderr)
  const saved = readFileSync(join(repo, 'message.txt'), 'utf8')
  assert.match(saved, /^BR-813: fix button$/m)
  assert.match(saved, /^Body line\.$/m)
  assert.match(saved, new RegExp(`^Verified-Fingerprint: ${stamp.fingerprint}$`, 'm'))
  assert.match(saved, /^Verified-Base: main@[0-9a-f]+$/m)
  assert.match(saved, /^Verified-Change: \{"id":"change-1","title":"Button height","reason":"reviewed"\}$/m)
  assert.ok(saved.indexOf('Verified-Fingerprint') < saved.indexOf('# Please enter'))
})

test('trailers are not appended to unrelated or merge commits', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, DOC, '# Fixture changed\n')
  stage(repo, env, DOC)
  const docsMessage = 'BR-813: docs only\n'
  write(repo, 'docs-message.txt', docsMessage)

  const docsResult = runGate(repo, env, ['prepare-commit-msg', 'docs-message.txt', 'message'])
  assert.equal(docsResult.status, 0, docsResult.stderr)
  assert.equal(readFileSync(join(repo, 'docs-message.txt'), 'utf8'), docsMessage)

  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)
  const mergeMessage = 'BR-813: merge branch\n'
  write(repo, 'merge-message.txt', mergeMessage)
  const mergeResult = runGate(repo, env, ['prepare-commit-msg', 'merge-message.txt', 'merge'])
  assert.equal(mergeResult.status, 0, mergeResult.stderr)
  assert.equal(readFileSync(join(repo, 'merge-message.txt'), 'utf8'), mergeMessage)
})

test('existing managed trailers are not duplicated', (t) => {
  const { repo, env } = makeRepo(t)
  write(repo, UI, 'export const Button = () => <button>Changed</button>\n')
  stage(repo, env, UI)
  writeStamp(repo, env)
  const message = 'BR-813: fix button\n\nVerified-Fingerprint: 0123456789abcdef\n'
  write(repo, 'message.txt', message)

  const result = runGate(repo, env, ['prepare-commit-msg', 'message.txt', 'message'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(join(repo, 'message.txt'), 'utf8'), message)
  assert.match(result.stderr, /уже есть Verified-трейлеры/)
})

test('trailer helpers keep the body and encode accepted changes', (t) => {
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
  const saved = readFileSync(file, 'utf8')
  assert.match(saved, /^Subject\n\nVerified-Fingerprint: 0123456789abcdef\n/m)
})

test('an empty message body is not turned into a message', (t) => {
  const stamp: Stamp = {
    fingerprint: '0123456789abcdef',
    base: { ref: 'main', sha: 'b'.repeat(40) },
    accepted: [],
    createdAt: '2026-11-17T00:00:00.000Z',
  }
  const dir = mkdtempSync(join(tmpdir(), 'verify-message-empty-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const file = join(dir, 'message.txt')
  writeFileSync(file, '# Only comments\n', 'utf8')
  assert.equal(appendVerificationTrailers(file, stamp), 'skipped-empty')
  assert.equal(readFileSync(file, 'utf8'), '# Only comments\n')
})
