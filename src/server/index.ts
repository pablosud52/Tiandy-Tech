import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '8090', 10);
const isProd = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos locales de data (imágenes y PDFs)
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
app.use('/data', express.static(dataDir));

// Rutas de API REST
app.use('/api', apiRouter);

// Configuración de Frontend (Vite en Dev / Estático en Prod)
async function startServer() {
  if (!isProd) {
    // Modo Desarrollo: Vite Dev Middleware con Hot Reload
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/*.db*', '**/*.db-journal*', '**/.git/**', '**/scratch/**', '**/dist/**', '**/02-DOCS/**']
        }
      },
      appType: 'spa',
      root: process.cwd()
    });
    app.use(vite.middlewares);
  } else {
    // Modo Producción: Servir bundle compilado en dist/client
    const clientDist = path.resolve(process.cwd(), 'dist/client');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('       TIANDY TECH — PLATAFORMA WEB UNIFICADA         ');
    console.log('======================================================');
    console.log(` Entorno          : ${isProd ? 'Producción (Docker/NAS)' : 'Desarrollo Local'}`);
    console.log(` Puerto           : ${PORT}`);
    console.log(` Catálogo Público : http://localhost:${PORT}/`);
    console.log(` Panel de Control : http://localhost:${PORT}/admin`);
    console.log(` API REST         : http://localhost:${PORT}/api/productos`);
    console.log('======================================================\n');
  });
}

startServer().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
