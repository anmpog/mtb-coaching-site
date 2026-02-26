// import jsxA11y from 'eslint-plugin-jsx-a11y'
import astro from 'eslint-plugin-astro'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['.astro/**', 'dist/**', '**/*.d.ts'] },
  ...tseslint.configs.recommended,
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
])
