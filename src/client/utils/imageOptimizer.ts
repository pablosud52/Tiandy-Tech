/**
 * Utilidad de optimización y compresión de imágenes en el cliente (Browser Canvas API)
 * - Convierte a formato WebP moderno de alta eficiencia
 * - Redimensiona proporcionalmente a dimensiones máximas (por defecto 800x800 px)
 * - Calidad calibrada (0.85) para imágenes técnicas nítidas y livianas (<80 KB)
 * - 100% nativo del navegador, sin dependencias externas ni consumo excesivo de servidor
 */

export interface OptimizedImageResult {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  format: 'image/webp' | 'image/jpeg';
}

export async function optimizeImageToWebP(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Redimensionamiento proporcional si supera la dimensión máxima
      if (targetWidth > maxDimension || targetHeight > maxDimension) {
        const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * ratio));
        targetHeight = Math.max(1, Math.round(targetHeight * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo inicializar el contexto de imagen 2D del navegador'));
        return;
      }

      // Suavizado bicúbico de alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dibujar imagen escalada
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Limpiar nombre base para el archivo .webp
      const rawBase = file.name.replace(/\.[^/.]+$/, '');
      const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_') || 'producto';

      // Exportar en WebP (con fallback a JPEG si el motor del navegador no soporta webp)
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.type === 'image/webp') {
            resolve({
              blob: webpBlob,
              fileName: `${cleanBase}.webp`,
              width: targetWidth,
              height: targetHeight,
              originalSize: file.size,
              optimizedSize: webpBlob.size,
              format: 'image/webp'
            });
          } else {
            // Fallback a JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error('No se pudo generar el archivo de imagen optimizado'));
                  return;
                }
                resolve({
                  blob: jpegBlob,
                  fileName: `${cleanBase}.jpg`,
                  width: targetWidth,
                  height: targetHeight,
                  originalSize: file.size,
                  optimizedSize: jpegBlob.size,
                  format: 'image/jpeg'
                });
              },
              'image/jpeg',
              quality
            );
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo decodificar o leer el archivo de imagen'));
    };

    img.src = objectUrl;
  });
}

/** Formatea bytes a KB o MB legibles */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
