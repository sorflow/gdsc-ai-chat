/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f4', 100: '#ffe0e7', 200: '#ffc5d2', 300: '#ff9ab0',
          400: '#f96383', 500: '#e63b62', 600: '#c31f49', 700: '#a3153b',
          800: '#881536', 900: '#741631', 950: '#430719',
        },
        secondary: {
          50: '#fff9e8', 100: '#fff0bf', 200: '#ffe286', 300: '#f8ca47',
          400: '#e8af22', 500: '#d49313', 600: '#b66f0d', 700: '#92500f',
          800: '#783f13', 900: '#663514', 950: '#3b1b07',
        },
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        sans: ['Avenir Next', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Bodoni 72', 'Didot', 'Georgia', 'Times New Roman', 'serif'],
        utility: ['Arial Narrow', 'Avenir Next Condensed', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'typing-dot': 'typing-dot 1.4s infinite ease-in-out',
      },
      keyframes: {
        'typing-dot': {
          '0%, 80%, 100%': { opacity: 0 },
          '40%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
