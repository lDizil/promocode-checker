import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { browserslistToTargets } from 'lightningcss'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

// Browsers that shipped Baseline Widely available features as of 2026-11 (~30 months back); see AGENTS.md.
const cssTargets = browserslistToTargets(['chrome >= 125', 'edge >= 125', 'firefox >= 126', 'safari >= 17.5'])

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets: cssTargets },
  },
  build: { cssMinify: 'lightningcss' },
  plugins: [
    tanstackStart({
      srcDirectory: 'src',
      router: {
        entry: 'app/router.tsx',
        routesDirectory: 'app/routes',
        generatedRouteTree: 'app/routeTree.gen.ts',
      },
      server: { entry: 'app/server.ts' },
      client: { entry: 'app/client.tsx' },
    }),
    nitro(),
    viteReact(),
  ],
})
