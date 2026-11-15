/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#090E1A',
        panel: '#111827',
        card: '#182235',
        accent: '#06B6D4'
      }
    }
  },
  plugins: []
};
