import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { db, checkpointDatabase, closeDatabase, reopenDatabase, getProductos, getConfiguracion } from '../db/index.js';

export interface BackupStorageStats {
  dbSize: number;
  docsCount: number;
  docsSize: number;
  imagesCount: number;
  imagesSize: number;
  badgesCount: number;
  badgesSize: number;
  totalSize: number;
  totalFiles: number;
  totalProducts: number;
  totalUsers: number;
  countsByType: {
    camaras: number;
    nvrs: number;
    switches: number;
    accesorios: number;
  };
}

// Helper para calcular conteo y tamaño de archivos en un directorio
function getDirStats(dirPath: string): { count: number; size: number } {
  if (!fs.existsSync(dirPath)) return { count: 0, size: 0 };
  let count = 0;
  let size = 0;

  function walk(current: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        count++;
        try {
          size += fs.statSync(full).size;
        } catch {}
      }
    }
  }

  walk(dirPath);
  return { count, size };
}

/**
 * Obtiene métricas en tiempo real del almacenamiento y base de datos
 */
export function getBackupStorageStats(): BackupStorageStats {
  const rootDir = process.cwd();
  const dataDir = path.resolve(rootDir, 'data');
  const dbFile = path.join(dataDir, 'tiandy.db');

  let dbSize = 0;
  try {
    if (fs.existsSync(dbFile)) dbSize = fs.statSync(dbFile).size;
  } catch {}

  const docs = getDirStats(path.join(dataDir, 'docs'));
  const images = getDirStats(path.join(dataDir, 'images'));
  const badges = getDirStats(path.join(dataDir, 'badges'));
  const img = getDirStats(path.join(dataDir, 'img'));

  // Métricas de base de datos
  let totalProducts = 0;
  let totalUsers = 0;
  const countsByType = { camaras: 0, nvrs: 0, switches: 0, accesorios: 0 };

  try {
    const prods = db.prepare('SELECT tipo_dispositivo FROM productos').all() as any[];
    totalProducts = prods.length;
    countsByType.camaras = prods.filter(p => p.tipo_dispositivo === 'CAMARA').length;
    countsByType.nvrs = prods.filter(p => p.tipo_dispositivo === 'NVR').length;
    countsByType.switches = prods.filter(p => p.tipo_dispositivo === 'SWITCH').length;
    countsByType.accesorios = prods.filter(p => p.tipo_dispositivo === 'ACCESORIO').length;

    const uCount = db.prepare('SELECT count(*) as count FROM usuarios_admin').get() as any;
    totalUsers = uCount?.count || 0;
  } catch {}

  const totalSize = dbSize + docs.size + images.size + badges.size + img.size;
  const totalFiles = 1 + docs.count + images.count + badges.count + img.count;

  return {
    dbSize,
    docsCount: docs.count,
    docsSize: docs.size,
    imagesCount: images.count + img.count,
    imagesSize: images.size + img.size,
    badgesCount: badges.count,
    badgesSize: badges.size,
    totalSize,
    totalFiles,
    totalProducts,
    totalUsers,
    countsByType
  };
}

/**
 * Genera el paquete completo de respaldo en un archivo ZIP (.zip)
 * Incluye la base de datos SQLite consolidada (WAL checkpoint),
 * todos los PDFs, imágenes, distintivos y un manifest de metadatos.
 */
export function createBackupZip(): { buffer: Buffer; filename: string; stats: BackupStorageStats } {
  // 1. Consolidar SQLite WAL para asegurar que tiandy.db tenga el 100% de transacciones
  checkpointDatabase();

  const stats = getBackupStorageStats();
  const rootDir = process.cwd();
  const dataDir = path.resolve(rootDir, 'data');
  const zip = new AdmZip();

  // 2. Empaquetar base de datos principal
  const dbFile = path.join(dataDir, 'tiandy.db');
  if (fs.existsSync(dbFile)) {
    zip.addLocalFile(dbFile, 'data');
  }

  // 3. Empaquetar carpetas de contenido de forma recursiva
  const subdirs = ['docs', 'images', 'img', 'badges'];
  for (const sub of subdirs) {
    const fullSub = path.join(dataDir, sub);
    if (fs.existsSync(fullSub)) {
      zip.addLocalFolder(fullSub, `data/${sub}`);
    }
  }

  // 4. Incluir manifest.json descriptivo
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const manifest = {
    app: 'Tiandy Tech',
    backupVersion: '1.0.0',
    createdAt: now.toISOString(),
    stats
  };
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));

  const buffer = zip.toBuffer();
  const dateName = now.toISOString().split('T')[0];
  const filename = `tiandy-respaldo-completo-${dateName}.zip`;

  return { buffer, filename, stats };
}

