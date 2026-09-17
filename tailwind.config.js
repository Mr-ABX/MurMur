/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        liquid: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
          cardHover: '#171717',
          cardElevated: '#1a1a1a',
          border: '#222222',
          borderSubtle: '#1c1c1c',
          borderHighlight: 'rgba(255, 255, 255, 0.14)',
          emerald: '#10b981',
          emeraldLight: '#34d399',
          emeraldDark: '#059669',
          emeraldGlow: 'rgba(16, 185, 129, 0.1)',
          text: '#ededed',
          textMuted: '#a1a1a1',
          textDim: '#666666',
          danger: '#ef4444',
          warning: '#f59e0b',
          cyan: '#38bdf8',
          blue: '#0070f3',
          purple: '#8b5cf6',
        },
        murmur: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
          border: '#222222',
          primary: '#ededed',
          primaryHover: '#ffffff',
          accent: '#10b981',
          accentDim: '#888888',
          text: '#ededed',
          muted: '#888888',
          danger: '#ef4444',
          warning: '#f59e0b',
        },
        vercel: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
          cardHover: '#171717',
          border: '#222222',
          borderHover: '#333333',
          text: '#ededed',
          textMuted: '#888888',
          textDim: '#555555',
          blue: '#0070f3',
          accent: '#ffffff',
        }
      },
      boxShadow: {
        'vercel-card': '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
        'vercel-border': '0 0 0 1px rgba(255, 255, 255, 0.1)',
        'liquid-card': '0 1px 3px 0 rgba(0, 0, 0, 0.7)',
        'specular-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'morph': 'morph 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        morph: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
