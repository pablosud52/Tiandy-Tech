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
  validateProductCodes
} from '../db/index.js';
import { extractFromPdf } from '../services/pdf-extractor.js';
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
    res.status(400).json({ error: error.message });
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
    const { items } = req.body as { items: Array<any> };
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Formato inválido: se espera un array de items' });
    }
    const normalized = items.map(it => ({
      ...it,
      id: Number(it.id),
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

// 7. Subida de Imagen de Producto (para admin)
apiRouter.post('/upload-image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo de imagen' });
    }
    const imageUrl = `/data/images/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: imageUrl, 
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
