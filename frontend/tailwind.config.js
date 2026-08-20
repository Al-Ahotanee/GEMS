/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5632',
          50: '#e8f5ee',
          100: '#c6e6d4',
          200: '#a3d7b9',
          300: '#7fc89f',
          400: '#5cb984',
          500: '#1a5632',
          600: '#164a2b',
          700: '#123d24',
          800: '#0e311d',
          900: '#0a2516',
        },
        accent: {
          DEFAULT: '#f5c842',
          50: '#fef9e7',
          100: '#fdf0c3',
          200: '#fbe79f',
          300: '#f9de7b',
          400: '#f7d357',
          500: '#f5c842',
          600: '#c4a035',
          700: '#937828',
          800: '#62501b',
          900: '#31280d',
        },
        dark: {
          bg: '#080d0a',
          surface: '#0d1610',
          'surface-2': '#132018',
          'surface-3': '#1a2d22',
          border: 'rgba(26,86,50,0.15)',
        },
        text: {
          primary: '#e8f5ee',
          secondary: '#b8d4c4',
          muted: '#7aab90',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'count-up': 'countUp 2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(26,86,50,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(26,86,50,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
