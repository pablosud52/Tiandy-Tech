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
        tiandy: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38aaf6',
          500: '#0ea5e9',
          600: '#0066cc',
          700: '#00529b',
          800: '#003d75',
          900: '#002952',
          950: '#001a35',
        },
        technical: {
          bg: '#f8fafc',
          card: '#ffffff',
          darkbg: '#0f172a',
          darkcard: '#1e293b',
          border: '#e2e8f0',
          darkborder: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
