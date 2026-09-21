/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          orange: '#ea580c',
        },
        obsidian: {
          950: '#030304',
          900: '#08080a',
          850: '#0d0d10',
          800: '#131317',
          700: '#1b1b22',
          600: '#272730',
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Display"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Fragment Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.25)',
        'glow-notch': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'waveBar 1.2s ease-in-out infinite',
      },
      keyframes: {
        waveBar: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '24px' },
        }
      }
    },
  },
  plugins: [],
}
