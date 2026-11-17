/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', 50: 'var(--color-primary-50)', 100: 'var(--color-primary-100)', 600: 'var(--color-primary-600)', 700: 'var(--color-primary-700)', 800: 'var(--color-primary-800)', 900: 'var(--color-primary-900)' },
        accent: { DEFAULT: 'var(--color-accent)', 50: 'var(--color-accent-50)', 100: 'var(--color-accent-100)', 500: 'var(--color-accent-500)', 600: 'var(--color-accent-600)', 700: 'var(--color-accent-700)' },
        success: { DEFAULT: 'var(--color-success)', 50: 'var(--color-success-50)', 600: 'var(--color-success-600)', 700: 'var(--color-success-700)' },
        surface: 'var(--color-surface)',
        paper: 'var(--color-paper)',
        tinta: 'var(--color-ink)',
        abu: 'var(--color-muted)',
        garis: 'var(--color-rule)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        float: 'var(--shadow-float)',
      },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
};
