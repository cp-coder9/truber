import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The browser-facing app must never call localhost directly. All API calls use
// relative /api routes, and the Vite dev server proxies them to the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
