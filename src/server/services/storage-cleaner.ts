import fs from 'fs';
import path from 'path';
import { db } from '../db/index.js';
import { Producto } from '../../shared/types.js';

const docsDir = path.resolve(process.cwd(), 'data/docs');
const imagesDir = path.resolve(process.cwd(), 'data/images');
const uploadsDir = path.resolve(process.cwd(), 'data/uploads');

export interface StorageStatus {
  docs: {
    totalFiles: number;
    totalSizeBytes: number;
    orphanedFiles: number;
    orphanedSizeBytes: number;
    orphanedList: string[];
  };
  images: {
    totalFiles: number;
    totalSizeBytes: number;
    orphanedFiles: number;
    orphanedSizeBytes: number;
    orphanedList: string[];
  };
  uploads: {
    totalFiles: number;
    totalSizeBytes: number;
    orphanedFiles: number;
    orphanedSizeBytes: number;
    orphanedList: string[];
  };
  totalOrphanedBytes: number;
  totalOrphanedCount: number;
}

export interface CleanResult {
  deletedPdfs: string[];
  deletedImages: string[];
  deletedUploads: string[];
  totalBytesFreed: number;
  totalFilesDeleted: number;
}

/**
 * Audita el almacenamiento físico comparando los archivos en disco
 * contra las referencias activas en la tabla 'productos' de SQLite.
 */
export function getStorageAudit(): StorageStatus {
  // Obtener todas las referencias en base de datos
  const prods = db.prepare('SELECT id, modelo, datasheet_pdf, imagen_principal, galeria FROM productos').all() as any[];

  const referencedPdfs = new Set<string>();
  const referencedImages = new Set<string>();

  for (const p of prods) {
    if (p.datasheet_pdf) {
      referencedPdfs.add(path.basename(p.datasheet_pdf).toLowerCase());
    }
    if (p.imagen_principal) {
      referencedImages.add(path.basename(p.imagen_principal).toLowerCase());
    }
    if (p.galeria) {
      try {
        const arr = JSON.parse(p.galeria);
        if (Array.isArray(arr)) {
          arr.forEach((g: string) => referencedImages.add(path.basename(g).toLowerCase()));
        }
      } catch {}
    }
  }

  // Proteger también imágenes activas en la configuración global de etiquetas (global_badges_config)
  try {
    const configRow = db.prepare("SELECT valor FROM configuracion WHERE clave = 'global_badges_config'").get() as any;
    if (configRow && configRow.valor) {
      const badges = JSON.parse(configRow.valor);
      if (Array.isArray(badges)) {
        badges.forEach((b: any) => {
          if (b.imagen_url && typeof b.imagen_url === 'string') {
            referencedImages.add(path.basename(b.imagen_url).toLowerCase());
          }
        });
      }
    }
  } catch {}

  // Auditar data/docs
  const docsFiles = fs.existsSync(docsDir) ? fs.readdirSync(docsDir) : [];
  let docsTotalBytes = 0;
  let docsOrphanedBytes = 0;
  const docsOrphanedList: string[] = [];

  for (const file of docsFiles) {
    if (file === '.gitkeep') continue;
    const fullPath = path.join(docsDir, file);
    try {
      const stat = fs.statSync(fullPath);
      docsTotalBytes += stat.size;
      if (!referencedPdfs.has(file.toLowerCase())) {
        docsOrphanedBytes += stat.size;
        docsOrphanedList.push(file);
      }
    } catch {}
  }

  // Auditar data/images
  const imgFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
  let imgTotalBytes = 0;
  let imgOrphanedBytes = 0;
  const imgOrphanedList: string[] = [];

  for (const file of imgFiles) {
    if (file === '.gitkeep') continue;
    const fullPath = path.join(imagesDir, file);
    try {
      const stat = fs.statSync(fullPath);
      imgTotalBytes += stat.size;
      if (!referencedImages.has(file.toLowerCase())) {
        imgOrphanedBytes += stat.size;
        imgOrphanedList.push(file);
      }
    } catch {}
  }

  // Auditar data/uploads
  const uploadFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  let uploadTotalBytes = 0;
  const uploadOrphanedList: string[] = [];

  for (const file of uploadFiles) {
    if (file === '.gitkeep') continue;
    const fullPath = path.join(uploadsDir, file);
    try {
      const stat = fs.statSync(fullPath);
      uploadTotalBytes += stat.size;
      uploadOrphanedList.push(file);
    } catch {}
  }

  const totalOrphanedBytes = docsOrphanedBytes + imgOrphanedBytes + uploadTotalBytes;
  const totalOrphanedCount = docsOrphanedList.length + imgOrphanedList.length + uploadOrphanedList.length;

  return {
    docs: {
      totalFiles: docsFiles.filter(f => f !== '.gitkeep').length,
      totalSizeBytes: docsTotalBytes,
      orphanedFiles: docsOrphanedList.length,
      orphanedSizeBytes: docsOrphanedBytes,
      orphanedList: docsOrphanedList
    },
    images: {
      totalFiles: imgFiles.filter(f => f !== '.gitkeep').length,
      totalSizeBytes: imgTotalBytes,
      orphanedFiles: imgOrphanedList.length,
      orphanedSizeBytes: imgOrphanedBytes,
      orphanedList: imgOrphanedList
    },
    uploads: {
      totalFiles: uploadFiles.filter(f => f !== '.gitkeep').length,
      totalSizeBytes: uploadTotalBytes,
      orphanedFiles: uploadOrphanedList.length,
      orphanedSizeBytes: uploadTotalBytes,
      orphanedList: uploadOrphanedList
    },
    totalOrphanedBytes,
    totalOrphanedCount
  };
}

