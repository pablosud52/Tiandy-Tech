import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isPublic = mode === 'public' || process.env.VITE_PUBLIC_BUILD === 'true';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_PUBLIC_BUILD': JSON.stringify(isPublic ? 'true' : 'false')
    },
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
        ignored: [
          '**/data/**',
          '**/*.db*',
          '**/*.db-journal*',
          '**/.git/**',
          '**/scratch/**',
          '**/dist/**',
          '**/02-DOCS/**',
          '**/.system_generated/**',
          '**/.gemini/**',
          '**/.agents/**'
        ]
      }
    },
    build: {
      outDir: isPublic ? 'dist/public' : 'dist/client',
      emptyOutDir: true
    }
  };
});

