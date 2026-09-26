/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          50: '#f6f1f7',
          100: '#ede2ef',
          200: '#dcc6df',
          300: '#c5a3ca',
          400: '#aa7bb1',
          500: '#8e5896',
          600: '#714B67', // Classic Odoo Purple
          700: '#5e3e56',
          800: '#4e3447',
          900: '#412d3c',
          950: '#271723',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          teal: '#008784',
          amber: '#e69900',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
