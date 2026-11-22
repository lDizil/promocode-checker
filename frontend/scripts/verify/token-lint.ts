/**
 * Static token lint: raw colour literals in CSS and inline JSX styles.
 *
 * The generated `src/app/styles/tokens.css` is the only place where literal colours are allowed.
 * CSS must use `var(--color-*)`; `color-mix(in srgb, var(--color-*) 40%, transparent)` is
 * legitimate. Inline JSX styles and direct SVG paint attributes are checked for the same literals.
 *
 * Deliberately small and literal: it is a source lint, not a CSS/JS parser. Comments, CSS string
 * contents, `url(...)` contents and `var(...)` references are masked so token references such as
 * `var(--white)` are not mistaken for the named colour. Production `.tsx`/`.jsx` and `.stories.tsx`
 * are checked; only `.test.tsx`/`.test.jsx` and the generated `tokens.css` are excluded.
 *
 * Run: `node scripts/verify/token-lint.ts` (also wired as `pnpm lint:tokens`).
 */
import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const FRONTEND_ROOT = fileURLToPath(new URL('../..', import.meta.url))
const SRC_ROOT = join(FRONTEND_ROOT, 'src')
const GENERATED_TOKENS = join(SRC_ROOT, 'app', 'styles', 'tokens.css')

export interface TokenViolation {
  /** Absolute path; the CLI prints it relative to the frontend root. */
  file: string
  line: number
  column: number
  message: string
}

interface ColorLiteral {
  /** Index inside the declaration or attribute value. */
  index: number
  literal: string
}

interface Declaration {
  property: string
  value: string
  /** Index of `value` in the source. */
  valueIndex: number
}

interface StyleEntry {
  property: string
  value: string
  /** Index of `value` relative to the style object content. */
  valueIndex: number
}

