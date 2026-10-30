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
        navy: {
          950: '#080C16',
          900: '#0C1222',
          850: '#10172C',
          800: '#15203B',
          700: '#1F2F54',
          600: '#2A4072',
        },
        charcoal: {
          900: '#12141B',
          800: '#1A1D27',
          700: '#242836',
          600: '#343A4D',
        },
        cream: {
          50: '#FDFAF4',
          100: '#F7F3E9',
          200: '#ECE4D0',
          300: '#DFD4BC',
          400: '#C7B99A',
          800: '#383228',
          900: '#221E18',
        },
        paper: {
          light: '#F8F4EC',
          sepia: '#F3EAD7',
          dark: '#1C1F2B',
          darkSepia: '#23201C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'book-spine': 'inset 8px 0 14px -6px rgba(0,0,0,0.2), inset -8px 0 14px -6px rgba(0,0,0,0.2)',
        'book-left': 'inset -10px 0 12px -6px rgba(0,0,0,0.12), -4px 6px 16px -4px rgba(0,0,0,0.15)',
        'book-right': 'inset 10px 0 12px -6px rgba(0,0,0,0.12), 4px 6px 16px -4px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
