/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        obsidian: '#0C0F12',
        slate: {
          800: '#1E2530',
          700: '#2C3444',
          600: '#3D4A5C',
          400: '#7A8A9E',
          200: '#D4DCE6',
          100: '#EDF0F4',
        },
        gold: {
          DEFAULT: '#C9A96E',
          dim:     '#9B7D4E',
          light:   '#E8D5B0',
        },
        cream: '#F5F0E8',
      },
    },
  },
  plugins: [],
}
