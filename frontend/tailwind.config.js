/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f5f3',
          100: '#dce8e3',
          200: '#b9d1c7',
          300: '#8fb3a3',
          400: '#5f8f7c',
          500: '#3f6f5c',
          600: '#2f5747',
          700: '#254539',
          800: '#1c352c',
          900: '#0f1f1a',
          950: '#0a1512',
        },
        brand: {
          primary:   '#0f1f1a',
          accent:    '#1f7a52',
          secondary: '#c0392b',
          success:   '#16a34a',
          warning:   '#d97706',
          danger:    '#c0392b',
          light:     '#f8fafc',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'nav':   '0 1px 0 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}
