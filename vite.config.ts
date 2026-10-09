import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  server: {
    port: 8090,
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/data/**', '**/*.db*', '**/*.db-journal*', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true
  }
});
