import eslintPluginAstro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: { ...jsxA11y.configs.recommended.rules },
  },
  {
    files: ['**/*.{astro,ts,js,mjs}'],
    rules: {
      'no-console': 'error',
    },
  },
])
