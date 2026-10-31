import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: './src/test/setup.ts',
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
