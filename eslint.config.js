import eslint from '@eslint/js'
import astro from 'eslint-plugin-astro'
import tsdoc from 'eslint-plugin-tsdoc'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['.astro/**', 'dist/**', '**/*.d.ts'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  astro.configs['jsx-a11y-recommended'],

  {
    files: ['**/*.{astro,ts,tsx,js,mjs}'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'astro/sort-attributes': 'error',
      'astro/no-set-html-directive': 'error',
    },
  },
  {
    files: ['**/*.{astro,ts,tsx}'],
    plugins: { tsdoc },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
])
