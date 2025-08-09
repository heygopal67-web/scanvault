/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New color palette from the image
        'dark-green': '#04361D',
        'cambridge-blue': '#76BA9D',
        'beige': '#F0F2D5',
        primary: {
          50: '#f0f2d5',
          100: '#e8ebc8',
          200: '#d1d9a3',
          300: '#bac77e',
          400: '#a3b559',
          500: '#76BA9D',
          600: '#5a9a7a',
          700: '#3e7a57',
          800: '#225a34',
          900: '#04361D',
        },
        secondary: {
          50: '#f0f2d5',
          100: '#e8ebc8',
          200: '#d1d9a3',
          300: '#bac77e',
          400: '#a3b559',
          500: '#76BA9D',
          600: '#5a9a7a',
          700: '#3e7a57',
          800: '#225a34',
          900: '#04361D',
        },
      },
    },
  },
  plugins: [],
};

