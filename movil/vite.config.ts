import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo (navegador), las peticiones a /api se reenvían a la API de Express (puerto 3000).
export default defineConfig({
  plugins: [react()],
  // Ionic pesa ~1.4 MB sin comprimir; en una app empaquetada no afecta la carga.
  build: { chunkSizeWarningLimit: 2000 },
  server: {
    port: 8100,
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
