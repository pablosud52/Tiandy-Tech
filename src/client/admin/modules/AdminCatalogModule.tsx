import React, { useState, useMemo } from 'react';
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
  Camera, 
  HardDrive, 
  Network, 
  ExternalLink, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  Layers,
  Barcode
} from 'lucide-react';

interface AdminCatalogModuleProps {
  productos: Producto[];
  onRefresh: () => void;
}

export const AdminCatalogModule: React.FC<AdminCatalogModuleProps> = ({
  productos,
  onRefresh
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCodigo, setBusquedaCodigo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoDispositivo | 'TODOS'>('TODOS');
  const [filtroSerie, setFiltroSerie] = useState<string>('TODAS');
  const [filtroStock, setFiltroStock] = useState<string>('TODOS');

  // Modal de Edición / Creación
  const [editingProduct, setEditingProduct] = useState<Partial<Producto> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conteo por categoría
  const counts = useMemo(() => {
    return {
      todas: productos.length,
      camaras: productos.filter((p) => p.tipo_dispositivo === 'CAMARA').length,
      nvrs: productos.filter((p) => p.tipo_dispositivo === 'NVR').length,
      switches: productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length
    };
  }, [productos]);

  const seriesDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.serie) set.add(p.serie);
    });
    return Array.from(set).sort();
  }, [productos]);

  // Filtrado reactivo
  const filteredList = useMemo(() => {
    return productos.filter((p) => {
      if (filtroTipo !== 'TODOS' && p.tipo_dispositivo !== filtroTipo) return false;
      if (filtroSerie !== 'TODAS' && p.serie !== filtroSerie) return false;
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

  // Toggle visibilidad rápida
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

      {/* Header & Filtros Rápidos */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Administración de Productos ({filteredList.length} de {productos.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Busca, edita características, activa o inhabilita visibilidad en el catálogo público.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProduct({
                modelo: '',
                serie: 'Lite Series',
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
            className="flex items-center gap-2 rounded-2xl bg-tiandy-700 hover:bg-tiandy-600 px-4 py-2.5 text-xs font-bold text-white active:scale-95 transition-all shadow-md shadow-tiandy-700/20"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto Manual
          </button>
        </div>

        {/* Pestañas de Categoría (Separación de Cámaras, NVRs, Switches) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setFiltroTipo('TODOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filtroTipo === 'TODOS'
                ? 'bg-tiandy-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="h-4 w-4" />
            Todas ({counts.todas})
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('CAMARA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filtroTipo === 'CAMARA'
                ? 'bg-tiandy-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Camera className="h-4 w-4" />
            Cámaras IP ({counts.camaras})
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('NVR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filtroTipo === 'NVR'
                ? 'bg-tiandy-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            Grabadores NVR ({counts.nvrs})
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo('SWITCH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filtroTipo === 'SWITCH'
                ? 'bg-tiandy-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Network className="h-4 w-4" />
            Switches PoE ({counts.switches})
          </button>
        </div>

        {/* Barra de Filtros Secundarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Input Buscador General */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar modelo o specs..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-tiandy-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Input Buscador Exclusivo por Código */}
          <div className="relative">
            <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <input
              type="text"
              value={busquedaCodigo}
              onChange={(e) => setBusquedaCodigo(e.target.value)}
              placeholder="Buscar por código..."
              title="Filtrar por Código 1 o Código 2 de sincronización"
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 py-2 pl-9 pr-3 text-xs font-mono font-medium text-slate-900 placeholder-amber-700/60 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-white dark:placeholder-amber-400/60"
            />
            {busquedaCodigo && (
              <button
                onClick={() => setBusquedaCodigo('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro Serie */}
          <select
            value={filtroSerie}
            onChange={(e) => setFiltroSerie(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50/50 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-tiandy-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="TODAS">Todas las Series</option>
            {seriesDisponibles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Filtro Stock */}
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50/50 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-tiandy-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="TODOS">Cualquier Estado de Stock</option>
            <option value="ENTREGA_INMEDIATA">Entrega Inmediata</option>
            <option value="POCAS_UNIDADES">Pocas Unidades</option>
            <option value="ULTIMA_UNIDAD">Última Unidad</option>
            <option value="PROXIMO_ARRIBO">Próximo Arribo</option>
            <option value="AGOTADO">Agotado</option>
            <option value="CONSULTAR">Consultar</option>
          </select>
        </div>
      </div>

      {/* Tabla de Productos Contenida con Barra de Desplazamiento */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Modelo & Variante</th>
                <th className="py-3.5 px-3">Serie / Categoría</th>
                <th className="py-3.5 px-4">Especificaciones Clave</th>
                <th className="py-3.5 px-3">Precio Neto</th>
                <th className="py-3.5 px-3">Stock</th>
                <th className="py-3.5 px-3 text-center">Visibilidad</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredList.map((prod) => {
                const specs = getProductSpecs(prod);
                const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);

                return (
                  <tr 
                    key={prod.id || prod.modelo}
                    className={`transition-colors ${!prod.visible ? 'opacity-60 bg-slate-50/60 dark:bg-slate-950/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                  >
                    {/* Modelo y Specs con Miniatura de Imagen */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {prod.imagen_principal ? (
                            <img
                              src={prod.imagen_principal}
                              alt={baseModel}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500">
                              {prod.tipo_dispositivo === 'CAMARA' ? 'IPC' : prod.tipo_dispositivo === 'NVR' ? 'NVR' : 'PoE'}
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
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {prod.serie}
                      </span>
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
                    </td>

                    {/* Precio en U$S */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(prod.precio_usd)}
                    </td>

                    {/* Stock: rectangular, solo borde de color, texto y fondo al estilo de la tabla */}
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-transparent text-slate-700 dark:text-slate-300 ${
                        prod.estado_stock === 'ENTREGA_INMEDIATA'
                          ? 'border-emerald-500 dark:border-emerald-500'
                          : prod.estado_stock === 'POCAS_UNIDADES' || prod.estado_stock === 'ULTIMA_UNIDAD'
                          ? 'border-amber-500 dark:border-amber-500'
                          : prod.estado_stock === 'PROXIMO_ARRIBO'
                          ? 'border-sky-500 dark:border-sky-500'
                          : prod.estado_stock === 'AGOTADO'
                          ? 'border-rose-500 dark:border-rose-500'
                          : 'border-purple-500 dark:border-purple-500'
                      }`}>
                        {prod.estado_stock.replace('_', ' ')}
                      </span>
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
