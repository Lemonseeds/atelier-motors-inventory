import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: 'client/dist', emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
  test: {
    environment: 'jsdom',
    include: ['client/**/*.test.{js,jsx}'],
    setupFiles: ['client/test/setup.js'],
    css: false,
  },
});
