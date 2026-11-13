/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b1d30',
          dark: '#081726',
          header: '#0c233c',
          callbar: '#0e2438',
          blue: '#0284c7',
          primary: '#1d4ed8',
          accent: '#ff5000', // Genesys orange
          border: '#e2e8f0',
          muted: '#64748b',
          card: '#ffffff',
          bg: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
