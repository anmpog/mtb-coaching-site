/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'active-link': '#317f81',
        'brand-blue': '#57bbbf',
        'brand-red': '#C8102E',
      },
      fontSize: {
        'fs-sm': 'var(--fs-sm)',
        'fs-base': 'var(--fs-base)',
        'fs-md': 'var(--fs-md)',
        'fs-lg': 'var(--fs-lg)',
        'fs-xl': 'var(--fs-xl)',
        'fs-xxl': 'var(--fs-xxl)',
        'fs-xxxl': 'var(--fs-xxxl)',
      },
    },
    fontFamily: {
      heading: ['var(--font-raleway)', 'sans-serif'],
      body: ['var(--font-rubik)'],
    },
  },
}
