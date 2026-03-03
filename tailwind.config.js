/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#1E40AF',
        accent: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F97316',
      },
    },
  },
  plugins: [],
}
