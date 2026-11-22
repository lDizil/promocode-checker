/**
 * Commit gate: a commit touching UI or verifier inputs must match the exact tree that
 * `pnpm verify:ui` audited. Git hooks call this file directly; hooks are installed only by an
 * explicit package script (`install`), never automatically.
 */
import { accessSync, constants, existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  commitExists,
  fingerprintEntries,
  fingerprintOf,
  git,
  gitOptional,
  isAncestor,
  readStamp,
  repoRoot,
  resolveCommit,
  stagedFingerprintFiles,
  stagedUnmergedFiles,
  uiFingerprint,
} from './git.ts'
import type { Stamp } from './git.ts'

export type GateMode = 'enforce' | 'observe' | 'off'

export type GateReason =
  | 'off'
  | 'merge'
  | 'no-gated-files'
  | 'valid'
  | 'unmerged'
  | 'missing-stamp'
  | 'invalid-stamp'
  | 'tree-mismatch'
  | 'stale-stamp'
  | 'base-mismatch'

export interface GateResult {
  /** Whether the pre-commit hook may let the commit through. */
  allow: boolean
  /** Whether the staged tree is verified and commit trailers may be written. */
  verified: boolean
  mode: GateMode
  reason: GateReason
  /** Staged files that made the gate applicable. */
  files: string[]
  detail: string
  stamp?: Stamp
  fingerprint?: string
}

const HOOKS_DIR = '.githooks'
const HOOKS = ['pre-commit', 'prepare-commit-msg', 'commit-msg'] as const
const STAMP_FILE = 'frontend/.verify/stamp.json'
const MANAGED_TRAILER_LINE = /^Verified-(?:Fingerprint|Base|At|Change):/

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error))

const listFiles = (files: string[], limit = 20): string => {
  const shown = files.slice(0, limit).map((file) => `  - ${file}`)
  if (files.length > limit) shown.push(`  - … и ещё ${files.length - limit}`)
  return shown.join('\n')
}

export function readGateMode(): GateMode {
  const configured = gitOptional(['config', '--get', 'verify.mode'])
  if (configured === undefined || configured === '') return 'enforce'
  const mode = configured.trim().toLowerCase()
  if (mode === 'enforce' || mode === 'observe' || mode === 'off') return mode
  throw new Error(`verify.mode=«${configured}» неизвестен; допустимо enforce, observe или off`)
}

export function mergeInProgress(): boolean {
  const mergeHead = git(['rev-parse', '--git-path', 'MERGE_HEAD'])
  return existsSync(resolve(repoRoot(), mergeHead))
}

function treeDifferences(index: ReadonlyMap<string, string>, worktree: ReadonlyMap<string, string>): string[] {
  const paths = new Set([...index.keys(), ...worktree.keys()])
  const differences: string[] = []
  for (const path of [...paths].toSorted()) {
    const staged = index.get(path)
    const disk = worktree.get(path)
    if (staged === undefined) differences.push(`${path} (нет в индексе)`)
    else if (disk === undefined) differences.push(`${path} (нет в рабочем дереве)`)
    else if (staged !== disk) differences.push(`${path} (содержимое не совпадает)`)
  }
  return differences
}

/**
 * Pure evaluation used by the hook and by tests. In `observe` mode problems are returned with
 * `allow: true`; in `enforce` mode they block. Missing or malformed stamps always count as problems.
 */
