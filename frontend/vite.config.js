import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Saat backend Express jalan di port 3000, request /api diteruskan ke sana.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
