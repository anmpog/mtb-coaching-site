/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Raleway', 'sans-serif'],
      },
      colors: {
        'active-link': 'rgb(49, 127, 129)',
        'footer-bg-color': '#57bbbf',
        'brand-red': '#C8102E',
      },
    },
  },
}
