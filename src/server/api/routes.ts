import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getProductos, 
  getProductoById, 
  saveProducto, 
  deleteProducto, 
  batchUpdatePreciosStock, 
  getBadgesConfig 
} from '../db/index.js';
import { extractFromPdf } from '../services/pdf-extractor.js';
import { Producto, TipoDispositivo, EstadoStock } from '../../shared/types.js';

const uploadDir = path.resolve(process.cwd(), 'data/uploads');
const docsDir = path.resolve(process.cwd(), 'data/docs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

export const apiRouter = Router();

// 1. Obtener productos con filtros
apiRouter.get('/productos', (req, res) => {
  try {
    const { tipo, busqueda, serie, todos } = req.query;
    const productos = getProductos({
      tipo_dispositivo: tipo as TipoDispositivo,
      busqueda: busqueda as string,
      serie: serie as string,
      solo_visibles: todos !== 'true'
    });
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Obtener producto por ID
apiRouter.get('/productos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const prod = getProductoById(id);
    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(prod);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Crear o actualizar producto
apiRouter.post('/productos', (req, res) => {
  try {
    const prodData: Producto = req.body;
    if (!prodData.modelo || !prodData.tipo_dispositivo) {
      return res.status(400).json({ error: 'Modelo y tipo de dispositivo son obligatorios' });
    }
    const id = saveProducto(prodData);
    const saved = getProductoById(id);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Eliminar producto
apiRouter.delete('/productos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    deleteProducto(id);
    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Actualización masiva rápida de precios y stock (Quick Batch Editor)
apiRouter.post('/batch-update', (req, res) => {
  try {
    const { items } = req.body as { items: Array<{ id: number; precio_usd?: number; estado_stock?: EstadoStock; visible?: boolean }> };
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Formato inválido: se espera un array de items' });
    }
    batchUpdatePreciosStock(items);
    res.json({ success: true, count: items.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Extracción de Datasheet PDF
apiRouter.post('/extract-pdf', upload.single('datasheet'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo PDF' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    
    // Copiar también a data/docs para persistencia
    const destPdf = path.join(docsDir, req.file.originalname);
    fs.copyFileSync(filePath, destPdf);

    const parsedData = await extractFromPdf(fileBuffer, req.file.originalname);
    
    // Limpiar archivo temporal de upload
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    res.status(500).json({ error: `Error procesando PDF: ${error.message}` });
  }
});

// 7. Configuración de badges
apiRouter.get('/badges', (req, res) => {
  try {
    const badges = getBadgesConfig();
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Estadísticas para dashboard del admin
apiRouter.get('/stats', (req, res) => {
  try {
    const todos = getProductos({ solo_visibles: false });
    const stats = {
      total: todos.length,
      camaras: todos.filter(p => p.tipo_dispositivo === 'CAMARA').length,
      nvrs: todos.filter(p => p.tipo_dispositivo === 'NVR').length,
      switches: todos.filter(p => p.tipo_dispositivo === 'SWITCH').length,
      stock_inmediato: todos.filter(p => p.estado_stock === 'ENTREGA_INMEDIATA').length,
      pocas_unidades: todos.filter(p => p.estado_stock === 'POCAS_UNIDADES' || p.estado_stock === 'ULTIMA_UNIDAD').length,
      proximo_arribo: todos.filter(p => p.estado_stock === 'PROXIMO_ARRIBO').length,
      agotados: todos.filter(p => p.estado_stock === 'AGOTADO').length,
      ocultos: todos.filter(p => !p.visible).length
    };
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