const COLOR_FUNCTIONS = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|device-cmyk)\(/gi
const HEX_COLOR = /(?<![\w-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g
const JSX_COLOR_ATTRIBUTE =
  /\b(fill|stroke|stopColor|floodColor|lightingColor|color)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(['"`])([\s\S]*?)\4\s*\})/g

const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise ' +
    'mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab ' +
    'orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru ' +
    'pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
    'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan ' +
    'teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' '),
)

const NAMED_COLOR_WORD = /(?<![\w.$-])([a-z]+)(?![\w$-])/gi

function normaliseProperty(property: string): string {
  const kebab = property.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).toLowerCase()
  return kebab.startsWith('webkit-') ? `-${kebab}` : kebab
}

function isColorProperty(property: string): boolean {
  const name = normaliseProperty(property)
  if (
    name === 'color' ||
    name === 'fill' ||
    name === 'stroke' ||
    name === 'stop-color' ||
    name === 'flood-color' ||
    name === 'lighting-color'
  ) {
    return true
  }
  if (
    /^(?:background|border|outline|box-shadow|text-shadow|text-decoration|text-emphasis|caret-color|accent-color|column-rule|scrollbar|filter|backdrop-filter|-webkit-)/.test(
      name,
    )
  ) {
    return true
  }
  if (name.startsWith('--')) {
    // Font stacks, durations and pixel metrics are not colour contexts; other custom properties may
    // hold a raw colour even when their name does not mention one.
    if (
      /(?:font|duration|easing|space|radius|size|width|height|weight|line-height|letter-spacing|opacity|z-index|layout|breakpoint|transition|animation)/.test(
        name,
      )
    ) {
      return false
    }
    return true
  }
  return false
}

function skipBlockComment(source: string, index: number): number {
  let cursor = index + 2
  while (cursor < source.length && !(source[cursor] === '*' && source[cursor + 1] === '/')) cursor++
  return Math.min(source.length, cursor + 2)
}

function skipLineComment(source: string, index: number): number {
  let cursor = index + 2
  while (cursor < source.length && source[cursor] !== '\n') cursor++
  return cursor
}

function skipQuoted(source: string, index: number, quote: string): number {
  let cursor = index + 1
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2
      continue
    }
    if (source[cursor] === quote) return cursor + 1
    cursor++
  }
  return cursor
}

function skipCssUrl(source: string, index: number): number {
  let cursor = index + 4
  let depth = 1
  while (cursor < source.length && depth > 0) {
    if (source[cursor] === '\\') {
      cursor += 2
      continue
    }
    if (source[cursor] === '(') depth++
    else if (source[cursor] === ')') depth--
    cursor++
  }
  return cursor
}

/** Advances past a comment or string literal starting at `index`, or returns `index` if none starts there. */
function skipCommentOrString(
  source: string,
  index: number,
  options: { lineComments: boolean; strings: boolean },
): number {
  const char = source[index]
  if (char === '/' && source[index + 1] === '*') return skipBlockComment(source, index)
  if (options.lineComments && char === '/' && source[index + 1] === '/') return skipLineComment(source, index)
  if (options.strings && (char === '"' || char === "'" || (options.lineComments && char === '`'))) {
    return skipQuoted(source, index, char)
  }
  return index
}

function maskRange(chars: string[], from: number, to: number): void {
  for (let index = from; index < to; index++) {
    if (chars[index] !== '\n' && chars[index] !== '\r') chars[index] = ' '
  }
}

/** Replaces comments (and optionally strings / CSS `url(...)`) with spaces, preserving offsets and newlines. */
function maskSource(source: string, options: { css: boolean; strings: boolean }): string {
  const chars = source.split('')
  let index = 0
  while (index < chars.length) {
    if (
      options.css &&
      (chars[index] === 'u' || chars[index] === 'U') &&
      source.slice(index, index + 4).toLowerCase() === 'url('
    ) {
      const previous = source[index - 1] ?? ''
      if (previous === '' || !/[\w-]/.test(previous)) {
        const end = skipCssUrl(source, index)
        maskRange(chars, index, end)
        index = end
        continue
      }
    }
    const end = skipCommentOrString(source, index, {
      lineComments: !options.css,
      strings: options.strings,
    })
    if (end > index) {
      maskRange(chars, index, end)
      index = end
      continue
    }
    index++
  }
  return chars.join('')
}

/** Masks `url(...)` contents so SVG fragment ids (`url(#fff)`) are not read as colours. */
function maskUrls(value: string): string {
  return value.replace(/url\(\s*(?:'[^']*'|"[^"]*"|[^)]*)\)/gi, (match) => match.replace(/[^\n\r]/g, ' '))
}

/** Masks the `var(--name` prefix (and comma) so only a literal fallback remains scannable. */
function maskVarReferences(value: string): string {
  return value.replace(/var\(\s*--[-\w]+\s*,?/gi, (match) => match.replace(/[^\n\r]/g, ' '))
}

function findColorLiterals(value: string, property: string): ColorLiteral[] {
  const scan = maskUrls(value)
  const literals: ColorLiteral[] = []
  for (const match of scan.matchAll(HEX_COLOR)) {
    literals.push({ index: match.index ?? 0, literal: match[0] })
  }
  for (const match of scan.matchAll(COLOR_FUNCTIONS)) {
    literals.push({ index: match.index ?? 0, literal: `${match[0]}…` })
  }
  if (isColorProperty(property)) {
    const namedScan = maskVarReferences(scan)
    for (const match of namedScan.matchAll(NAMED_COLOR_WORD)) {
      const word = match[1]
      if (!word || !NAMED_COLORS.has(word.toLowerCase())) continue
      literals.push({ index: match.index ?? 0, literal: word })
    }
  }
  return literals.toSorted((a, b) => a.index - b.index || a.literal.localeCompare(b.literal))
}

function lineColumn(source: string, index: number): { line: number; column: number } {
  let line = 1
  let lineStart = 0
  for (let cursor = 0; cursor < index; cursor++) {
    if (source.charCodeAt(cursor) === 10) {
      line++
      lineStart = cursor + 1
    }
  }
  return { line, column: index - lineStart + 1 }
}

function cssDeclarations(source: string): Declaration[] {
  const masked = maskSource(source, { css: true, strings: true })
  const declarations: Declaration[] = []
  for (const match of masked.matchAll(/([-\w]+)\s*:\s*([^;{}]*)(?=;|})/g)) {
    const property = match[1]
    const value = match[2]
    if (!property || value === undefined) continue
    const colon = match[0].indexOf(':')
    declarations.push({ property, value, valueIndex: (match.index ?? 0) + colon + 1 })
  }
  return declarations
}

/** Finds the matching `}` of the object literal starting at `open`. */
function matchingBrace(source: string, open: number): number {
  let depth = 0
  let index = open
  while (index < source.length) {
    const skipped = skipCommentOrString(source, index, { lineComments: true, strings: true })
    if (skipped > index) {
      index = skipped
      continue
    }
    const char = source[index]
    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) return index
    }
    index++
  }
  return -1
}

/** Splits one inline style object into top-level `property: value` entries. */
function styleEntries(block: string): StyleEntry[] {
  const chunks: { text: string; index: number }[] = []
  let start = 0
  let depth = 0
  let index = 0
  while (index < block.length) {
    const skipped = skipCommentOrString(block, index, { lineComments: true, strings: true })
    if (skipped > index) {
      index = skipped
      continue
    }
    const char = block[index]
    if (char === '(' || char === '[' || char === '{') depth++
    else if (char === ')' || char === ']' || char === '}') depth--
    if (char === ',' && depth === 0) {
      chunks.push({ text: block.slice(start, index), index: start })
      start = index + 1
    }
    index++
  }
  chunks.push({ text: block.slice(start), index: start })

  const entries: StyleEntry[] = []
  for (const chunk of chunks) {
    const match = /^\s*(['"]?)([-\w$]+)\1\s*:\s*([\s\S]*?)\s*$/.exec(chunk.text)
    const property = match?.[2]
    const value = match?.[3]
    if (!property || value === undefined) continue
    const colon = chunk.text.indexOf(':')
    const valueInChunk = chunk.text.indexOf(value, colon + 1)
    entries.push({
      property,
      value,
      valueIndex: chunk.index + (valueInChunk >= 0 ? valueInChunk : colon + 1),
    })
  }
  return entries
}

function lintCss(file: string, source: string): TokenViolation[] {
  const violations: TokenViolation[] = []
  for (const declaration of cssDeclarations(source)) {
    for (const literal of findColorLiterals(declaration.value, declaration.property)) {
      const position = lineColumn(source, declaration.valueIndex + literal.index)
      violations.push({
        file,
        ...position,
        message: `CSS-свойство «${declaration.property}» задаёт сырой цвет ${literal.literal}; используйте var(--color-*) из tokens.css`,
      })
    }
  }
  return violations
}

function lintTsx(file: string, source: string): TokenViolation[] {
  const violations: TokenViolation[] = []
  const commentsMasked = maskSource(source, { css: false, strings: false })
  const codeMasked = maskSource(commentsMasked, { css: false, strings: true })

  for (const match of codeMasked.matchAll(/style\s*=\s*\{\{/g)) {
    const open = (match.index ?? 0) + match[0].length - 1
    const close = matchingBrace(source, open)
    if (close < 0) {
      throw new Error(`${relative(FRONTEND_ROOT, file)}: не найден конец style={{…}}`)
    }
    const blockStart = open + 1
    for (const entry of styleEntries(source.slice(blockStart, close))) {
      if (entry.property.toLowerCase() === 'content') continue
      for (const literal of findColorLiterals(entry.value, entry.property)) {
        const position = lineColumn(source, blockStart + entry.valueIndex + literal.index)
        violations.push({
          file,
          ...position,
          message: `инлайн-стиль «${entry.property}» задаёт сырой цвет ${literal.literal}; используйте var(--color-*)`,
        })
      }
    }
  }

  for (const match of commentsMasked.matchAll(JSX_COLOR_ATTRIBUTE)) {
    const name = match[1]
    const value = match[2] ?? match[3] ?? match[5] ?? ''
    if (!name || value === '') continue
    const valueInMatch = match[0].indexOf(value)
    for (const literal of findColorLiterals(value, name)) {
      const position = lineColumn(source, (match.index ?? 0) + (valueInMatch >= 0 ? valueInMatch : 0) + literal.index)
      violations.push({
        file,
        ...position,
        message: `атрибут ${name} задаёт сырой цвет ${literal.literal}; используйте var(--color-*)`,
      })
    }
  }

  return violations
}

export function lintSource(file: string, source: string): TokenViolation[] {
  if (!isLintable(file)) return []
  if (extname(file) === '.css') return lintCss(file, source)
  return lintTsx(file, source)
}

function isLintable(file: string): boolean {
  if (resolve(file) === GENERATED_TOKENS) return false
  const extension = extname(file)
  if (extension === '.css') return true
  return (extension === '.tsx' || extension === '.jsx') && !/\.test\.(?:tsx|jsx)$/.test(file)
}

function walk(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

export function lintTree(): { files: number; violations: TokenViolation[] } {
  const files = walk(SRC_ROOT).toSorted()
  const violations: TokenViolation[] = []
  let checked = 0
  for (const file of files) {
    if (!isLintable(file)) continue
    checked++
    violations.push(...lintSource(file, readFileSync(file, 'utf8')))
  }
  const unique = [
    ...new Map(
      violations.map(
        (violation) =>
          [`${violation.file}:${violation.line}:${violation.column}:${violation.message}`, violation] as const,
      ),
    ).values(),
  ]
  return {
    files: checked,
    violations: unique.toSorted((a, b) => {
      if (a.file !== b.file) return a.file < b.file ? -1 : 1
      if (a.line !== b.line) return a.line - b.line
      if (a.column !== b.column) return a.column - b.column
      return a.message.localeCompare(b.message)
    }),
  }
}

if (import.meta.main) {
  const { files, violations } = lintTree()
  if (violations.length === 0) {
    console.log(`Token lint: ok (${files} file(s) checked).`)
  } else {
    for (const violation of violations) {
      console.error(
        `${relative(FRONTEND_ROOT, violation.file)}:${violation.line}:${violation.column} ${violation.message}`,
      )
    }
    console.error(`\nToken lint: ${violations.length} сырых цвет(ов). Источник — var(--color-*) из tokens.css.`)
    process.exitCode = 1
  }
}
