import fs from 'fs';
import path from 'path';
import { extractFromPdf } from '../services/pdf-extractor.js';
import { saveProducto, db } from './index.js';
import { EstadoStock } from '../../shared/types.js';

const samplesDir = path.resolve(process.cwd(), '02-DOCS/datasheets-ejemplo');
const dataDocsDir = path.resolve(process.cwd(), 'data/docs');
const dataImgDir = path.resolve(process.cwd(), 'data/img');

if (!fs.existsSync(dataDocsDir)) fs.mkdirSync(dataDocsDir, { recursive: true });
if (!fs.existsSync(dataImgDir)) fs.mkdirSync(dataImgDir, { recursive: true });

// Precios y estados reales tomados de la planilla de Google Sheets
const preciosPlanilla: Record<string, { precio: number; stock: EstadoStock }> = {
  'TC-C321N': { precio: 25.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C320N': { precio: 23.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C341N': { precio: 45.0, stock: 'PROXIMO_ARRIBO' },
  'TC-C32QN': { precio: 36.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C32XN': { precio: 48.0, stock: 'PROXIMO_ARRIBO' },
  'TC-C32QV': { precio: 72.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C32KS': { precio: 70.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C34KS': { precio: 82.6, stock: 'ENTREGA_INMEDIATA' },
  'TC-C38RN': { precio: 79.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C34QN': { precio: 48.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C36QN': { precio: 72.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C32WN': { precio: 79.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C34UV': { precio: 149.0, stock: 'AGOTADO' },
  'TC-C35WP': { precio: 105.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C35US': { precio: 110.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C32US': { precio: 135.0, stock: 'POCAS_UNIDADES' },
  'TC-C35WQ': { precio: 145.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C35WS': { precio: 97.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C35VN': { precio: 195.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-C382V': { precio: 240.0, stock: 'AGOTADO' },
  'TC-H332A': { precio: 43.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-H333D': { precio: 47.3, stock: 'ENTREGA_INMEDIATA' },
  'TC-H343K': { precio: 140.0, stock: 'AGOTADO' },
  'TC-H324S': { precio: 420.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-H366V': { precio: 890.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3104': { precio: 65.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3108': { precio: 120.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3105': { precio: 38.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3110': { precio: 82.5, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3116': { precio: 105.0, stock: 'PROXIMO_ARRIBO' },
  'TC-R3120': { precio: 140.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-R3232': { precio: 240.0, stock: 'AGOTADO' },
  'TC-R3210': { precio: 308.0, stock: 'POCAS_UNIDADES' },
  'TC-R3240': { precio: 690.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-P3S028': { precio: 220.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-P3S010': { precio: 110.0, stock: 'ENTREGA_INMEDIATA' },
  'TC-P3S019': { precio: 180.0, stock: 'ENTREGA_INMEDIATA' }
};

export async function runSeed() {
  console.log('--- Iniciando carga inicial desde datasheets de muestra ---');
  
  if (!fs.existsSync(samplesDir)) {
    console.log(`No se encontró el directorio ${samplesDir}`);
    return;
  }

  const subfolders = ['CAMARAS', 'NVRs', 'SWITCHES'];
  let procesados = 0;

  for (const folder of subfolders) {
    const fullPath = path.join(samplesDir, folder);
    if (!fs.existsSync(fullPath)) continue;

    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.pdf'));
    console.log(`Procesando carpeta ${folder}: ${files.length} archivos encontrados.`);

    for (const file of files) {
      try {
        const filePath = path.join(fullPath, file);
        const buffer = fs.readFileSync(filePath);

        // Copiar a data/docs
        fs.copyFileSync(filePath, path.join(dataDocsDir, file));

        const parsed = await extractFromPdf(buffer, file);

        // Asignar precio y stock si existe en la planilla
        const modeloClave = Object.keys(preciosPlanilla).find(k => parsed.modelo.includes(k) || k.includes(parsed.modelo));
        if (modeloClave) {
          parsed.precio_usd = preciosPlanilla[modeloClave].precio;
          parsed.estado_stock = preciosPlanilla[modeloClave].stock;
        } else {
          parsed.precio_usd = parsed.tipo_dispositivo === 'CAMARA' ? 75.0 : parsed.tipo_dispositivo === 'NVR' ? 180.0 : 150.0;
          parsed.estado_stock = 'ENTREGA_INMEDIATA';
        }

        saveProducto(parsed);
        procesados++;
      } catch (err: any) {
        console.error(`Error procesando ${file}:`, err.message);
      }
    }
  }

  console.log(`--- Seed completado exitosamente: ${procesados} productos cargados en SQLite ---`);
}

// Ejecutar si se invoca directamente
runSeed().catch(console.error);
