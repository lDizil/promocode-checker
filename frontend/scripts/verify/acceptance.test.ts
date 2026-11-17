import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const runner = resolve(import.meta.dirname, 'run.ts')

test('partial or stale reports cannot authorise a commit, and blanket acceptance is rejected', () => {
  const root = mkdtempSync(join(tmpdir(), 'ui-accept-test-'))
  try {
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    git('init', '-q')
    git(
      '-c',
      'user.name=Verifier',
      '-c',
      'user.email=verifier@example.invalid',
      'commit',
      '--allow-empty',
      '-m',
      'base',
    )
    mkdirSync(join(root, 'frontend', '.verify'), { recursive: true })
    const reportFile = join(root, 'frontend', '.verify', 'report.json')
    const stamp = join(root, 'frontend', '.verify', 'stamp.json')
    const base = { ref: 'HEAD', sha: git('rev-parse', 'HEAD') }
    const run = (...args: string[]) =>
      spawnSync(process.execPath, [runner, 'accept', ...args], { cwd: root, encoding: 'utf8' })
    writeFileSync(reportFile, JSON.stringify({ complete: false, base }))
    const partial = run()
    assert.notEqual(partial.status, 0)
    assert.match(partial.stderr, /Частичный/)
    assert.equal(existsSync(stamp), false)

    writeFileSync(reportFile, JSON.stringify({ complete: true, base, fingerprint: 'old' }))
    const stale = run('all=accept everything now')
    assert.notEqual(stale.status, 0)
    assert.match(stale.stderr, /изменились/)
    assert.equal(existsSync(stamp), false)

    // Compute fingerprint in a fresh process: git.ts resolves this isolated repository's cwd.
    const gitModule = resolve(import.meta.dirname, 'git.ts')
    const fingerprint = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import {uiFingerprint} from ${JSON.stringify(gitModule)};console.log(uiFingerprint('worktree'))`,
      ],
      { cwd: root, encoding: 'utf8' },
    ).trim()
    writeFileSync(
      reportFile,
      JSON.stringify({
        complete: true,
        base,
        fingerprint,
        createdAt: new Date().toISOString(),
        changes: [{ id: 'abc123', title: 'Resize requested control', details: [], crops: [] }],
        accepted: [],
        preexisting: [],
        fixed: [],
      }),
    )
    const blanket = run('all=all changes are intended')
    assert.notEqual(blanket.status, 0)
    assert.match(blanket.stderr, /неизвестный ID\/all/)
    assert.equal(existsSync(stamp), false)

    const intended = run('abc123=BR-813 explicitly requires this control size')
    assert.equal(intended.status, 0, intended.stderr)
    assert.equal(existsSync(stamp), true)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