/**
 * Pasa de forma segura y elimina todos los archivos huérfanos detectados
 * en data/docs, data/images y data/uploads, preservando los archivos .gitkeep.
 */
export function cleanOrphanedFiles(): CleanResult {
  const audit = getStorageAudit();
  let totalBytesFreed = 0;
  const deletedPdfs: string[] = [];
  const deletedImages: string[] = [];
  const deletedUploads: string[] = [];

  // 1. Borrar PDFs huérfanos de data/docs
  for (const file of audit.docs.orphanedList) {
    const fullPath = path.join(docsDir, file);
    try {
      if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).size;
        fs.unlinkSync(fullPath);
        totalBytesFreed += size;
        deletedPdfs.push(file);
      }
    } catch (e) {
      console.error(`[Storage] Error borrando PDF huérfano ${file}:`, e);
    }
  }

  // 2. Borrar imágenes huérfanas de data/images
  for (const file of audit.images.orphanedList) {
    const fullPath = path.join(imagesDir, file);
    try {
      if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).size;
        fs.unlinkSync(fullPath);
        totalBytesFreed += size;
        deletedImages.push(file);
      }
    } catch (e) {
      console.error(`[Storage] Error borrando imagen huérfana ${file}:`, e);
    }
  }

  // 3. Borrar archivos residuales de data/uploads
  for (const file of audit.uploads.orphanedList) {
    const fullPath = path.join(uploadsDir, file);
    try {
      if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).size;
        fs.unlinkSync(fullPath);
        totalBytesFreed += size;
        deletedUploads.push(file);
      }
    } catch (e) {
      console.error(`[Storage] Error borrando upload residual ${file}:`, e);
    }
  }

  return {
    deletedPdfs,
    deletedImages,
    deletedUploads,
    totalBytesFreed,
    totalFilesDeleted: deletedPdfs.length + deletedImages.length + deletedUploads.length
  };
}

/**
 * Borra en cascada los archivos adjuntos (PDF e imagen) de un producto al eliminarlo,
 * siempre que ningún otro producto en el catálogo los esté compartiendo.
 */
export function cleanupProductFilesOnDelete(product?: Partial<Producto> | null) {
  if (!product) return;
  const excludeId = product.id;

  // 1. Limpieza de PDF en data/docs
  if (product.datasheet_pdf && product.datasheet_pdf.includes('/data/docs/')) {
    const pdfFilename = path.basename(product.datasheet_pdf);
    const countRow = db.prepare(`
      SELECT COUNT(*) as count FROM productos 
      WHERE id != ? AND (datasheet_pdf LIKE ? OR datasheet_pdf LIKE ?)
    `).get(excludeId || -1, `%/data/docs/${pdfFilename}`, `%/${pdfFilename}`) as any;

    if (!countRow || countRow.count === 0) {
      const fullPath = path.join(docsDir, pdfFilename);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`[Storage] PDF eliminado en cascada: ${pdfFilename}`);
        } catch (err) {
          console.warn(`[Storage] No se pudo eliminar PDF en cascada ${pdfFilename}:`, err);
        }
      }
    }
  }

  // 2. Limpieza de Imagen Principal en data/images
  if (product.imagen_principal && product.imagen_principal.includes('/data/images/')) {
    const imgFilename = path.basename(product.imagen_principal);
    const countRow = db.prepare(`
      SELECT COUNT(*) as count FROM productos 
      WHERE id != ? AND (imagen_principal LIKE ? OR imagen_principal LIKE ?)
    `).get(excludeId || -1, `%/data/images/${imgFilename}`, `%/${imgFilename}`) as any;

    if (!countRow || countRow.count === 0) {
      const fullPath = path.join(imagesDir, imgFilename);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`[Storage] Imagen eliminada en cascada: ${imgFilename}`);
        } catch (err) {
          console.warn(`[Storage] No se pudo eliminar imagen en cascada ${imgFilename}:`, err);
        }
      }
    }
  }
}

/**
 * Borra del disco la imagen vieja cuando un usuario sube una nueva para el mismo producto.
 */
export function cleanupReplacedImage(oldImageUrl?: string, newImageUrl?: string, productId?: number) {
  if (!oldImageUrl || !oldImageUrl.includes('/data/images/')) return;
  if (oldImageUrl === newImageUrl) return;

  const oldFilename = path.basename(oldImageUrl);
  const countRow = db.prepare(`
    SELECT COUNT(*) as count FROM productos 
    WHERE id != ? AND (imagen_principal LIKE ? OR imagen_principal LIKE ?)
  `).get(productId || -1, `%/data/images/${oldFilename}`, `%/${oldFilename}`) as any;

  if (!countRow || countRow.count === 0) {
    const fullPath = path.join(imagesDir, oldFilename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[Storage] Imagen previa reemplazada eliminada de disco: ${oldFilename}`);
      } catch (err) {
        console.warn(`[Storage] No se pudo eliminar imagen previa ${oldFilename}:`, err);
      }
    }
  }
}
