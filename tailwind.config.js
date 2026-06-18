/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'active-link': 'rgb(49, 127, 129)',
        'brand-blue': '#57bbbf',
        'brand-red': '#C8102E',
      },
    },
    fontFamily: {
      heading: ['var(--font-raleway)', 'sans-serif'],
      body: ['var(--font-rubik)'],
    },
  },
}
