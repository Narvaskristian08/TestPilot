/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: '#09090B',
          secondary: '#0C0C0F',
          surface: '#111113',
          elevated: '#18181B',
          card: '#111113',
          border: '#27272A',
          subtle: '#1F1F23',
          text: {
            primary: '#FAFAFA',
            secondary: '#A1A1AA',
            muted: '#71717A',
          },
        },
        primary: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#FAFAFA',
          700: '#E4E4E7',
          800: '#D4D4D8',
          900: '#27272A',
        },
        'noir-purple': {
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#FAFAFA',
          700: '#E4E4E7',
        },
        success: {
          50: '#052E16',
          100: '#14532D',
          400: '#22C55E',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#451A03',
          100: '#78350F',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50: '#450A0A',
          100: '#7F1D1D',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        running: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      spacing: {
        'sidebar': '240px',
        'header': '64px',
      },
    },
  },
  plugins: [],
}
