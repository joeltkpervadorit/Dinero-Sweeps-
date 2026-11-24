/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  // Preflight is off so Tailwind does not reset the existing landing CSS.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#00e87a',
          light: '#00ff88',
        },
        casino: {
          dark: '#05060f',
          panel: '#111628',
        },
        v2: {
          ink: '#05060f',
          red: '#ff3355',
          em: '#00e87a',
          rim: '#242d4a',
          pale: '#8a96c0',
          text: '#d8dffb',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        condensed: ['var(--font-condensed)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
