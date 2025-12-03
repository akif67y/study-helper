import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                     // ← add this line
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});