/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
        pulse: { 50: '#fef3f2', 100: '#fee4e2', 200: '#fecdc9', 300: '#fda4a0', 400: '#f97066', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' },
        dark: { 50: '#f8f9fa', 100: '#e9ecef', 200: '#dee2e6', 300: '#ced4da', 400: '#adb5bd', 500: '#6c757d', 600: '#495057', 700: '#343a40', 800: '#1a1d21', 900: '#0d1117' },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        arabic: ['var(--font-arabic)'],
      },
    },
  },
  plugins: [],
};
