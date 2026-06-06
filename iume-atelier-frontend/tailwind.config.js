/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-cta)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
      },
      fontFamily: {
        display: ['Syne', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '42rem',
        content: '960px',
        article: '1100px',
        editorial: '1200px',
        shell: '1100px',
        list: '768px',
      },
    },
  },
  plugins: [],
}
