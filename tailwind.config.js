/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff9c00',
        'primary-hover': '#36c857b0',
        secondary: '#5503bb',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // preflight creates issues with antd styles
  },
}
