// @ts-check
import netlify from '@astrojs/netlify'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon()],
  adapter: netlify({
    imageCDN: false,
  }),
  output: 'static',
  fonts: [
    {
      provider: fontProviders.npm({
        remote: false,
      }),
      name: 'Rubik Variable',
      cssVariable: '--font-rubik',
      options: {
        package: '@fontsource-variable/rubik',
      },
    },
    {
      provider: fontProviders.npm({
        remote: false,
      }),
      name: 'Raleway Variable',
      cssVariable: '--font-raleway',
      options: {
        package: '@fontsource-variable/raleway',
      },
      styles: ['normal'],
    },
  ],
})
