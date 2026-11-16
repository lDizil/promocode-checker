import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
  framework: {
    name: '@storybook/react-vite',
    // Start's plugin needs a server entry; stories only need React + CSS.
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-designs',
    'msw-storybook-addon',
  ],
  staticDirs: ['../public'],
})
