import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Producto, TipoDispositivo, EstadoStock, BadgeConfig } from '../../shared/types.js';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/tiandy.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

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
`);

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

  if (filters?.serie) {
    query += ' AND serie = ?';
    params.push(filters.serie);
  }

  if (filters?.busqueda) {
    const terms = filters.busqueda.trim().split(/\s+/);
    for (const term of terms) {
      query += ` AND (
        modelo LIKE ? OR 
        especificacion_completa LIKE ? OR 
        serie LIKE ? OR 
        subtipo LIKE ? OR
        datos_tecnicos LIKE ?
      )`;
      const pattern = `%${term}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }
  }

  query += ' ORDER BY tipo_dispositivo ASC, modelo ASC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(r => ({
    ...r,
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
    badge_nuevo: Boolean(row.badge_nuevo),
    visible: Boolean(row.visible),
    galeria: row.galeria ? JSON.parse(row.galeria) : [],
    badges_detectados: row.badges_detectados ? JSON.parse(row.badges_detectados) : [],
    datos_tecnicos: row.datos_tecnicos ? JSON.parse(row.datos_tecnicos) : {}
  };
}

export function getProductoByModelo(modelo: string): Producto | null {
  const row = db.prepare('SELECT * FROM productos WHERE modelo = ?').get(modelo) as any;
  if (!row) return null;

  return {
    ...row,
    badge_nuevo: Boolean(row.badge_nuevo),
    visible: Boolean(row.visible),
    galeria: row.galeria ? JSON.parse(row.galeria) : [],
    badges_detectados: row.badges_detectados ? JSON.parse(row.badges_detectados) : [],
    datos_tecnicos: row.datos_tecnicos ? JSON.parse(row.datos_tecnicos) : {}
  };
}

export function saveProducto(prod: Producto): number {
  const datosTecnicosJson = JSON.stringify(prod.datos_tecnicos || {});
  const galeriaJson = JSON.stringify(prod.galeria || []);
  const badgesJson = JSON.stringify(prod.badges_detectados || []);

  const existing = getProductoByModelo(prod.modelo);

  if (existing && existing.id) {
    db.prepare(`
      UPDATE productos SET
        especificacion_completa = ?,
        serie = ?,
        tipo_dispositivo = ?,
        subtipo = ?,
        badge_nuevo = ?,
        visible = ?,
        precio_usd = ?,
        estado_stock = ?,
        fecha_arribo_estimada = ?,
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
      prod.especificacion_completa,
      prod.serie,
      prod.tipo_dispositivo,
      prod.subtipo || null,
      prod.badge_nuevo ? 1 : 0,
      prod.visible ? 1 : 0,
      prod.precio_usd,
      prod.estado_stock,
      prod.fecha_arribo_estimada || null,
      prod.codigo_interno || null,
      prod.codigo_barras_ean || null,
      prod.imagen_principal || '',
      galeriaJson,
      prod.datasheet_pdf || '',
      badgesJson,
      datosTecnicosJson,
      existing.id
    );
    return existing.id;
  } else {
    const info = db.prepare(`
      INSERT INTO productos (
        modelo, especificacion_completa, serie, tipo_dispositivo, subtipo,
        badge_nuevo, visible, precio_usd, estado_stock, fecha_arribo_estimada,
        codigo_interno, codigo_barras_ean, imagen_principal, galeria,
        datasheet_pdf, badges_detectados, datos_tecnicos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      prod.modelo,
      prod.especificacion_completa,
      prod.serie,
      prod.tipo_dispositivo,
      prod.subtipo || null,
      prod.badge_nuevo ? 1 : 0,
      prod.visible ? 1 : 0,
      prod.precio_usd,
      prod.estado_stock,
      prod.fecha_arribo_estimada || null,
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

  const runMany = db.transaction((items) => {
    for (const item of items) {
      updateStmt.run(
        item.precio_usd !== undefined ? item.precio_usd : null,
        item.estado_stock !== undefined ? item.estado_stock : null,
        item.visible !== undefined ? (item.visible ? 1 : 0) : null,
        item.id
      );
    }
  });

  runMany(updates);
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
