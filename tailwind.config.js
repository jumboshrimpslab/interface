/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      backgroundColor: {
        primary: '#050d32',
        secondary: 'rgba(255, 255, 255, 0.05)',
        thirdry: '#23284e',
        fourth: '#11193c',
        fifth: '#12193c',
        sixth: '#1b65f6',
        overlay: '#101b30',

        'button-thirdry': '#00afa5',
        'button-fourth': '#0e50fc'
      },
      textColor: {
        primary: '#ffffff',
        secondary: '#a4a3a7',
        warning: '#e96e79'
      }
    }
  },
  plugins: []
};
