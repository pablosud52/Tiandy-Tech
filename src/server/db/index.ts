import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Producto, TipoDispositivo, EstadoStock, BadgeConfig } from '../../shared/types.js';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/tiandy.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export let db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

export function checkpointDatabase(): void {
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  } catch (err) {
    console.warn('[DB] Error en wal_checkpoint:', err);
  }
}

export function closeDatabase(): void {
  try {
    db.close();
  } catch (err) {
    console.warn('[DB] Error al cerrar base de datos:', err);
  }
}

export function reopenDatabase(): void {
  try {
    db.close();
  } catch {}
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
}

// Inicializar tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo TEXT UNIQUE NOT NULL,
    especificacion_completa TEXT,
    serie TEXT,
    tipo_dispositivo TEXT NOT NULL,
    subtipo TEXT,
    badge_nuevo INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    precio_usd REAL,
    estado_stock TEXT DEFAULT 'ENTREGA_INMEDIATA',
    fecha_arribo_estimada TEXT,
    codigo_1 TEXT,
    codigo_2 TEXT,
    codigo_interno TEXT,
    codigo_barras_ean TEXT,
    imagen_principal TEXT,
    galeria TEXT,
    datasheet_pdf TEXT,
    badges_detectados TEXT,
    datos_tecnicos TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS badges_config (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    posicion TEXT DEFAULT 'top-right',
    bg_color TEXT,
    text_color TEXT,
    icono TEXT,
    activo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS series_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo_dispositivo TEXT NOT NULL,
    UNIQUE(nombre, tipo_dispositivo)
  );

  CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT,
    rol TEXT DEFAULT 'ADMIN',
    activo INTEGER DEFAULT 1,
    ultimo_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sesiones_admin (
    token TEXT PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(usuario_id) REFERENCES usuarios_admin(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

// Migración retrocompatible para columnas codigo_1 y codigo_2 e índices
try { db.exec('ALTER TABLE productos ADD COLUMN codigo_1 TEXT;'); } catch (_) {}
try { db.exec('ALTER TABLE productos ADD COLUMN codigo_2 TEXT;'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_productos_cod1 ON productos(codigo_1);'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_productos_cod2 ON productos(codigo_2);'); } catch (_) {}

// Insertar badges predeterminados si la tabla está vacía
const badgeCount = db.prepare('SELECT count(*) as count FROM badges_config').get() as { count: number };
if (badgeCount.count === 0) {
  const insertBadge = db.prepare(`
    INSERT INTO badges_config (id, nombre, posicion, bg_color, text_color, icono, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultBadges = [
    { id: 'polar-day', nombre: 'Polar Day', posicion: 'top-left', bg_color: '#0284c7', text_color: '#ffffff', icono: 'Sun', activo: 1 },
    { id: 'colormaker', nombre: 'ColorMaker', posicion: 'top-left', bg_color: '#f59e0b', text_color: '#ffffff', icono: 'Palette', activo: 1 },
    { id: 'early-warning', nombre: 'Early Warning', posicion: 'top-right', bg_color: '#ef4444', text_color: '#ffffff', icono: 'BellRing', activo: 1 },
    { id: 'dual-sensor', nombre: '180° Panorámica', posicion: 'bottom-left', bg_color: '#6366f1', text_color: '#ffffff', icono: 'Scan', activo: 1 },
    { id: '4k', nombre: '4K Ultra HD', posicion: 'bottom-right', bg_color: '#10b981', text_color: '#ffffff', icono: 'Sparkles', activo: 1 },
    { id: 'smd2', nombre: 'SMD 2.0', posicion: 'top-right', bg_color: '#8b5cf6', text_color: '#ffffff', icono: 'Cpu', activo: 1 }
  ];

  for (const b of defaultBadges) {
    insertBadge.run(b.id, b.nombre, b.posicion, b.bg_color, b.text_color, b.icono, b.activo);
  }
}

// Funciones CRUD
export function getProductos(filters?: {
  tipo_dispositivo?: TipoDispositivo;
  busqueda?: string;
  serie?: string;
  solo_visibles?: boolean;
}): Producto[] {
  let query = 'SELECT * FROM productos WHERE 1=1';
  const params: any[] = [];

  if (filters?.solo_visibles !== false) {
    query += ' AND visible = 1';
  }

  if (filters?.tipo_dispositivo) {
    query += ' AND tipo_dispositivo = ?';
    params.push(filters.tipo_dispositivo);
  }

  if (filters?.serie !== undefined && filters.serie !== null && filters.serie !== '') {
    if (filters.serie === 'SIN_SERIE') {
      query += ` AND (serie IS NULL OR serie = '' OR LOWER(TRIM(serie)) = 'general series')`;
    } else {
      query += ' AND serie = ?';
      params.push(filters.serie);
    }
  }

  if (filters?.busqueda) {
    const terms = filters.busqueda.trim().split(/\s+/);
    for (const term of terms) {
      query += ` AND (
        modelo LIKE ? OR 
        especificacion_completa LIKE ? OR 
        serie LIKE ? OR 
        subtipo LIKE ? OR
        codigo_1 LIKE ? OR
        codigo_2 LIKE ? OR
        datos_tecnicos LIKE ?
      )`;
      const pattern = `%${term}%`;
      params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
    }
  }

  query += ' ORDER BY tipo_dispositivo ASC, modelo ASC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(r => ({
    ...r,
    codigo_1: r.codigo_1 || null,
    codigo_2: r.codigo_2 || null,
    badge_nuevo: Boolean(r.badge_nuevo),
    visible: Boolean(r.visible),
    galeria: r.galeria ? JSON.parse(r.galeria) : [],
    badges_detectados: r.badges_detectados ? JSON.parse(r.badges_detectados) : [],
    datos_tecnicos: r.datos_tecnicos ? JSON.parse(r.datos_tecnicos) : {}
  }));
}

export function getProductoById(id: number): Producto | null {
  const row = db.prepare('SELECT * FROM productos WHERE id = ?').get(id) as any;
  if (!row) return null;

  return {
    ...row,
    codigo_1: row.codigo_1 || null,
    codigo_2: row.codigo_2 || null,
    badge_nuevo: Boolean(row.badge_nuevo),
    visible: Boolean(row.visible),
    galeria: row.galeria ? JSON.parse(row.galeria) : [],
    badges_detectados: row.badges_detectados ? JSON.parse(row.badges_detectados) : [],
    datos_tecnicos: row.datos_tecnicos ? JSON.parse(row.datos_tecnicos) : {}
  };
}

export function getProductoByModelo(modelo: string): Producto | null {
  if (!modelo) return null;
  const row = db.prepare('SELECT * FROM productos WHERE UPPER(TRIM(modelo)) = UPPER(TRIM(?))').get(modelo) as any;
  if (!row) return null;

  return {
    ...row,
    codigo_1: row.codigo_1 || null,
    codigo_2: row.codigo_2 || null,
    badge_nuevo: Boolean(row.badge_nuevo),
    visible: Boolean(row.visible),
    galeria: row.galeria ? JSON.parse(row.galeria) : [],
    badges_detectados: row.badges_detectados ? JSON.parse(row.badges_detectados) : [],
    datos_tecnicos: row.datos_tecnicos ? JSON.parse(row.datos_tecnicos) : {}
  };
}

/**
 * Validador de unicidad para Código 1 y Código 2:
 * - Si están en blanco, son válidos (permitido).
 * - El mismo producto puede tener Código 1 igual a Código 2.
 * - Pero ningún OTRO producto puede tener códigos repetidos.
 */
export function validateProductCodes(
  codigo_1?: string | null,
  codigo_2?: string | null,
  excludeId?: number | null
): { valid: boolean; error?: string } {
  const c1 = (codigo_1 || '').trim();
  const c2 = (codigo_2 || '').trim();

  if (!c1 && !c2) return { valid: true };

  const otherProducts = db.prepare(`
    SELECT id, modelo, codigo_1, codigo_2 
    FROM productos 
    WHERE id != ?
  `).all(excludeId || -1) as any[];

  for (const other of otherProducts) {
    const o1 = (other.codigo_1 || '').trim();
    const o2 = (other.codigo_2 || '').trim();

    if (c1 && (c1 === o1 || c1 === o2)) {
      return {
        valid: false,
        error: `El Código 1 "${c1}" ya está asignado al producto "${other.modelo}". No puede haber códigos repetidos entre distintos productos.`
      };
    }

    if (c2 && (c2 === o1 || c2 === o2)) {
      return {
        valid: false,
        error: `El Código 2 "${c2}" ya está asignado al producto "${other.modelo}". No puede haber códigos repetidos entre distintos productos.`
      };
    }
  }

  return { valid: true };
}

export function saveProducto(prod: Producto): number {
  const datosTecnicosJson = JSON.stringify(prod.datos_tecnicos || {});
  const galeriaJson = JSON.stringify(prod.galeria || []);
  const badgesJson = JSON.stringify(prod.badges_detectados || []);

  const targetId = prod.id || (getProductoByModelo(prod.modelo)?.id);

  // Validación de unicidad de Código 1 y Código 2
  const codeValidation = validateProductCodes(prod.codigo_1, prod.codigo_2, targetId);
  if (!codeValidation.valid) {
    throw new Error(codeValidation.error);
  }

  const cod1 = prod.codigo_1 ? prod.codigo_1.trim() : null;
  const cod2 = prod.codigo_2 ? prod.codigo_2.trim() : null;

  if (targetId) {
    db.prepare(`
      UPDATE productos SET
        modelo = ?,
        especificacion_completa = ?,
        serie = ?,
        tipo_dispositivo = ?,
        subtipo = ?,
        badge_nuevo = ?,
        visible = ?,
        precio_usd = ?,
        estado_stock = ?,
        fecha_arribo_estimada = ?,
        codigo_1 = ?,
        codigo_2 = ?,
        codigo_interno = ?,
        codigo_barras_ean = ?,
        imagen_principal = ?,
        galeria = ?,
        datasheet_pdf = ?,
        badges_detectados = ?,
        datos_tecnicos = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      prod.modelo,
      prod.especificacion_completa,
      prod.serie || '',
      prod.tipo_dispositivo,
      prod.subtipo || null,
      prod.badge_nuevo ? 1 : 0,
      prod.visible ? 1 : 0,
      prod.precio_usd,
      prod.estado_stock,
      prod.fecha_arribo_estimada || null,
      cod1,
      cod2,
      prod.codigo_interno || null,
      prod.codigo_barras_ean || null,
      prod.imagen_principal || '',
      galeriaJson,
      prod.datasheet_pdf || '',
      badgesJson,
      datosTecnicosJson,
      targetId
    );
    return targetId;
  } else {
    const info = db.prepare(`
      INSERT INTO productos (
        modelo, especificacion_completa, serie, tipo_dispositivo, subtipo,
        badge_nuevo, visible, precio_usd, estado_stock, fecha_arribo_estimada,
        codigo_1, codigo_2, codigo_interno, codigo_barras_ean, imagen_principal, galeria,
        datasheet_pdf, badges_detectados, datos_tecnicos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      prod.modelo,
      prod.especificacion_completa,
      prod.serie || '',
      prod.tipo_dispositivo,
      prod.subtipo || null,
      prod.badge_nuevo ? 1 : 0,
      prod.visible ? 1 : 0,
      prod.precio_usd,
      prod.estado_stock,
      prod.fecha_arribo_estimada || null,
      cod1,
      cod2,
      prod.codigo_interno || null,
      prod.codigo_barras_ean || null,
      prod.imagen_principal || '',
      galeriaJson,
      prod.datasheet_pdf || '',
      badgesJson,
      datosTecnicosJson
    );
    return Number(info.lastInsertRowid);
  }
}

export function batchUpdatePreciosStock(updates: Array<{
  id: number;
  precio_usd?: number | null;
  estado_stock?: EstadoStock;
  visible?: boolean;
}>) {
  const updateStmt = db.prepare(`
    UPDATE productos SET
      precio_usd = COALESCE(?, precio_usd),
      estado_stock = COALESCE(?, estado_stock),
      visible = COALESCE(?, visible),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    for (const item of updates) {
      updateStmt.run(
        item.precio_usd !== undefined ? item.precio_usd : null,
        item.estado_stock !== undefined ? item.estado_stock : null,
        item.visible !== undefined ? (item.visible ? 1 : 0) : null,
        item.id
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function deleteProducto(id: number) {
  db.prepare('DELETE FROM productos WHERE id = ?').run(id);
}

export function getBadgesConfig(): BadgeConfig[] {
  const rows = db.prepare('SELECT * FROM badges_config WHERE activo = 1').all() as any[];
  return rows.map(r => ({
    ...r,
    activo: Boolean(r.activo)
  }));
}

// ==========================================
// AUTENTICACIÓN Y USUARIOS ADMINISTRADORES
// ==========================================

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

// Sembrar administrador por defecto si no existe ninguno
const adminCount = db.prepare('SELECT count(*) as count FROM usuarios_admin').get() as { count: number };
if (adminCount.count === 0) {
  const defaultHash = hashPassword('admin');
  db.prepare(`
    INSERT INTO usuarios_admin (username, password_hash, nombre, email, rol, activo)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run('admin', defaultHash, 'Administrador Tiandy', 'admin@tiandy.local', 'SUPERADMIN');
  console.log('👤 Cuenta de administrador por defecto inicializada: admin / admin');
}

export function authenticateUser(username: string, password: string) {
  const user = db.prepare('SELECT * FROM usuarios_admin WHERE username = ? AND activo = 1').get(username) as any;
  if (!user) return null;

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) return null;

  // Actualizar último login
  db.prepare('UPDATE usuarios_admin SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  // Crear sesión (duración: 4 horas para exigir re-autenticación)
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sesiones_admin (token, usuario_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      ultimo_login: user.ultimo_login
    }
  };
}

export function validateSession(token: string) {
  if (!token) return null;
  const session = db.prepare(`
    SELECT s.token, u.id, u.username, u.nombre, u.email, u.rol, u.activo, s.expires_at
    FROM sesiones_admin s
    JOIN usuarios_admin u ON s.usuario_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now') AND u.activo = 1
  `).get(token) as any;

  if (!session) return null;
  return {
    id: session.id,
    username: session.username,
    nombre: session.nombre,
    email: session.email,
    rol: session.rol
  };
}

export function deleteSession(token: string) {
  db.prepare('DELETE FROM sesiones_admin WHERE token = ?').run(token);
}

export function getAdminUsers() {
  const rows = db.prepare('SELECT id, username, nombre, email, rol, activo, ultimo_login, created_at FROM usuarios_admin ORDER BY created_at ASC').all() as any[];
  return rows.map(r => ({ ...r, activo: Boolean(r.activo) }));
}

export function createAdminUser(data: { username: string; password: string; nombre: string; email?: string; rol?: string }) {
  const hash = hashPassword(data.password);
  const info = db.prepare(`
    INSERT INTO usuarios_admin (username, password_hash, nombre, email, rol, activo)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(data.username, hash, data.nombre, data.email || null, data.rol || 'ADMIN');
  return info.lastInsertRowid;
}

export function updateAdminUser(id: number, data: { nombre?: string; email?: string; rol?: string; activo?: boolean; password?: string }) {
  if (data.password && data.password.trim().length > 0) {
    const hash = hashPassword(data.password.trim());
    db.prepare('UPDATE usuarios_admin SET password_hash = ? WHERE id = ?').run(hash, id);
  }
  db.prepare(`
    UPDATE usuarios_admin SET
      nombre = COALESCE(?, nombre),
      email = COALESCE(?, email),
      rol = COALESCE(?, rol),
      activo = COALESCE(?, activo)
    WHERE id = ?
  `).run(
    data.nombre || null,
    data.email !== undefined ? data.email : null,
    data.rol || null,
    data.activo !== undefined ? (data.activo ? 1 : 0) : null,
    id
  );
}

export function deleteAdminUser(id: number) {
  const count = db.prepare('SELECT count(*) as count FROM usuarios_admin').get() as { count: number };
  if (count.count <= 1) {
    throw new Error('No se puede eliminar el único usuario administrador existente.');
  }
  db.prepare('DELETE FROM sesiones_admin WHERE usuario_id = ?').run(id);
  db.prepare('DELETE FROM usuarios_admin WHERE id = ?').run(id);
}

export function getConfiguracion(clave: string, valorPorDefecto: string = ''): string {
  try {
    const row = db.prepare('SELECT valor FROM configuracion WHERE clave = ?').get(clave) as any;
    return row ? row.valor : valorPorDefecto;
  } catch {
    return valorPorDefecto;
  }
}

export function setConfiguracion(clave: string, valor: string): void {
  db.prepare(`
    INSERT INTO configuracion (clave, valor)
    VALUES (?, ?)
    ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
  `).run(clave, valor);
}


