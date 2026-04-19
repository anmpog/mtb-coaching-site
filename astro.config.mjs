// @ts-check
import netlify from '@astrojs/netlify'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon()],
  adapter: netlify(),
})
