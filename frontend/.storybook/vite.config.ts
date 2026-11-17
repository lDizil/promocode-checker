import viteReact from '@vitejs/plugin-react'
import { browserslistToTargets } from 'lightningcss'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(['chrome >= 125', 'edge >= 125', 'firefox >= 126', 'safari >= 17.5']),
    },
  },
  plugins: [viteReact()],
})
