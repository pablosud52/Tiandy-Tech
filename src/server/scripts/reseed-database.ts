import fs from 'fs';
import path from 'path';
import { db, saveProducto } from '../db/index.js';
import { extractFromPdf } from '../services/pdf-extractor.js';

async function main() {
  console.log('🔄 Iniciando reseteo y re-extracción de la base de datos...');
  
  // 1. Limpiar la tabla de productos actual
  db.exec('DELETE FROM productos;');
  console.log('🧹 Base de datos de productos limpiada.');

  const docsDir = path.resolve(process.cwd(), 'data/docs');
  const imagesDir = path.resolve(process.cwd(), 'data/images');
  
  if (!fs.existsSync(docsDir)) {
    console.error('❌ Directorio data/docs no existe.');
    process.exit(1);
  }

  const existingImages = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

  const files = fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📁 Encontrados ${files.length} datasheets PDF en ${docsDir}.\n`);

  let countOk = 0;
  let countErr = 0;

  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    try {
      const buffer = fs.readFileSync(fullPath);
      const prod = await extractFromPdf(buffer, file);

      // Buscar si existe una imagen cargada previamente para este modelo base
      const modeloBase = prod.modelo.split(' ')[0].toUpperCase();
      const matchedImg = existingImages.find(img => img.toUpperCase().includes(modeloBase));
      if (matchedImg) {
        prod.imagen_principal = `/data/images/${matchedImg}`;
      }

      saveProducto(prod);
      countOk++;
      console.log(`✅ [${prod.tipo_dispositivo}] ${prod.modelo} (${prod.serie})`);
    } catch (err: any) {
      countErr++;
      console.error(`❌ Error procesando ${file}:`, err.message);
    }
  }

  const total = db.prepare('SELECT count(*) as count FROM productos').get() as { count: number };
  const camaras = db.prepare("SELECT count(*) as count FROM productos WHERE tipo_dispositivo = 'CAMARA'").get() as { count: number };
  const nvrs = db.prepare("SELECT count(*) as count FROM productos WHERE tipo_dispositivo = 'NVR'").get() as { count: number };
  const switches = db.prepare("SELECT count(*) as count FROM productos WHERE tipo_dispositivo = 'SWITCH'").get() as { count: number };

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE LA RE-EXTRACCIÓN:');
  console.log(`   Total productos en BD : ${total.count}`);
  console.log(`   Cámaras IP            : ${camaras.count}`);
  console.log(`   NVRs / Grabadores     : ${nvrs.count}`);
  console.log(`   Switches PoE          : ${switches.count}`);
  console.log(`   Éxitos / Errores      : ${countOk} / ${countErr}`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
