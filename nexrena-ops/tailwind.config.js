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
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'progress-fill': 'progressFill 0.8s ease-out both',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,169,110,0)' },
          '50%':      { boxShadow: '0 0 12px 2px rgba(201,169,110,0.15)' },
        },
        progressFill: {
          from: { width: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
