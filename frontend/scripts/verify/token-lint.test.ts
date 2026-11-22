import assert from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { lintSource } from './token-lint.ts'

const SRC = fileURLToPath(new URL('../../src', import.meta.url))

test('flags raw hex, colour functions, and named colours in CSS while allowing tokens', () => {
  const css = `
    .valid {
      color: var(--color-text);
      background: color-mix(in srgb, var(--color-primary) 20%, transparent);
      border-color: currentColor;
      fill: url(#fff);
      --brand-white: var(--white);
      --font-label: red;
      content: "#fff red rgb(0, 0, 0)";
      /* #123456 rgba(0,0,0,0.5) crimson */
    }
    .invalid {
      color: #ff0000;
      background: rgba(10, 20, 30, 0.5);
      border: 1px solid crimson;
      box-shadow: 0 2px 4px black;
      outline-color: var(--color-border, #abc);
      --custom-accent: tomato;
    }
  `
  const violations = lintSource(join(SRC, 'Card.module.css'), css)
  const messages = violations.map((v) => v.message)
  assert.equal(violations.length, 6, messages.join('\n'))
  assert.ok(messages.some((m) => m.includes('#ff0000')))
  assert.ok(messages.some((m) => m.includes('rgba(…')))
  assert.ok(messages.some((m) => m.includes('crimson')))
  assert.ok(messages.some((m) => m.includes('black')))
  assert.ok(messages.some((m) => m.includes('#abc')))
  assert.ok(messages.some((m) => m.includes('tomato')))
})

test('flags camelCase named colours and raw values in inline TSX styles and SVG attributes', () => {
  const tsx = `
    // style={{ color: 'red' }} fill="#fff"
    const doc = "style={{ backgroundColor: 'blue' }}"
    export function Demo() {
      return (
        <div
          style={{
            color: 'var(--color-text)',
            content: '"#fff red"',
            boxShadow: '0 2px 6px black',
            accentColor: 'crimson',
            caretColor: 'navy',
            textDecorationColor: 'orange',
            textShadow: '0 1px 0 white',
            WebkitTextFillColor: 'gold',
            backgroundColor: '#112233',
          }}
        >
          <svg fill="#abcdef" stroke={'teal'} stopColor="var(--color-primary)" />
        </div>
      )
    }
  `
  const violations = lintSource(join(SRC, 'Demo.tsx'), tsx)
  const messages = violations.map((v) => v.message)
  assert.equal(violations.length, 9, messages.join('\n'))
  for (const expected of ['black', 'crimson', 'navy', 'orange', 'white', 'gold', '#112233', '#abcdef', 'teal']) {
    assert.ok(
      messages.some((m) => m.includes(expected)),
      `expected ${expected} in:\n${messages.join('\n')}`,
    )
  }
})

test('lints story files while skipping tests and generated tokens.css', () => {
  const snippet = `export const Story = () => <div style={{ color: '#fff' }} />`
  assert.equal(lintSource(join(SRC, 'Button.stories.tsx'), snippet).length, 1)
  assert.equal(lintSource(join(SRC, 'Button.test.tsx'), snippet).length, 0)
  assert.equal(lintSource(join(SRC, 'app', 'styles', 'tokens.css'), ':root { --color-bg: #fff; }').length, 0)
})
