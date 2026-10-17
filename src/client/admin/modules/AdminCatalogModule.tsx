import React, { useState, useMemo, useEffect } from 'react';
import { Producto, TipoDispositivo, EstadoStock } from '../../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../../shared/helpers.js';
import { ProductEditForm } from '../components/ProductEditForm.js';
import { 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Plus, 
  Cctv, 
  HardDrive, 
  Network, 
  ExternalLink, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  Layers,
  Barcode,
  DollarSign,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface AdminCatalogModuleProps {
  productos: Producto[];
  onRefresh: () => void;
}

// Estilos de color para badges y selectores de stock
const getStockStyle = (stock?: string) => {
  switch (stock) {
    case 'ENTREGA_INMEDIATA':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-500 dark:border-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300'
      };
    case 'POCAS_UNIDADES':
    case 'ULTIMA_UNIDAD':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-500 dark:border-amber-500',
        text: 'text-amber-700 dark:text-amber-300'
      };
    case 'PROXIMO_ARRIBO':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        border: 'border-sky-500 dark:border-sky-500',
        text: 'text-sky-700 dark:text-sky-300'
      };
    case 'AGOTADO':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-500 dark:border-rose-500',
        text: 'text-rose-700 dark:text-rose-300'
      };
    case 'CONSULTAR':
    default:
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-500 dark:border-purple-500',
        text: 'text-purple-700 dark:text-purple-300'
      };
  }
};

