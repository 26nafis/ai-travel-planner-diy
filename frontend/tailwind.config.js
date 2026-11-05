/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palet ala situs travel (Traveloka dkk.): biru cerah untuk brand, oranye untuk aksi utama
        primary: { DEFAULT: '#0194F3', 50: '#E6F4FE', 100: '#CCE9FD', 600: '#0182D6', 700: '#0264C8', 800: '#0A4E9B', 900: '#073B78' },
        accent: { DEFAULT: '#FF5E1F', 50: '#FFF1EA', 100: '#FFDDCC', 500: '#FF7A45', 600: '#FF5E1F', 700: '#D9480F' },
        success: { DEFAULT: '#0B9E6B', 50: '#E7F7F0', 600: '#0B9E6B', 700: '#087A53' },
        surface: '#F5F7FA',
        tinta: '#03121A',
        abu: '#687176',
        garis: '#E3E7EB',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(3, 18, 26, 0.08)',
        float: '0 8px 24px rgba(3, 18, 26, 0.14)',
      },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
};
