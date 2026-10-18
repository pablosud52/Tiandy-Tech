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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00d300',
          600: '#00b300',
          700: '#009000',
          800: '#007000',
          900: '#004d00',
          950: '#002a00',
        },
        slate: {
          850: '#151e2e',
          925: '#0b1120',
          950: '#060a14',
        },
        technical: {
          bg: '#f8fafc',
          card: '#ffffff',
          darkbg: '#060a14',
          darkcard: '#0b1120',
          border: '#e2e8f0',
          darkborder: '#1e293b'
        }
      },
      boxShadow: {
        'hardware': '0 1px 3px 0 rgba(0, 77, 0, 0.05), 0 1px 2px -1px rgba(0, 77, 0, 0.05)',
        'hardware-hover': '0 10px 25px -5px rgba(0, 77, 0, 0.12), 0 8px 10px -6px rgba(0, 77, 0, 0.08)',
        'hardware-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'hardware-dark-hover': '0 10px 25px -5px rgba(0, 211, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'glow-tiandy': '0 0 20px -3px rgba(0, 211, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        poppins: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}
