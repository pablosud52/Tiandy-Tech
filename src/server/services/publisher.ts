import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { getProductos, getConfiguracion } from '../db/index.js';
import { getResolvedGlobalBadges } from './badges-service.js';

const execPromise = util.promisify(exec);

export interface PublishResult {
  success: boolean;
  message: string;
  timestamp: string;
  stats?: {
    productos: number;
    badges: number;
    archivosGenerados: number;
  };
  cloudflareStatus?: 'deployed' | 'built_only' | 'error';
  cloudflareDetails?: string;
  missingEnv?: string[];
  deploymentUrl?: string;
}

let lastPublishResult: PublishResult | null = null;
let isPublishing = false;

// Copiar directorio recursivamente
function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Cargar variables de entorno desde .env si no estuvieran en process.env
function loadEnvFromFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

export function getLastPublishStatus(): { isPublishing: boolean; lastResult: PublishResult | null } {
  return {
    isPublishing,
    lastResult: lastPublishResult
  };
}

export async function executePublish(): Promise<PublishResult> {
  if (isPublishing) {
    throw new Error('Hay una publicación en progreso. Por favor espera a que finalice.');
  }

  loadEnvFromFile();
  isPublishing = true;
  const startTime = new Date().toISOString();

  try {
    const rootDir = process.cwd();
    const publicDataDir = path.resolve(rootDir, 'public/data');
    if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

    // 1. Exportar snapshot de productos visibles
    const productos = getProductos({ solo_visibles: true });
    fs.writeFileSync(
      path.join(publicDataDir, 'productos.json'),
      JSON.stringify(productos, null, 2),
      'utf-8'
    );

    let secciones: any = getConfiguracion('secciones_visibles');
    if (typeof secciones === 'string') {
      try {
        secciones = JSON.parse(secciones);
      } catch {}
    }
    if (!secciones || typeof secciones !== 'object') {
      secciones = {
        CAMARA: true,
        NVR: true,
        SWITCH: true,
        ACCESORIO: true,
        WIKI: true,
        COMPARADOR: true,
        COTIZADOR: true,
        HERRAMIENTAS: true,
        HERRAMIENTAS_UPS: true,
        HERRAMIENTAS_ALMACENAMIENTO: true
      };
    }
    fs.writeFileSync(
      path.join(publicDataDir, 'sections.json'),
      JSON.stringify({ success: true, secciones }, null, 2),
      'utf-8'
    );

    // 2b. Exportar configuración de badges globales con imagen_url completa
    const badges = getResolvedGlobalBadges();
    fs.writeFileSync(
      path.join(publicDataDir, 'badges.json'),
      JSON.stringify({ success: true, badges }, null, 2),
      'utf-8'
    );

    // Copiar badges locales a public/data/badges antes del build
    const localBadgesDir = path.resolve(rootDir, 'data/badges');
    if (fs.existsSync(localBadgesDir)) {
      copyDirRecursive(localBadgesDir, path.join(publicDataDir, 'badges'));
    }

    // 3. Garantizar archivo _redirects en public/
    const redirectsContent = '# Cloudflare Pages SPA Routing\n/*    /index.html   200\n';
    fs.writeFileSync(path.resolve(rootDir, 'public/_redirects'), redirectsContent, 'utf-8');

    // 4. Compilar la aplicación en modo público para Cloudflare Pages
    // Esto excluye totalmente el Panel AD y componentes administrativos
    console.log('[PUBLISH] Iniciando compilación de la vista web pública...');
    await execPromise('npm run build:public', { cwd: rootDir });

    const distPublicDir = path.resolve(rootDir, 'dist/public');
    const distDataDir = path.join(distPublicDir, 'data');
    if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });

    // 5. Copiar datos y assets de imágenes a dist/public/data
    fs.copyFileSync(
      path.join(publicDataDir, 'productos.json'),
      path.join(distDataDir, 'productos.json')
    );
    fs.copyFileSync(
      path.join(publicDataDir, 'sections.json'),
      path.join(distDataDir, 'sections.json')
    );
    fs.copyFileSync(
      path.join(publicDataDir, 'badges.json'),
      path.join(distDataDir, 'badges.json')
    );

    // Copiar imágenes de productos a dist/public/data/images y /img
    const localImagesDir = path.resolve(rootDir, 'data/images');
    if (fs.existsSync(localImagesDir)) {
      copyDirRecursive(localImagesDir, path.join(distDataDir, 'images'));
    }
    const localImgDir = path.resolve(rootDir, 'data/img');
    if (fs.existsSync(localImgDir)) {
      copyDirRecursive(localImgDir, path.join(distDataDir, 'img'));
    }
    if (fs.existsSync(localBadgesDir)) {
      copyDirRecursive(localBadgesDir, path.join(distDataDir, 'badges'));
    }

    // Asegurar _redirects en dist/public
    fs.writeFileSync(path.join(distPublicDir, '_redirects'), redirectsContent, 'utf-8');

    // 6. Verificar y ejecutar despliegue en Cloudflare Pages
    const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
    const projectName = process.env.CLOUDFLARE_PROJECT_NAME || process.env.CF_PAGES_PROJECT;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
    const deployHook = process.env.CLOUDFLARE_DEPLOY_HOOK;

    let cloudflareStatus: 'deployed' | 'built_only' | 'error' = 'built_only';
    let cloudflareDetails = 'Paquete web público compilado y listo en dist/public.';
    let deploymentUrl: string | undefined;
    const missingEnv: string[] = [];

    if (deployHook) {
      // Disparo mediante webhook de Cloudflare Pages
      try {
        const hookRes = await fetch(deployHook, { method: 'POST' });
        if (hookRes.ok) {
          cloudflareStatus = 'deployed';
          cloudflareDetails = 'Despliegue iniciado correctamente mediante Deploy Hook de Cloudflare Pages.';
        } else {
          cloudflareStatus = 'error';
          cloudflareDetails = `Error al invocar Deploy Hook de Cloudflare (HTTP ${hookRes.status})`;
        }
      } catch (hookErr: any) {
        cloudflareStatus = 'error';
        cloudflareDetails = `Fallo de conexión con Deploy Hook: ${hookErr.message}`;
      }
    } else if (apiToken && projectName) {
      // Despliegue directo mediante Wrangler
      try {
        console.log(`[PUBLISH] Desplegando en Cloudflare Pages proyecto: ${projectName}...`);
        const deployCmd = `npx wrangler pages deploy dist/public --project-name="${projectName}" --commit-dirty=true`;
        const { stdout } = await execPromise(deployCmd, {
          cwd: rootDir,
          env: {
            ...process.env,
            CLOUDFLARE_API_TOKEN: apiToken,
            ...(accountId ? { CLOUDFLARE_ACCOUNT_ID: accountId } : {})
          }
        });
        cloudflareStatus = 'deployed';
        cloudflareDetails = 'Publicado y desplegado con éxito en Cloudflare Pages.';
        
        // Extraer URL del output de wrangler si está presente
        const urlMatch = stdout.match(/https:\/\/[a-zA-Z0-9.-]+\.pages\.dev/);
        if (urlMatch) {
          deploymentUrl = urlMatch[0];
        }
      } catch (deployErr: any) {
        cloudflareStatus = 'error';
        cloudflareDetails = `Error al desplegar con Wrangler: ${deployErr.message}`;
      }
    } else {
      if (!apiToken) missingEnv.push('CLOUDFLARE_API_TOKEN');
      if (!projectName) missingEnv.push('CLOUDFLARE_PROJECT_NAME');
      cloudflareDetails = 'Compilación pública exitosa en dist/public. Para publicar automáticamente en Cloudflare con 1 clic, configura CLOUDFLARE_API_TOKEN y CLOUDFLARE_PROJECT_NAME en tu archivo .env.';
    }

    const result: PublishResult = {
      success: cloudflareStatus !== 'error',
      message: cloudflareStatus === 'deployed' 
        ? '¡Catálogo publicado con éxito en Cloudflare Pages!' 
        : 'Compilación pública generada con éxito.',
      timestamp: startTime,
      stats: {
        productos: productos.length,
        badges: badges.length,
        archivosGenerados: productos.length
      },
      cloudflareStatus,
      cloudflareDetails,
      missingEnv: missingEnv.length > 0 ? missingEnv : undefined,
      deploymentUrl
    };

    lastPublishResult = result;
    return result;
  } catch (error: any) {
    const errorResult: PublishResult = {
      success: false,
      message: `Error durante la publicación: ${error.message}`,
      timestamp: startTime,
      cloudflareStatus: 'error',
      cloudflareDetails: error.message
    };
    lastPublishResult = errorResult;
    throw error;
  } finally {
    isPublishing = false;
  }
}