export const AdminCatalogModule: React.FC<AdminCatalogModuleProps> = ({
  productos,
  onRefresh
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCodigo, setBusquedaCodigo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoDispositivo | 'TODOS'>('TODOS');
  const [filtroSerie, setFiltroSerie] = useState<string>('TODAS');
  const [filtroStock, setFiltroStock] = useState<string>('TODOS');

  // Modo modificación rápida de precios y stock
  const [modoEdicionPrecios, setModoEdicionPrecios] = useState(false);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [rowStatus, setRowStatus] = useState<Record<string, 'saving' | 'saved'>>({});

  // Modal de Edición / Creación
  const [editingProduct, setEditingProduct] = useState<Partial<Producto> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del almacenamiento y archivos huérfanos
  const [storageAudit, setStorageAudit] = useState<{ totalOrphanedCount: number; totalOrphanedBytes: number } | null>(null);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);

  const loadStorageStatus = async () => {
    try {
      const res = await fetch(`/api/storage/status?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setStorageAudit({
          totalOrphanedCount: data.totalOrphanedCount,
          totalOrphanedBytes: data.totalOrphanedBytes
        });
      }
    } catch {}
  };

  useEffect(() => {
    loadStorageStatus();
  }, []);

  const handleQuickCleanStorage = async () => {
    if (!window.confirm('¿Deseas purgar de forma segura todos los PDFs e imágenes huérfanas sin producto asignado en el catálogo?')) return;
    setIsCleaningStorage(true);
    try {
      const res = await fetch('/api/storage/clean', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const mb = (data.totalBytesFreed / (1024 * 1024)).toFixed(2);
        showToast(`✓ Limpieza completada: ${data.totalFilesDeleted} archivos eliminados (${mb} MB liberados)`);
        loadStorageStatus();
        onRefresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsCleaningStorage(false);
    }
  };

  // Conteo por categoría
  const counts = useMemo(() => {
    return {
      todas: productos.length,
      camaras: productos.filter((p) => p.tipo_dispositivo === 'CAMARA').length,
      nvrs: productos.filter((p) => p.tipo_dispositivo === 'NVR').length,
      switches: productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length,
      accesorios: productos.filter((p) => p.tipo_dispositivo === 'ACCESORIO').length
    };
  }, [productos]);

  const seriesDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.serie && p.serie.trim() && p.serie.trim().toLowerCase() !== 'general series') {
        set.add(p.serie.trim());
      }
    });
    return Array.from(set).sort();
  }, [productos]);

  // Cantidad de productos sin serie comercial asignada
  const countSinSerie = useMemo(() => {
    return productos.filter((p) => !p.serie || !p.serie.trim() || p.serie.trim().toLowerCase() === 'general series').length;
  }, [productos]);

  // Auto-reset si se resuelven todos los productos pendientes de serie y el filtro estaba en SIN_SERIE
  useEffect(() => {
    if (countSinSerie === 0 && filtroSerie === 'SIN_SERIE') {
      setFiltroSerie('TODAS');
    }
  }, [countSinSerie, filtroSerie]);

  // Filtrado reactivo
  const filteredList = useMemo(() => {
    return productos.filter((p) => {
      if (filtroTipo !== 'TODOS' && p.tipo_dispositivo !== filtroTipo) return false;
      
      // Filtro de Serie: soporte para ver exclusivamente productos sin serie
      if (filtroSerie === 'SIN_SERIE') {
        const isSin = !p.serie || !p.serie.trim() || p.serie.trim().toLowerCase() === 'general series';
        if (!isSin) return false;
      } else if (filtroSerie !== 'TODAS' && p.serie !== filtroSerie) {
        return false;
      }

      if (filtroStock !== 'TODOS' && p.estado_stock !== filtroStock) return false;

      // Buscador Exclusivo por Códigos (Código 1 y Código 2)
      if (busquedaCodigo.trim()) {
        const codQ = busquedaCodigo.toLowerCase().trim();
        const m1 = p.codigo_1 ? p.codigo_1.toLowerCase().includes(codQ) : false;
        const m2 = p.codigo_2 ? p.codigo_2.toLowerCase().includes(codQ) : false;
        if (!m1 && !m2) return false;
      }

      // Buscador General de Catálogo
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const specs = getProductSpecs(p);
        const matchModelo = p.modelo.toLowerCase().includes(q);
        const matchSerie = (p.serie || '').toLowerCase().includes(q);
        const matchSub = (p.subtipo || '').toLowerCase().includes(q);
        const matchSpec = (specs.resolucion + ' ' + specs.formato).toLowerCase().includes(q);
        if (!matchModelo && !matchSerie && !matchSub && !matchSpec) return false;
      }

      return true;
    });
  }, [productos, busqueda, busquedaCodigo, filtroTipo, filtroSerie, filtroStock]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const notifyCatalogSync = () => {
    try {
      const bc = new BroadcastChannel('tiandy_sync');
      bc.postMessage({ type: 'REFRESH_ALL' });
      bc.close();
    } catch {}
  };

  // Helpers para edición rápida de precio
  const getPriceInputValue = (prod: Producto) => {
    const key = String(prod.id);
    if (priceInputs[key] !== undefined) {
      return priceInputs[key];
    }
    const base = prod.precio_usd || 0;
    return base.toFixed(2);
  };

  const handlePriceInputChange = (id: number | string, val: string) => {
    const key = String(id);
    setPriceInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handlePriceCommit = async (prod: Producto) => {
    const key = String(prod.id);
    const raw = priceInputs[key] !== undefined ? priceInputs[key] : (prod.precio_usd || 0).toFixed(2);
    const parsed = parseFloat(raw.replace(',', '.')) || 0;
    const normalized = Math.max(0, Math.round(parsed * 100) / 100);
    const formatted = normalized.toFixed(2);

    setPriceInputs((prev) => ({ ...prev, [key]: formatted }));

    if (prod.precio_usd === normalized) {
      return;
    }

    setRowStatus((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: prod.id, precio_usd: normalized }]
        })
      });
      if (res.ok) {
        setRowStatus((prev) => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
          setRowStatus((prev) => {
            const next = { ...prev };
            if (next[key] === 'saved') delete next[key];
            return next;
          });
        }, 2200);
        notifyCatalogSync();
        onRefresh();
      }
    } catch (err: any) {
      showToast(`Error al guardar precio: ${err.message}`);
    } finally {
      setRowStatus((prev) => {
        if (prev[key] === 'saving') {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    }
  };

  // Helper para cambio rápido de stock con feedback
  const handleStockChange = async (prod: Producto, nuevoStock: EstadoStock) => {
    const key = String(prod.id);
    setRowStatus((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: prod.id, estado_stock: nuevoStock }]
        })
      });
      if (res.ok) {
        setRowStatus((prev) => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
          setRowStatus((prev) => {
            const next = { ...prev };
            if (next[key] === 'saved') delete next[key];
            return next;
          });
        }, 2200);
        showToast(`Stock de ${prod.modelo} actualizado a ${nuevoStock.replace('_', ' ')}`);
        notifyCatalogSync();
        onRefresh();
      }
    } catch (err: any) {
      showToast(`Error al actualizar stock: ${err.message}`);
    } finally {
      setRowStatus((prev) => {
        if (prev[key] === 'saving') {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    }
  };

  // Toggle visibilidad rápida de producto individual
  const handleToggleVisibility = async (prod: Producto) => {
    const nuevoEstado = !prod.visible;
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: prod.id, visible: nuevoEstado }]
        })
      });
      if (res.ok) {
        showToast(`Modelo ${prod.modelo} ${nuevoEstado ? 'visible' : 'oculto'} en el catálogo`);
        notifyCatalogSync();
        onRefresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Guardar edición o nuevo producto desde ProductEditForm
  const handleSaveProduct = async (productToSave: Producto) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSave)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Producto ${productToSave.modelo} guardado exitosamente`);
        setEditingProduct(null);
        notifyCatalogSync();
        onRefresh();
      } else {
        showToast(`Error: ${data.error || 'No se pudo guardar'}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteProduct = async () => {
    if (!deleteCandidate || !deleteCandidate.id) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/productos/${deleteCandidate.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Producto ${deleteCandidate.modelo} eliminado del catálogo`);
        setDeleteCandidate(null);
        notifyCatalogSync();
        onRefresh();
      } else {
        showToast('Error al eliminar el producto');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR INTEGRADA Y COMPACTA (Ocupa una sola línea angosta sin solapamientos) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Título y Conteo compacto */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Catálogo ({filteredList.length}/{productos.length})
          </span>

          {/* Selector / Pills compactos de Categoría */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filtroTipo === 'TODOS'
                  ? 'bg-tiandy-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({counts.todas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('CAMARA')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filtroTipo === 'CAMARA'
                  ? 'bg-tiandy-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cámaras ({counts.camaras})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('NVR')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filtroTipo === 'NVR'
                  ? 'bg-tiandy-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              NVRs ({counts.nvrs})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('SWITCH')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filtroTipo === 'SWITCH'
                  ? 'bg-tiandy-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Switches ({counts.switches})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('ACCESORIO')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filtroTipo === 'ACCESORIO'
                  ? 'bg-tiandy-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Accesorios ({counts.accesorios})
            </button>
          </div>
        </div>

        {/* Filtros Integrados en línea */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 max-w-2xl justify-end">
          {/* Buscador General con botón X */}
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar modelo o spec..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-6 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Buscador Código con botón X */}
          <div className="relative w-36">
            <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500" />
            <input
              type="text"
              value={busquedaCodigo}
              onChange={(e) => setBusquedaCodigo(e.target.value)}
              placeholder="Por código..."
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 py-1.5 pl-8 pr-6 text-xs font-mono text-slate-900 placeholder-amber-700/60 focus:bg-white focus:outline-none dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-white"
            />
            {busquedaCodigo && (
              <button
                type="button"
                onClick={() => setBusquedaCodigo('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-amber-600 hover:text-amber-800"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filtro Serie */}
          <select
            value={filtroSerie}
            onChange={(e) => setFiltroSerie(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 py-1.5 px-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="TODAS">Series (Todas)</option>
            {countSinSerie > 0 && (
              <option value="SIN_SERIE" className="font-bold text-amber-600">
                ⚠️ Sin Serie ({countSinSerie})
              </option>
            )}
            {seriesDisponibles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Filtro Stock */}
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 py-1.5 px-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="TODOS">Stock (Todos)</option>
            <option value="ENTREGA_INMEDIATA">Entrega Inmediata</option>
            <option value="POCAS_UNIDADES">Pocas Unidades</option>
            <option value="ULTIMA_UNIDAD">Última Unidad</option>
            <option value="PROXIMO_ARRIBO">Próximo Arribo</option>
            <option value="AGOTADO">Agotado</option>
            <option value="CONSULTAR">Consultar</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-1.5">
          {/* Botón Precios */}
          <button
            type="button"
            onClick={() => setModoEdicionPrecios(!modoEdicionPrecios)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
              modoEdicionPrecios
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
            title="Alternar edición rápida de precios y stock"
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{modoEdicionPrecios ? 'Precios: Activo' : 'Precios'}</span>
          </button>

          {/* Botón Huérfanos */}
          {storageAudit && storageAudit.totalOrphanedCount > 0 && (
            <button
              type="button"
              onClick={handleQuickCleanStorage}
              disabled={isCleaningStorage}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300"
              title={`Purgar ${storageAudit.totalOrphanedCount} huérfanos`}
            >
              {isCleaningStorage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Huérfanos ({storageAudit.totalOrphanedCount})</span>
            </button>
          )}

          {/* Botón Nuevo Producto */}
          <button
            onClick={() => {
              setEditingProduct({
                modelo: '',
                serie: '',
                tipo_dispositivo: 'CAMARA',
                subtipo: 'Cámara IP',
                especificacion_completa: '',
                precio_usd: 0,
                estado_stock: 'ENTREGA_INMEDIATA',
                badge_nuevo: true,
                visible: true,
                imagen_principal: '',
                datos_tecnicos: {
                  camara: {
                    microfono_incorporado: true,
                    altavoz_incorporado: false,
                    formato: 'Turret',
                    conectividad_tipo: 'Cableada (PoE/RJ45)',
                    movimiento_tipo: 'Fija',
                    optica_tipo: 'Estándar',
                    resolucion_mp: '2MP',
                    resolucion_max_pixels: '1920x1080',
                    sensor_imagen: '1/2.8" CMOS',
                    distancia_focal: '2.8mm',
                    apertura_iris: 'F2.0'
                  }
                }
              });
            }}
            className="flex items-center gap-1.5 rounded-xl bg-tiandy-700 hover:bg-tiandy-600 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm shadow-tiandy-700/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos Contenida con Barra de Desplazamiento */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="max-h-[620px] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Modelo & Variante</th>
                <th className="py-3.5 px-3">Serie / Categoría</th>
                <th className="py-3.5 px-4">Especificaciones Clave</th>
                <th className={`py-3.5 px-3 ${modoEdicionPrecios ? 'w-44' : ''}`}>Precio Neto U$S</th>
                <th className={`py-3.5 px-3 ${modoEdicionPrecios ? 'w-48' : ''}`}>Stock</th>
                <th className="py-3.5 px-3 text-center">Visibilidad</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredList.map((prod) => {
                const specs = getProductSpecs(prod);
                const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);
                const stockStyle = getStockStyle(prod.estado_stock);
                const status = rowStatus[String(prod.id)];
                const isSinSerie = !prod.serie || !prod.serie.trim() || prod.serie.trim().toLowerCase() === 'general series';

                return (
                  <tr 
                    key={prod.id || prod.modelo}
                    className={`transition-colors ${
                      isSinSerie
                        ? 'border-l-4 border-l-amber-500 bg-amber-50/40 hover:bg-amber-100/50 dark:bg-amber-950/30 dark:hover:bg-amber-950/50'
                        : (!prod.visible ? 'opacity-60 bg-slate-50/60 dark:bg-slate-950/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30')
                    } ${!prod.visible && isSinSerie ? 'opacity-70' : ''}`}
                  >
                    {/* Modelo y Specs con Miniatura de Imagen con clave única y refresco inmediato */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {prod.imagen_principal ? (
                            <img
                              key={`${prod.id}-${prod.imagen_principal}`}
                              src={prod.imagen_principal}
                              alt={baseModel}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500">
                              {prod.tipo_dispositivo === 'CAMARA' ? 'IPC' : prod.tipo_dispositivo === 'NVR' ? 'NVR' : prod.tipo_dispositivo === 'ACCESORIO' ? 'ACC' : 'PoE'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{baseModel}</span>
                            {prod.badge_nuevo && (
                              <span className="inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Nuevo
                              </span>
                            )}
                          </div>
                          {variantSpec && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal tracking-tight mt-0.5">
                              {variantSpec}
                            </div>
                          )}
                          {(prod.codigo_1 || prod.codigo_2) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {prod.codigo_1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                                  <span className="text-[9px] text-slate-400 font-sans uppercase">Cód 1:</span>
                                  <strong className="text-slate-700 dark:text-slate-200">{prod.codigo_1}</strong>
                                </span>
                              )}
                              {prod.codigo_2 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                                  <span className="text-[9px] text-slate-400 font-sans uppercase">Cód 2:</span>
                                  <strong className="text-slate-700 dark:text-slate-200">{prod.codigo_2}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Serie */}
                    <td className="py-3 px-3">
                      {isSinSerie ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:border-amber-700/60 dark:text-amber-300">
                          ⚠️ Sin Serie
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {prod.serie}
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {prod.tipo_dispositivo}
                      </div>
                    </td>

                    {/* Specs Clave */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {prod.tipo_dispositivo === 'CAMARA' && (
                        <div>
                          <span className="font-semibold">{specs.resolucion}</span> • {specs.formato} • {specs.lente}
                          <div className="text-[10px] text-slate-400">{specs.microfono ? 'Audio Mic' : 'Sin Audio'} • WDR {specs.wdr}</div>
                        </div>
                      )}
                      {prod.tipo_dispositivo === 'NVR' && (
                        <div>
                          <span className="font-semibold">{specs.canales} Canales</span> • {specs.bahias} HDD • {specs.canales_poe} PoE
                        </div>
                      )}
                      {prod.tipo_dispositivo === 'SWITCH' && (
                        <div>
                          <span className="font-semibold">{specs.puertos_poe} Puertos PoE</span> • {specs.poe_budget}W Budget
                        </div>
                      )}
                      {prod.tipo_dispositivo === 'ACCESORIO' && (
                        <div>
                          <span className="font-semibold">{prod.subtipo || 'Accesorio / Montaje'}</span>
                        </div>
                      )}
                    </td>

                    {/* Precio: Normal o Editable según modoEdicionPrecios */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {modoEdicionPrecios ? (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            U$S
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={getPriceInputValue(prod)}
                            onChange={(e) => handlePriceInputChange(prod.id!, e.target.value)}
                            onBlur={() => handlePriceCommit(prod)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-full rounded-lg border border-slate-300 py-1 pl-10 pr-2 font-mono text-xs font-bold text-slate-900 focus:border-tiandy-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            placeholder="0.00"
                          />
                          {status === 'saving' && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-tiandy-600 font-sans font-semibold">
                              ...
                            </span>
                          )}
                          {status === 'saved' && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-sans font-bold">
                              ✔
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>{formatCurrency(prod.precio_usd)}</span>
                      )}
                    </td>

                    {/* Stock: Badge rectangular o Selector dinámico de color */}
                    <td className="py-3 px-3">
                      {modoEdicionPrecios ? (
                        <select
                          value={prod.estado_stock}
                          onChange={(e) => handleStockChange(prod, e.target.value as EstadoStock)}
                          className={`w-full rounded-lg border py-1 px-2 text-xs font-bold transition-colors focus:outline-none ${stockStyle.bg} ${stockStyle.border} ${stockStyle.text}`}
                        >
                          <option value="ENTREGA_INMEDIATA" className="bg-white text-emerald-700 dark:bg-slate-900 dark:text-emerald-300 font-bold">ENTREGA INMEDIATA</option>
                          <option value="POCAS_UNIDADES" className="bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-300 font-bold">POCAS UNIDADES</option>
                          <option value="ULTIMA_UNIDAD" className="bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-300 font-bold">ÚLTIMA UNIDAD</option>
                          <option value="PROXIMO_ARRIBO" className="bg-white text-sky-700 dark:bg-slate-900 dark:text-sky-300 font-bold">PRÓXIMO ARRIBO</option>
                          <option value="AGOTADO" className="bg-white text-rose-700 dark:bg-slate-900 dark:text-rose-300 font-bold">AGOTADO</option>
                          <option value="CONSULTAR" className="bg-white text-purple-700 dark:bg-slate-900 dark:text-purple-300 font-bold">CONSULTAR</option>
                        </select>
                      ) : (
                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-transparent text-slate-700 dark:text-slate-300 ${stockStyle.border}`}>
                          {prod.estado_stock.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    {/* Visibilidad Toggle (Solo icono coloreado, sin botón encerrado) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleVisibility(prod)}
                        title={prod.visible ? 'Visible en catálogo público (clic para ocultar)' : 'Oculto del catálogo público (clic para activar)'}
                        className="inline-flex items-center justify-center p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        {prod.visible ? (
                          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct({ ...prod })}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                          title="Editar ficha técnica completa"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteCandidate(prod)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN COMPLETA */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-hidden animate-in zoom-in-95">
            <ProductEditForm
              initialData={editingProduct}
              existingProducts={productos}
              onSave={handleSaveProduct}
              onCancel={() => setEditingProduct(null)}
              isSaving={isSaving}
              title={editingProduct.id ? `Editar Modelo: ${editingProduct.modelo}` : 'Nuevo Producto en Catálogo'}
            />
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="rounded-2xl bg-rose-50 p-2.5 dark:bg-rose-950/50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Eliminar {deleteCandidate.modelo}?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta acción eliminará de forma permanente el producto y su ficha técnica de la base de datos de Tiandy Tech.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition-all shadow-md shadow-rose-900/20"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
