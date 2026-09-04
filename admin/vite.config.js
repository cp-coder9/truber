import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin dashboard uses relative /api routes proxied to the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