export function evaluateGate(mode: GateMode = readGateMode()): GateResult {
  const skip = (reason: GateReason, detail: string): GateResult => ({
    allow: true,
    verified: false,
    mode,
    reason,
    files: [],
    detail,
  })
  const problem = (
    reason: GateReason,
    detail: string,
    files: string[],
    extra: Partial<Pick<GateResult, 'stamp' | 'fingerprint'>> = {},
  ): GateResult => ({
    allow: mode !== 'enforce',
    verified: false,
    mode,
    reason,
    files,
    detail,
    ...extra,
  })

  if (mode === 'off') return skip('off', 'проверка отключена (verify.mode=off)')
  if (mergeInProgress()) return skip('merge', 'merge commit — проверка UI пропущена')

  const unmerged = stagedUnmergedFiles()
  if (unmerged.length > 0) {
    return problem(
      'unmerged',
      `в индексе остались неразрешённые конфликты по проверяемым файлам:\n${listFiles(unmerged)}\nЗавершите merge и разрешите конфликты.`,
      unmerged,
    )
  }

  const files = stagedFingerprintFiles()
  if (files.length === 0) return skip('no-gated-files', 'нет изменений в UI или проверочных файлах')

  let stamp: Stamp | undefined
  try {
    stamp = readStamp()
  } catch (error) {
    return problem(
      'invalid-stamp',
      `${STAMP_FILE} не читается: ${errorText(error)}\nПересоздайте stamp: запустите \`pnpm verify:ui\`.`,
      files,
    )
  }
  if (!stamp) {
    return problem(
      'missing-stamp',
      `нет ${STAMP_FILE} для изменённых UI/проверочных файлов.\nЗапустите \`pnpm verify:ui\`, примите изменения и повторите коммит.`,
      files,
    )
  }

  const indexEntries = fingerprintEntries('index')
  const worktreeEntries = fingerprintEntries('worktree')
  const indexFingerprint = fingerprintOf(indexEntries)
  const differences = treeDifferences(indexEntries, worktreeEntries)
  if (differences.length > 0) {
    return problem(
      'tree-mismatch',
      `индекс и рабочее дерево расходятся по проверяемым файлам:\n${listFiles(differences)}\nПриведите индекс и рабочее дерево к одному состоянию (git add …) и повторите коммит; если файлы менялись после проверки — запустите \`pnpm verify:ui\` заново.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }

  if (stamp.fingerprint !== indexFingerprint) {
    return problem(
      'stale-stamp',
      `stamp устарел: проверено ${stamp.fingerprint}, в индексе ${indexFingerprint}.\nЗапустите \`pnpm verify:ui\`, примите изменения и повторите коммит.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }

  const resolvedBase = resolveCommit(stamp.base.ref)
  if (resolvedBase === undefined) {
    return problem(
      'base-mismatch',
      `stamp.base.ref «${stamp.base.ref}» больше не резолвится в коммит; база проверки потеряна.\nПерезапустите \`pnpm verify:ui\`.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }
  if (resolvedBase !== stamp.base.sha) {
    return problem(
      'base-mismatch',
      `stamp.base.ref «${stamp.base.ref}» теперь указывает на ${resolvedBase}, а проверка сделана на ${stamp.base.sha}; база сдвинулась после проверки.\nПерезапустите \`pnpm verify:ui\`.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }
  if (!commitExists(stamp.base.sha)) {
    return problem(
      'base-mismatch',
      `stamp.base ${stamp.base.ref}@${stamp.base.sha} отсутствует в текущей истории; stamp сделан на другом дереве.\nПерезапустите \`pnpm verify:ui\`.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }
  if (!isAncestor(stamp.base.sha)) {
    return problem(
      'base-mismatch',
      `stamp сделан на ${stamp.base.ref}@${stamp.base.sha}, который не является предком HEAD (rebase или другая ветка).\nПерезапустите \`pnpm verify:ui\`.`,
      files,
      { stamp, fingerprint: indexFingerprint },
    )
  }

  return {
    allow: true,
    verified: true,
    mode,
    reason: 'valid',
    files,
    detail: `проверка пройдена: ${indexFingerprint}, принято изменений: ${stamp.accepted.length}`,
    stamp,
    fingerprint: indexFingerprint,
  }
}

function describeGateResult(result: GateResult): string {
  const label = result.mode === 'observe' ? 'verify gate (observe)' : 'verify gate'
  const files = result.files.length > 0 ? `\nПроверяемые файлы в индексе:\n${listFiles(result.files)}` : ''
  return `${label}: ${result.detail}${files}`
}

export function runPreCommit(mode: GateMode = readGateMode()): number {
  const result = evaluateGate(mode)
  if (mode === 'observe') {
    if (result.reason !== 'off' && result.reason !== 'no-gated-files' && result.reason !== 'merge') {
      process.stderr.write(`${describeGateResult(result)}\n`)
    }
    return 0
  }
  if (result.allow) {
    if (result.reason === 'merge') process.stderr.write('verify gate: merge commit — проверка UI пропущена.\n')
    return 0
  }
  process.stderr.write(`${describeGateResult(result)}\n`)
  process.stderr.write('Явный обход только осознанно: git commit --no-verify (или git -c verify.mode=off commit).\n')
  return 1
}

