import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite + Vitest config for mental math addition app
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
