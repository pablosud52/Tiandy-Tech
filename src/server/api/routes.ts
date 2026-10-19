import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getProductos, 
  getProductoById, 
  getProductoByModelo,
  saveProducto, 
  deleteProducto, 
  batchUpdatePreciosStock, 
  getBadgesConfig,
  authenticateUser,
  validateSession,
  deleteSession,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  validateProductCodes,
  getConfiguracion,
  setConfiguracion
} from '../db/index.js';
import { extractFromPdf } from '../services/pdf-extractor.js';
import { 
  getStorageAudit, 
  cleanOrphanedFiles, 
  cleanupProductFilesOnDelete, 
  cleanupReplacedImage 
} from '../services/storage-cleaner.js';
import { executePublish, getLastPublishStatus } from '../services/publisher.js';
import { getResolvedGlobalBadges, saveGlobalBadges } from '../services/badges-service.js';
import { Producto, TipoDispositivo, EstadoStock } from '../../shared/types.js';

const uploadDir = path.resolve(process.cwd(), 'data/uploads');
const docsDir = path.resolve(process.cwd(), 'data/docs');
const imagesDir = path.resolve(process.cwd(), 'data/images');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Almacenamiento en memoria para PDFs (evita problemas de bloqueo de archivos en Google Drive / Windows)
const memoryUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 }
});

// Almacenamiento en disco para imágenes de productos en data/images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    let cleanExt = path.extname(file.originalname).toLowerCase();
    if (!cleanExt || cleanExt === '.blob') {
      cleanExt = file.mimetype === 'image/webp' ? '.webp' : (file.mimetype === 'image/png' ? '.png' : '.jpg');
    }
    const cleanBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, '_') || 'producto';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, `${cleanBase}-${uniqueSuffix}${cleanExt}`);
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

export const apiRouter = Router();

