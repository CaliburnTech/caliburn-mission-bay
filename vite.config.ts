import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Fix d3 sub-packages: their `exports` map uses only the "default" condition,
 * which esbuild can't resolve. We bypass it by reading the package's `module`
 * or `main` field directly.
 */
function fixD3ExportsMap() {
  return {
    name: 'fix-d3-exports-map',
    resolveId(id: string) {
      if (/^d3(-\w+)+$/.test(id)) {
        try {
          const pkgPath = resolve('node_modules', id, 'package.json')
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
          const entry = pkg.module || pkg.main || 'src/index.js'
          return resolve('node_modules', id, entry)
        } catch {
          return null
        }
      }
      return null
    }
  }
}

/**
 * Fix mermaid's dayjs imports: mermaid imports dayjs plugins with explicit
 * `.js` extensions (e.g. "dayjs/plugin/isoWeek.js") which esbuild can't
 * resolve. Strip the extension so esbuild finds the file normally.
 */
function fixDayjsExtensions() {
  return {
    name: 'fix-dayjs-extensions',
    resolveId(id: string) {
      if (/^dayjs\//.test(id) && id.endsWith('.js')) {
        const stripped = id.slice(0, -3)
        // Verify the file actually exists without .js
        const candidate = resolve('node_modules', stripped)
        if (existsSync(candidate + '.js') || existsSync(candidate + '/index.js')) {
          return { id: stripped, external: false }
        }
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fixD3ExportsMap(), fixDayjsExtensions()],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: [
      'mermaid',
      'dayjs',
      'dayjs/plugin/isoWeek',
      'dayjs/plugin/customParseFormat',
      'dayjs/plugin/advancedFormat',
      'dayjs/plugin/duration',
    ],
  },
})
