import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { z } from 'zod'

/** Files that change what the user sees. Tests and stories do not reach pages. */
export const UI_PATHS = ['frontend/src', 'frontend/public', 'frontend/tokens']

/**
 * Verifier inputs: changing any of them changes what `verify:ui` checks, so a stamp made by the
 * old checks must not authorise a commit made with the new ones.
 */
export const VERIFY_PATHS = [
  '.githooks',
  'frontend/scripts/verify',
  'frontend/.storybook',
  'frontend/vite.config.ts',
  'frontend/vitest.config.ts',
  'frontend/tsconfig.json',
  'frontend/.nvmrc',
  'frontend/package.json',
  'frontend/pnpm-lock.yaml',
]

export const FINGERPRINT_PATHS = [...UI_PATHS, ...VERIFY_PATHS]

/** Tests and stories are deliberately outside the fingerprint, as are generated route trees. */
const NOT_FINGERPRINTED = /(\.test\.(?:ts|tsx)|\.stories\.(?:ts|tsx)|routeTree\.gen\.ts)$/

interface GitOptions {
  cwd?: string
  input?: string
  /** Keep whitespace and NUL separators exactly as git wrote them. */
  raw?: boolean
}

const exitStatus = (error: unknown): unknown => {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return error.status
}

export const git = (args: string[], options: GitOptions = {}) => {
  const output = execFileSync('git', args, {
    cwd: options.cwd ?? repoRoot(),
    input: options.input,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  })
  return options.raw ? output : output.trim()
}

/** Like `git`, but exit status 1 (config key or revision absent) becomes `undefined`. */
export function gitOptional(args: string[], options: GitOptions = {}): string | undefined {
  try {
    return git(args, options)
  } catch (error) {
    if (exitStatus(error) === 1) return undefined
    throw error
  }
}

/** NUL-separated output from `git ... -z`, without trimming legal leading/trailing spaces or tabs. */
export const gitPaths = (args: string[], options: GitOptions = {}) =>
  git(args, { ...options, raw: true })
    .split('\0')
    .filter((value) => value.length > 0)

let root: string | undefined
export function repoRoot(): string {
  root ??= execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).replace(/\r?\n$/, '')
  return root
}

export const verifyDir = () => join(repoRoot(), 'frontend', '.verify')
export const stampPath = () => join(verifyDir(), 'stamp.json')

const under = (path: string, roots: readonly string[]) =>
  roots.some((directory) => path === directory || path.startsWith(`${directory}/`))

export const isUiFile = (path: string) => under(path, UI_PATHS) && !NOT_FINGERPRINTED.test(path)
export const isFingerprintFile = (path: string) => under(path, FINGERPRINT_PATHS) && !NOT_FINGERPRINTED.test(path)

export type FingerprintSource = 'worktree' | 'index'

/**
 * Content hash of every UI and verifier file, either as it is on disk now or as staged for commit.
 * Worktree reads include untracked files, so a new file missing from the index makes the two
 * fingerprints differ instead of silently escaping the gate.
 */
export function fingerprintEntries(source: FingerprintSource): Map<string, string> {
  const entries = new Map<string, string>()
  if (source === 'index') {
    for (const record of gitPaths(['ls-files', '-s', '-z', '--', ...FINGERPRINT_PATHS])) {
      const tab = record.indexOf('\t')
      if (tab < 0) throw new Error(`git ls-files вернул запись без пути: «${record}»`)
      const fields = record.slice(0, tab).split(' ')
      const hash = fields[1]
      const stage = fields[2]
      const path = record.slice(tab + 1)
      if (!path || !isFingerprintFile(path) || stage !== '0') continue
      if (!hash) throw new Error(`git ls-files вернул запись без объекта: «${record}»`)
      entries.set(path, hash)
    }
    return entries
  }

  const files = [...new Set(gitPaths(['ls-files', '-c', '-o', '--exclude-standard', '-z', '--', ...FINGERPRINT_PATHS]))]
    .filter((path) => path.length > 0 && isFingerprintFile(path) && existsSync(join(repoRoot(), path)))
    .toSorted()

  // Paths are arguments rather than stdin lines so spaces, tabs and newlines in names stay intact.
  for (let start = 0; start < files.length; start += 128) {
    const batch = files.slice(start, start + 128)
    const hashes = git(['hash-object', '--', ...batch], { raw: true })
      .split('\n')
      .filter((line) => line.length > 0)
    if (hashes.length !== batch.length) {
      throw new Error(`git hash-object вернул ${hashes.length} хешей для ${batch.length} файлов`)
    }
    batch.forEach((path, index) => entries.set(path, hashes[index]!))
  }
  return entries
}