/**
 * Restaura un respaldo completo desde un buffer de archivo ZIP.
 * Crea una copia preventiva de seguridad, valida la base de datos,
 * reemplaza los archivos y reabre la conexión SQLite.
 */
export async function restoreBackupFromBuffer(zipBuffer: Buffer): Promise<{
  success: boolean;
  message: string;
  stats: {
    totalProducts: number;
    dbSize: number;
    filesExtracted: number;
  };
}> {
  if (!zipBuffer || zipBuffer.length < 100) {
    throw new Error('El archivo de respaldo está vacío o dañado.');
  }

  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch (err: any) {
    throw new Error(`El archivo proporcionado no es un archivo ZIP válido: ${err.message}`);
  }

  // 1. Validar que contenga la base de datos tiandy.db
  const entries = zip.getEntries();
  const hasDb = entries.some(e => e.entryName.endsWith('tiandy.db'));
  if (!hasDb) {
    throw new Error('El respaldo no contiene el archivo de base de datos esencial "tiandy.db".');
  }

  const rootDir = process.cwd();
  const dataDir = path.resolve(rootDir, 'data');

  // 2. Crear respaldo preventivo de seguridad por si ocurriera un fallo
  const safetyBackupDir = path.resolve(rootDir, `data/.safety-backup-${Date.now()}`);
  try {
    if (!fs.existsSync(safetyBackupDir)) fs.mkdirSync(safetyBackupDir, { recursive: true });
    const currentDb = path.join(dataDir, 'tiandy.db');
    if (fs.existsSync(currentDb)) {
      fs.copyFileSync(currentDb, path.join(safetyBackupDir, 'tiandy.db'));
    }
  } catch (err) {
    console.warn('[BACKUP] No se pudo crear copia preventiva local:', err);
  }

  // 3. Cerrar conexión SQLite y remover archivos temporales WAL/SHM
  closeDatabase();

  const walFile = path.join(dataDir, 'tiandy.db-wal');
  const shmFile = path.join(dataDir, 'tiandy.db-shm');
  try { if (fs.existsSync(walFile)) fs.unlinkSync(walFile); } catch {}
  try { if (fs.existsSync(shmFile)) fs.unlinkSync(shmFile); } catch {}

  // 4. Extraer los archivos del ZIP en data/
  let filesExtracted = 0;
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    if (entry.entryName === 'manifest.json') continue;

    // Normalizar ruta de destino
    let relativePath = entry.entryName;
    if (relativePath.startsWith('data/')) {
      relativePath = relativePath.slice('data/'.length);
    }

    const destPath = path.join(dataDir, relativePath);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    fs.writeFileSync(destPath, entry.getData());
    filesExtracted++;
  }

  // 5. Reabrir conexión SQLite y verificar integridad
  reopenDatabase();

  let totalProducts = 0;
  try {
    const row = db.prepare('SELECT count(*) as count FROM productos').get() as any;
    totalProducts = row?.count || 0;
  } catch (dbErr: any) {
    throw new Error(`Error al verificar la base de datos restaurada: ${dbErr.message}`);
  }

  // 6. Regenerar snapshots estáticos para mantener catálogo sincronizado
  try {
    const publicDataDir = path.resolve(rootDir, 'public/data');
    if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

    const prods = getProductos({ solo_visibles: true });
    fs.writeFileSync(path.join(publicDataDir, 'productos.json'), JSON.stringify(prods, null, 2), 'utf-8');

    const secRow = getConfiguracion('secciones_visibles', '');
    if (secRow) {
      fs.writeFileSync(path.join(publicDataDir, 'sections.json'), JSON.stringify({ success: true, secciones: JSON.parse(secRow) }, null, 2), 'utf-8');
    }
  } catch (snapErr) {
    console.warn('[BACKUP] Error al actualizar snapshots tras restauración:', snapErr);
  }

  let dbSize = 0;
  try {
    dbSize = fs.statSync(path.join(dataDir, 'tiandy.db')).size;
  } catch {}

  return {
    success: true,
    message: `Respaldo restaurado con éxito. Se recuperaron ${totalProducts} productos y ${filesExtracted} archivos.`,
    stats: {
      totalProducts,
      dbSize,
      filesExtracted
    }
  };
}
