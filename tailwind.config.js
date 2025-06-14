/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          coral: '#F97316',
          teal: '#00BFA6',
          deepPurple: '#6B4EFF',
        },
        background: {
          main: '#FCF7FA',
          light: '#FFFFFF',
          gray: '#F5F5F5',
        },
        text: {
          dark: '#1A1A1A',
          gray: '#6B7280',
          light: '#9CA3AF',
        },
        border: {
          light: '#E0E0E0',
        },
        accent: {
          purple: '#6B4EFF',
          teal: '#00BFA6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
} 