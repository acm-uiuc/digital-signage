/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        scroll: 'scroll 40s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
    },
    colors: { 'yale_blue': { DEFAULT: '#00397a', 100: '#000b18', 200: '#001731', 300: '#002249', 400: '#002e62', 500: '#00397a', 600: '#005dc8', 700: '#1683ff', 800: '#64acff', 900: '#b1d6ff' }, 'vista_blue': { DEFAULT: '#83a8ec', 100: '#0a1d40', 200: '#14397f', 300: '#1e56bf', 400: '#447be2', 500: '#83a8ec', 600: '#9cb9f0', 700: '#b5cbf3', 800: '#cedcf7', 900: '#e6eefb' }, 'atomic_tangerine': { DEFAULT: '#ea9571', 100: '#3c1809', 200: '#793112', 300: '#b5491b', 400: '#e16835', 500: '#ea9571', 600: '#eeaa8d', 700: '#f2c0aa', 800: '#f7d5c6', 900: '#fbeae3' }, 'cambridge_blue': { DEFAULT: '#8cba9b', 100: '#18291e', 200: '#31523c', 300: '#497a5a', 400: '#63a278', 500: '#8cba9b', 600: '#a3c8af', 700: '#bad6c3', 800: '#d1e3d7', 900: '#e8f1eb' }, 'blush': { DEFAULT: '#c9697f', 100: '#2d1017', 200: '#5a202e', 300: '#873145', 400: '#b4415c', 500: '#c9697f', 600: '#d48799', 700: '#dfa5b2', 800: '#e9c3cc', 900: '#f4e1e5' } }
  },
  plugins: [],
};