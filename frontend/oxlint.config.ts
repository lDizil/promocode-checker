import { configFromProject } from '@o-feod/oxlint-structure-plugin/configs'
import { defineConfig } from 'oxlint'

const feod = configFromProject({ preset: 'strict' })

export default defineConfig({
  ...feod,
  plugins: ['typescript', 'react', 'jsx-a11y', 'import', 'unicorn', 'oxc', 'vitest'],
  categories: { correctness: 'error', suspicious: 'warn' },
  ignorePatterns: ['src/app/routeTree.gen.ts', 'public/mockServiceWorker.js', '.output/**', 'storybook-static/**'],
  rules: {
    ...feod.rules,
    // ADR 0002: UI kit components are folders with an index.ts inside common/ui.
    'feod-structure/no-common-index': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-unassigned-import': ['warn', { allow: ['**/*.css'] }],
    // ui-sdk `render={<a … />}` receives its children from the wrapping component; these rules only see the empty element.
    // Real accessible names are checked by axe in `test:stories`.
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    // role="img" on bar charts and role="status" on skeletons are the intended ARIA patterns; `<output>`/`<img>` would be wrong.
    'jsx-a11y/prefer-tag-over-role': 'off',
  },
  overrides: [
    {
      // UI is presentational: effects live in a module's hooks/ (AGENTS.md).
      files: ['src/common/ui/**/*.tsx', 'src/modules/**/ui/**/*.tsx', 'src/pages/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react',
                importNames: ['useEffect', 'useLayoutEffect'],
                message: 'UI-слой презентационный: эффекты живут в hooks/ модуля.',
              },
            ],
          },
        ],
      },
    },
  ],
})
