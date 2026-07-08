export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2E86C1', dark: '#2471A3', light: '#5DADE2' },
        secondary: { DEFAULT: '#00B4D8', dark: '#0096B4' },
        dark:   { DEFAULT: '#0F1A2E', 2: '#141A22', 3: '#1A2433' },
        chrome: { DEFAULT: '#E8EDF2', dim: '#8A9BAE' },
        surface:'#1A2433',
      },
      fontFamily: {
        sans:  ['Nunito', 'Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
