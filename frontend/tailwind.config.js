/** Quiet Atlas: cloud surfaces, cobalt navigation, moss confirmation, sand geography. */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#31598a',
          50: '#eff5fb',
          100: '#dce9f5',
          200: '#bdd3e9',
          300: '#90b3d6',
          400: '#5d85b4',
          500: '#31598a',
          600: '#274a76',
          700: '#203e62',
          800: '#1c3451',
          900: '#172a42',
        },
        accent: {
          DEFAULT: '#3d7468',
          50: '#eff8f5',
          100: '#d8eee7',
          200: '#b3ddd1',
          300: '#83c4b4',
          400: '#57a28f',
          500: '#3d7468',
          600: '#315e55',
          700: '#294d47',
          800: '#243f3b',
          900: '#1e3431',
        },
        dark: {
          bg: '#f5f6f3',
          surface: '#ffffff',
          'surface-2': '#edf2f3',
          'surface-3': '#e1e9eb',
          border: '#d8e1e2',
        },
        text: {
          primary: '#172d41',
          secondary: '#526677',
          muted: '#7b8d98',
        },
        status: {
          success: '#3d7468',
          warning: '#b78639',
          error: '#b75046',
          info: '#31598a',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'serif'],
        body: ['Manrope', 'sans-serif'],
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
