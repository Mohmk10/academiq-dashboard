/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        sidebar: {
          DEFAULT: '#0B1120',
          hover: '#151E33',
          active: '#1A2742',
        },
        accent: '#F59E0B',
        surface: '#FFFFFF',
        background: '#F9FAFB',
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'input-focus': '0 0 0 3px rgba(37, 99, 235, 0.12)',
        'btn': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'btn-hover': '0 4px 12px -2px rgba(37, 99, 235, 0.3)',
      },
    },
  },
  plugins: [],
};
