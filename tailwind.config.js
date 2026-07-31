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
        dark: {
          bg: '#0B0B0B',
          card: '#121316',
          border: '#222630',
          bubble: '#1A1D24',
          sidebar: '#0E0F12',
          surface: '#15171C'
        },
        brand: {
          blue: '#3B82F6',
          lightBlue: '#60A5FA',
          cyan: '#38BDF8',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        '18': '18px',
        '2xl': '18px'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(96, 165, 250, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
