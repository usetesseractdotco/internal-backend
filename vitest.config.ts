import { resolve } from 'path'
import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      enabled: true,
      exclude: [
        'tsup.config.ts',
        'dist/**',
        '**/*.d.ts',
        'src/http/error-handler.ts',
        'drizzle.config.ts',
        'vitest.config.ts',
        'deploy/**/*',
        'src/main.ts',
        'src/@types/**',
        'src/utils/**',
        'src/test/factories/**',
        'src/shared/errors/**',
        'src/db/**',
        'src/adapters/**',
        'src/http/**/*',
        'src/factories/**/*',
        'src/**/*.tsx',
        'src/domain/entities/**/*.ts',
        'src/utils/perms/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