// Middleware para asegurar que las respuestas nunca se almacenen en caché (precios y catálogo en tiempo real)
apiRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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
    res.json({ success: true, data: productos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1b. Verificar existencia de modelo
apiRouter.get('/productos/check-model', (req, res) => {
  try {
    const modelo = req.query.modelo as string;
    if (!modelo || !modelo.trim()) {
      return res.json({ exists: false });
    }
    const clean = modelo.trim().toUpperCase();
    const existing = getProductoByModelo(clean);
    res.json({ exists: Boolean(existing), producto: existing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1c. Verificar disponibilidad de código 1 o código 2
apiRouter.get('/productos/check-code', (req, res) => {
  try {
    const { codigo, excludeId, campo } = req.query;
    if (!codigo || !String(codigo).trim()) {
      return res.json({ available: true });
    }
    const cleanCod = String(codigo).trim();
    const idNum = excludeId ? parseInt(String(excludeId), 10) : undefined;
    const validation = campo === 'codigo_2'
      ? validateProductCodes(null, cleanCod, idNum)
      : validateProductCodes(cleanCod, null, idNum);
    res.json({ available: validation.valid, error: validation.error });
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

// 3. Crear o actualizar producto (con limpieza de imagen reemplazada)
apiRouter.post('/productos', (req, res) => {
  try {
    const prodData: Producto = req.body;
    if (!prodData.modelo || !prodData.tipo_dispositivo) {
      return res.status(400).json({ error: 'Modelo y tipo de dispositivo son obligatorios' });
    }

    const targetId = prodData.id || (getProductoByModelo(prodData.modelo)?.id);
    let oldProduct: Producto | null = null;
    if (targetId) {
      oldProduct = getProductoById(targetId);
    }

    const id = saveProducto(prodData);

    // Si se reemplazó la imagen principal de un producto existente, borrar la imagen anterior huérfana
    if (oldProduct && oldProduct.imagen_principal && oldProduct.imagen_principal !== prodData.imagen_principal) {
      cleanupReplacedImage(oldProduct.imagen_principal, prodData.imagen_principal, id);
    }

    const saved = getProductoById(id);
    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Eliminar producto (con eliminación en cascada de PDF e imagen física si no son compartidos)
apiRouter.delete('/productos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const prod = getProductoById(id);
    if (prod) {
      cleanupProductFilesOnDelete(prod);
    }
    deleteProducto(id);
    res.json({ success: true, message: 'Producto y archivos asociados eliminados correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Actualización masiva rápida de precios y stock (Quick Batch Editor)
apiRouter.post('/batch-update', (req, res) => {
  try {
    const { items } = req.body as { items: Array<any> };
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Formato inválido: se espera un array de items' });
    }
    const normalized = items.map(it => ({
      ...it,
      id: Number(it.id),
      precio_usd: it.precio_usd !== undefined && it.precio_usd !== null 
        ? Math.round(Number(it.precio_usd) * 100) / 100 
        : undefined,
      visible: it.visible !== undefined ? it.visible : (it.activo !== undefined ? it.activo : undefined)
    }));
    batchUpdatePreciosStock(normalized);
    res.json({ success: true, count: normalized.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Extracción de Datasheet PDF (Usa memoria para cero bloqueo de archivos)
apiRouter.post('/extract-pdf', memoryUpload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const file = files && files.length > 0 ? files[0] : req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No se subió ningún archivo PDF válido' });
    }

    const fileBuffer = file.buffer;
    
    // Guardar copia de respaldo en data/docs de manera asíncrona segura
    try {
      const destPdf = path.join(docsDir, file.originalname);
      fs.writeFileSync(destPdf, fileBuffer);
    } catch (e) {
      console.warn('Aviso: no se pudo persistir copia en docs:', e);
    }

    const parsedData = await extractFromPdf(fileBuffer, file.originalname);

    res.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    res.status(500).json({ error: `Error procesando PDF: ${error.message}` });
  }
});

// 6b. Re-procesar en lote todos los datasheets PDF presentes en data/docs
apiRouter.post('/reprocess-all', async (req, res) => {
  try {
    if (!fs.existsSync(docsDir)) {
      return res.status(400).json({ success: false, error: 'No existe el directorio data/docs' });
    }
    const files = fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
    const existingImages = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
    let countOk = 0;
    let countErr = 0;

    for (const file of files) {
      try {
        const fullPath = path.join(docsDir, file);
        const buf = fs.readFileSync(fullPath);
        const prod = await extractFromPdf(buf, file);
        const modeloBase = prod.modelo.split(' ')[0].toUpperCase();

        // Si el producto ya existe en la base de datos, preservar la serie manual y datos ya configurados
        const existing = getProductoByModelo(prod.modelo) || getProductos().find(p => p.modelo.toUpperCase().startsWith(modeloBase));
        if (existing) {
          prod.id = existing.id;
          if (existing.serie && existing.serie.trim() && existing.serie.trim().toLowerCase() !== 'general series') {
            prod.serie = existing.serie;
          }
          if (existing.precio_usd !== null && existing.precio_usd !== undefined && existing.precio_usd > 0) {
            prod.precio_usd = existing.precio_usd;
          }
          if (existing.codigo_1) prod.codigo_1 = existing.codigo_1;
          if (existing.codigo_2) prod.codigo_2 = existing.codigo_2;
          if (existing.imagen_principal) prod.imagen_principal = existing.imagen_principal;
          if (existing.estado_stock) prod.estado_stock = existing.estado_stock;
        }

        const matchedImg = existingImages.find(img => img.toUpperCase().includes(modeloBase));
        if (matchedImg && !prod.imagen_principal) {
          prod.imagen_principal = `/data/images/${matchedImg}`;
        }
        saveProducto(prod);
        countOk++;
      } catch (e: any) {
        countErr++;
      }
    }

    res.json({ success: true, countOk, countErr, totalFiles: files.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Subida de Imagen de Producto o Etiqueta (para admin)
apiRouter.post('/upload-image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo de imagen' });
    }
    const imageUrl = `/data/images/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: imageUrl, 
      imageUrl: imageUrl, 
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Configuración de badges (legacy y compatibilidad)
apiRouter.get('/badges', (req, res) => {
  try {
    const badges = getBadgesConfig();
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7b. Configuración Global de Etiquetas Centralizadas
apiRouter.get('/configuracion/badges', (req, res) => {
  try {
    const badges = getResolvedGlobalBadges();
    res.json({ success: true, badges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/configuracion/badges', (req, res) => {
  try {
    const badges = Array.isArray(req.body) ? req.body : req.body.badges || [];
    if (!Array.isArray(badges) || badges.length === 0) {
      return res.status(400).json({ success: false, error: 'Lista de badges inválida' });
    }
    saveGlobalBadges(badges);
    res.json({ success: true, badges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7c. Configuración de Visibilidad de Secciones del Catálogo
const defaultSecciones = {
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

apiRouter.get('/configuracion/secciones', (req, res) => {
  try {
    const raw = getConfiguracion('secciones_visibles', JSON.stringify(defaultSecciones));
    const secciones = { ...defaultSecciones, ...JSON.parse(raw) };
    res.json({ success: true, secciones });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/configuracion/secciones', (req, res) => {
  try {
    const raw = getConfiguracion('secciones_visibles', JSON.stringify(defaultSecciones));
    const current = JSON.parse(raw);
    const updated = { ...defaultSecciones, ...current, ...(req.body || {}) };
    setConfiguracion('secciones_visibles', JSON.stringify(updated));
    res.json({ success: true, secciones: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
      accesorios: todos.filter(p => p.tipo_dispositivo === 'ACCESORIO').length,
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

// 9. Auditoría y Estado del Almacenamiento (Archivos y Huérfanos)
apiRouter.get('/storage/status', (req, res) => {
  try {
    const audit = getStorageAudit();
    res.json({ success: true, ...audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9b. Limpieza de Archivos Huérfanos
apiRouter.post('/storage/clean', (req, res) => {
  try {
    const result = cleanOrphanedFiles();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// RUTAS DE AUTENTICACIÓN Y USUARIOS ADMIN
// ==========================================

// Login de administrador
apiRouter.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
    }
    const result = authenticateUser(username, password);
    if (!result) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas o cuenta deshabilitada' });
    }
    res.json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validar sesión actual
apiRouter.get('/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const user = validateSession(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Sesión expirada o inválida' });
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cerrar sesión
apiRouter.post('/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) deleteSession(token);
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar usuarios administradores
apiRouter.get('/auth/users', (req, res) => {
  try {
    const users = getAdminUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear nuevo usuario administrador
apiRouter.post('/auth/users', (req, res) => {
  try {
    const { username, password, nombre, email, rol } = req.body;
    if (!username || !password || !nombre) {
      return res.status(400).json({ success: false, error: 'Usuario, contraseña y nombre son obligatorios' });
    }
    const id = createAdminUser({ username, password, nombre, email, rol });
    res.json({ success: true, id, message: 'Usuario creado con éxito' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Modificar usuario administrador
apiRouter.put('/auth/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    updateAdminUser(id, req.body);
    res.json({ success: true, message: 'Usuario actualizado con éxito' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Eliminar usuario administrador
apiRouter.delete('/auth/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    deleteAdminUser(id);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// PUBLICACIÓN EN CLOUDFLARE PAGES
// ==========================================

// Consultar estado de publicación
apiRouter.get('/admin/publish/status', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token || !validateSession(token)) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const status = getLastPublishStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disparar publicación a Cloudflare Pages
apiRouter.post('/admin/publish', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token || !validateSession(token)) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const result = await executePublish();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

