import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    include: [
      'src/back-end/**/*.test.ts',
      'src/front-end/**/*.test.{ts,tsx}'
    ],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: [
        'src/back-end/**/*.ts',
        'src/front-end/**/*.{ts,tsx}'
      ],
      exclude: ['src/front-end/**/*.test.{ts,tsx}', 'src/front-end/main.tsx'],
      reporter: ['text', 'html'],
    },
  },
})