const oneLine = (value: string): string =>
  value
    // eslint-disable-next-line no-control-regex -- Git trailers must not contain control characters.
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Machine-readable trailers: one fingerprint/base pair plus one JSON record per accepted change. */
export function verificationTrailers(stamp: Stamp): string[] {
  return [
    `Verified-Fingerprint: ${stamp.fingerprint}`,
    `Verified-Base: ${oneLine(stamp.base.ref)}@${stamp.base.sha}`,
    `Verified-At: ${oneLine(stamp.createdAt)}`,
    ...stamp.accepted.map(
      (change) =>
        `Verified-Change: ${JSON.stringify({
          id: oneLine(change.id),
          title: oneLine(change.title),
          reason: oneLine(change.reason),
        })}`,
    ),
  ]
}

export type TrailerOutcome = 'added' | 'updated' | 'unchanged' | 'skipped-empty'

/**
 * Inserts or updates the managed `Verified-*` trailer block after the message body and before
 * trailing comment/scissors lines. An empty body is left untouched so interactive commits can abort;
 * stale trailers from `--amend` are replaced with the fresh stamp's trailers.
 */
export function appendVerificationTrailers(path: string, stamp: Stamp): TrailerOutcome {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  let bodyEnd = lines.length
  while (bodyEnd > 0) {
    const line = lines[bodyEnd - 1] ?? ''
    if (line.trim() === '' || line.startsWith('#')) {
      bodyEnd -= 1
      continue
    }
    break
  }
  const bodyLines = lines.slice(0, bodyEnd)
  while (bodyLines.length > 0 && (bodyLines.at(-1) ?? '').trim() === '') bodyLines.pop()
  if (bodyLines.every((line) => line.trim() === '')) return 'skipped-empty'

  const existingManaged = bodyLines.filter((line) => MANAGED_TRAILER_LINE.test(line))
  const desired = verificationTrailers(stamp)
  if (existingManaged.length === desired.length && existingManaged.every((line, index) => line === desired[index])) {
    return 'unchanged'
  }

  const cleanBody = bodyLines.filter((line) => !MANAGED_TRAILER_LINE.test(line))
  while (cleanBody.length > 0 && (cleanBody.at(-1) ?? '').trim() === '') cleanBody.pop()
  if (cleanBody.every((line) => line.trim() === '')) return 'skipped-empty'

  const comments = lines.slice(bodyEnd)
  let next = `${cleanBody.join('\n')}\n\n${desired.join('\n')}\n`
  if (comments.length > 0) next += `\n${comments.join('\n').replace(/\s+$/, '')}\n`
  writeFileSync(path, next, 'utf8')
  return existingManaged.length > 0 ? 'updated' : 'added'
}

function syncCommitTrailers(messagePath: string, hookName: string, mode: GateMode): number {
  if (mode !== 'enforce') return 0
  const result = evaluateGate(mode)
  if (!result.verified || !result.stamp) {
    if (result.files.length > 0) {
      process.stderr.write(
        `verify gate (${hookName}): трейлеры не добавлены (${result.reason}); коммит создаётся в обход проверки.\n`,
      )
    }
    return 0
  }

  const file = isAbsolute(messagePath) ? messagePath : resolve(repoRoot(), messagePath)
  appendVerificationTrailers(file, result.stamp)
  return 0
}

export function runPrepareCommitMsg(args: string[], mode: GateMode = readGateMode()): number {
  const [messagePath, source] = args
  if (!messagePath) throw new Error('prepare-commit-msg: git не передал путь к файлу сообщения')
  if (source === 'merge') return 0
  return syncCommitTrailers(messagePath, 'prepare-commit-msg', mode)
}

export function runCommitMsg(args: string[], mode: GateMode = readGateMode()): number {
  const [messagePath] = args
  if (!messagePath) throw new Error('commit-msg: git не передал путь к файлу сообщения')
  return syncCommitTrailers(messagePath, 'commit-msg', mode)
}

