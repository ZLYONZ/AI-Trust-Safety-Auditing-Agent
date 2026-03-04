/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#028090',
          700: '#00a896',
          800: '#02C39A',
          900: '#134e4a',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e2761',
        },
        navy: {
          DEFAULT: '#1E2761',
          light: '#2c3e7e',
          dark: '#151b47',
        },
        purple: {
          DEFAULT: '#57068c',
          light: '#7e22ce',
          dark: '#3b0764',
        },
      },
    },
  },
  plugins: [],
}
