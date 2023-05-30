/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      backgroundColor: {
        primary: '#050d32',
        fourth: '#11193c',

        'button-primary': '#FC6A00'
      },
      textColor: {
        primary: '#2B3036',
        secondary: '#FC6A00'
      }
    }
  },
  plugins: []
};