/** Explicit, local-only installation. Never overwrites a custom core.hooksPath. */
export function installHooks(): { changed: boolean; hooksPath: string } {
  const hooksPath = join(repoRoot(), HOOKS_DIR)
  const current = gitOptional(['config', '--get', 'core.hooksPath'])
  if (current !== undefined && current !== '' && resolve(repoRoot(), current) !== hooksPath) {
    throw new Error(
      `core.hooksPath уже задан («${current}»); не перезаписываю. Укажите ${HOOKS_DIR} самостоятельно, если это ваш hooks-каталог.`,
    )
  }
  for (const hook of HOOKS) {
    const file = join(hooksPath, hook)
    if (!existsSync(file)) throw new Error(`нет файла хука ${file}`)
    try {
      accessSync(file, constants.X_OK)
    } catch {
      throw new Error(`хук ${file} не исполняемый; выполните chmod +x`)
    }
  }
  if (current === undefined || current === '') {
    git(['config', '--local', 'core.hooksPath', HOOKS_DIR])
    return { changed: true, hooksPath }
  }
  return { changed: false, hooksPath }
}

export function runFingerprint(args: string[]): number {
  const requested = args[0] ?? 'worktree'
  if (requested !== 'worktree' && requested !== 'index') {
    throw new Error(`fingerprint: неизвестный источник «${requested}»; допустимо worktree или index`)
  }
  process.stdout.write(`${uiFingerprint(requested)}\n`)
  return 0
}

const USAGE = `verify gate — не даёт закоммитить UI/проверочные файлы без свежего \`pnpm verify:ui\`.

Команды (вызываются git-хуками):
  pre-commit
  prepare-commit-msg <файл-сообщения> <источник> [sha]
  commit-msg <файл-сообщения>

Диагностика и установка:
  fingerprint [worktree|index]   напечатать текущий fingerprint
  install | --install-hooks      явно включить .githooks (core.hooksPath, только локально)

Режим: git config verify.mode enforce|observe|off. По умолчанию enforce.
  observe — печатать проблемы, но не блокировать; off — не проверять.
Merge-коммиты пропускаются. Явный обход: git commit --no-verify.
Установка через package script: pnpm --dir frontend verify:install (из frontend: pnpm verify:install).
`

function main(argv: string[]): number {
  const [command, ...args] = argv
  if (command === undefined) {
    process.stderr.write(USAGE)
    return 1
  }
  if (command === 'help' || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)
    return 0
  }
  if (command === 'install' || command === 'install-hooks' || command === '--install-hooks') {
    try {
      const result = installHooks()
      const state = result.changed ? 'Установлено' : 'Уже установлено'
      process.stdout.write(
        `${state}: core.hooksPath=${HOOKS_DIR}\nРежим по умолчанию: enforce. Управление: git config verify.mode observe|off. Обход: git commit --no-verify.\n`,
      )
      return 0
    } catch (error) {
      process.stderr.write(`verify gate: ${errorText(error)}\n`)
      return 1
    }
  }
  if (command === 'fingerprint') {
    try {
      return runFingerprint(args)
    } catch (error) {
      process.stderr.write(`verify gate: ${errorText(error)}\n`)
      return 1
    }
  }

  let mode: GateMode
  try {
    mode = readGateMode()
  } catch (error) {
    process.stderr.write(`verify gate: ${errorText(error)}\n`)
    return 1
  }

  if (command === 'pre-commit') {
    try {
      return runPreCommit(mode)
    } catch (error) {
      process.stderr.write(`verify gate: ошибка: ${errorText(error)}\n`)
      return mode === 'observe' ? 0 : 1
    }
  }
  if (command === 'prepare-commit-msg') {
    if (args[1] === 'merge') return 0
    try {
      return runPrepareCommitMsg(args, mode)
    } catch (error) {
      process.stderr.write(`verify gate: ошибка: ${errorText(error)}\n`)
      return mode === 'observe' ? 0 : 1
    }
  }
  if (command === 'commit-msg') {
    try {
      return runCommitMsg(args, mode)
    } catch (error) {
      process.stderr.write(`verify gate: ошибка: ${errorText(error)}\n`)
      return mode === 'observe' ? 0 : 1
    }
  }

  process.stderr.write(`verify gate: неизвестная команда «${command}»\n\n${USAGE}`)
  return 1
}

function invokedDirectly(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    return realpathSync(resolve(entry)) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (invokedDirectly()) process.exitCode = main(process.argv.slice(2))
