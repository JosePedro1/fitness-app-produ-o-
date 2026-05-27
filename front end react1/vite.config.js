import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
  },
  optimizeDeps: {
    // Garante que esses pacotes sejam pré-bundleados corretamente como ESM
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
});
