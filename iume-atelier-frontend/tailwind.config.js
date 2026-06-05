/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#18181B',
        secondary: '#3F3F46',
        accent: '#EC4899',
        surface: '#FAFAFA',
        ink: '#09090B',
      },
      fontFamily: {
        display: ['"Libre Bodoni"', 'Georgia', 'serif'],
        body: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '720px',
        content: '960px',
        article: '1100px',
        editorial: '1200px',
        shell: '1400px',
      },
    },
  },
  plugins: [],
}
