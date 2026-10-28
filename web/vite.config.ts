import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, las peticiones a /api se reenvían a la API de Express (puerto 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