export function fingerprintOf(entries: ReadonlyMap<string, string>): string {
  const body = [...entries]
    .toSorted(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([path, hash]) => `${path}\0${hash}`)
    .join('\n')
  return createHash('sha256').update(`verify-fingerprint-v1\n${body}`).digest('hex').slice(0, 16)
}

export const uiFingerprint = (source: FingerprintSource = 'worktree') => fingerprintOf(fingerprintEntries(source))

const pathFromRecord = (record: string): string => {
  const tab = record.indexOf('\t')
  return tab < 0 ? '' : record.slice(tab + 1)
}

export const stagedUiFiles = () =>
  [...new Set(gitPaths(['diff', '--cached', '--name-only', '--no-renames', '-z', '--', ...UI_PATHS]))]
    .filter(isUiFile)
    .toSorted()

export const stagedFingerprintFiles = () =>
  [...new Set(gitPaths(['diff', '--cached', '--name-only', '--no-renames', '-z', '--', ...FINGERPRINT_PATHS]))]
    .filter(isFingerprintFile)
    .toSorted()

export const stagedUnmergedFiles = () =>
  [...new Set(gitPaths(['ls-files', '-u', '-z', '--', ...FINGERPRINT_PATHS]).map(pathFromRecord))]
    .filter(isFingerprintFile)
    .toSorted()

const stampSchema = z.object({
  fingerprint: z.string().regex(/^[0-9a-f]{16}$/, 'должен состоять из 16 строчных hex-символов'),
  base: z.object({
    ref: z.string().trim().min(1),
    sha: z.string().regex(/^[0-9a-f]{7,64}$/, 'должен быть git SHA'),
  }),
  accepted: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        title: z.string().trim().min(1),
        reason: z.string().trim().min(1),
      }),
    )
    .refine((accepted) => new Set(accepted.map((entry) => entry.id)).size === accepted.length, {
      message: 'содержит повторяющийся id',
    }),
  createdAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'должен быть датой ISO'),
})

export type Stamp = z.infer<typeof stampSchema>
export type StampAccepted = Stamp['accepted'][number]

/** Parses the stamp-file boundary: malformed JSON/schema is an error, never a missing stamp. */
export function validateStamp(value: unknown): Stamp {
  const parsed = stampSchema.safeParse(value)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'stamp'}: ${issue.message}`).join('; ')
    throw new Error(`stamp: ${issues}`)
  }
  return parsed.data
}

/** Reads and validates the stamp; throws on malformed JSON/schema instead of treating it as absent. */
export function readStamp(path = stampPath()): Stamp | undefined {
  if (!existsSync(path)) return undefined
  return validateStamp(JSON.parse(readFileSync(path, 'utf8')) as unknown)
}

export function writeStamp(stamp: Stamp, path = stampPath()): void {
  const checked = validateStamp(stamp)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(checked, null, 2)}\n`, 'utf8')
}

/** The revision the verified worktree was based on. */
export function headRevision(): Stamp['base'] {
  const sha = git(['rev-parse', '--verify', 'HEAD'])
  const ref = gitOptional(['symbolic-ref', '--short', '--quiet', 'HEAD']) ?? sha
  return { ref, sha }
}

/** Resolves a ref/HEAD/abbreviated SHA to the full commit id it points at now. */
export function resolveCommit(ref: string): string | undefined {
  const sha = gitOptional(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`])
  return sha === undefined || sha === '' ? undefined : sha
}

export function commitExists(sha: string): boolean {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd: repoRoot(), stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function isAncestor(ancestor: string, descendant = 'HEAD'): boolean {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
      cwd: repoRoot(),
      stdio: 'ignore',
    })
    return true
  } catch (error) {
    if (exitStatus(error) === 1) return false
    throw error
  }
}

/**
 * Writes the stamp after a successful verification run. Parent runners should call this only when
 * every scenario was captured and every accepted change has an id, title and reason.
 */
export function stampVerification(accepted: Stamp['accepted']): Stamp {
  const stamp: Stamp = {
    fingerprint: uiFingerprint('worktree'),
    base: headRevision(),
    accepted,
    createdAt: new Date().toISOString(),
  }
  writeStamp(stamp)
  return stamp
}
