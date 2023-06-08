/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    fontFamily: {
      title: '"Rammetto One", cursive',
      content: 'Outfit, sans-serif'
    },
    extend: {
      backgroundColor: {
        primary: '#FFEDC0',
        'button-primary': '#FC6A00'
      },
      textColor: {
        primary: '#2B3036',
        secondary: '#FC6A00',
        warning: '#FD1F1F'
      }
    }
  },
  plugins: []
};
