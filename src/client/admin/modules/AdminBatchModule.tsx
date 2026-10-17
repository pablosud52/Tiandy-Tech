import React, { useState, useMemo } from 'react';
import { Producto, EstadoStock, TipoDispositivo } from '../../../shared/types.js';
import { parseModelAndSpec } from '../../../shared/helpers.js';
import { 
  DollarSign, 
  Save, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  SlidersHorizontal,
  ArrowUpDown,
  Cctv,
  HardDrive,
  Network,
  Layers,
  Eye,
  Wrench
} from 'lucide-react';

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

interface AdminBatchModuleProps {
  productos: Producto[];
  onRefresh: () => void;
  onRefreshCatalog?: () => void;
}

export const AdminBatchModule: React.FC<AdminBatchModuleProps> = ({
  productos,
  onRefresh,
  onRefreshCatalog
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoDispositivo | 'TODOS'>('TODOS');
  const [edits, setEdits] = useState<Record<string, { precio_usd?: number; estado_stock?: EstadoStock; badge_nuevo?: boolean; visible?: boolean }>>({});
  const [rowStatus, setRowStatus] = useState<Record<string, 'saving' | 'saved'>>({});
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pendingCount = Object.keys(edits).length;

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

  const handleEditChange = (id: string | number, field: string, value: any) => {
    const key = String(id);
    setEdits((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Obtener valor actual para el input de precio (siempre con 2 decimales)
  const getPriceInputValue = (prod: Producto) => {
    const key = String(prod.id);
    if (priceInputs[key] !== undefined) {
      return priceInputs[key];
    }
    const editVal = edits[key]?.precio_usd;
    if (editVal !== undefined) {
      return editVal.toFixed(2);
    }
    const base = prod.precio_usd || 0;
    return base.toFixed(2);
  };

  const handlePriceInputChange = (id: number | string, val: string) => {
    const key = String(id);
    setPriceInputs(prev => ({ ...prev, [key]: val }));
  };

  // Guardado inmediato de precio al perder foco o presionar Enter
  const handlePriceCommit = async (prod: Producto) => {
    const key = String(prod.id);
    const raw = priceInputs[key] !== undefined
      ? priceInputs[key]
      : (edits[key]?.precio_usd !== undefined ? edits[key]!.precio_usd!.toFixed(2) : (prod.precio_usd || 0).toFixed(2));

    const parsed = parseFloat(raw.replace(',', '.')) || 0;
    const normalized = Math.max(0, Math.round(parsed * 100) / 100);
    const formatted = normalized.toFixed(2);

    // Formatear texto del input estrictamente a 2 decimales
    setPriceInputs(prev => ({ ...prev, [key]: formatted }));

    // Si el valor no cambió respecto al guardado, evitar petición innecesaria
    if (prod.precio_usd === normalized && edits[key]?.precio_usd === undefined) {
      return;
    }

    setRowStatus(prev => ({ ...prev, [key]: 'saving' }));
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: prod.id,
            precio_usd: normalized
          }]
        })
      });
      if (res.ok) {
        setEdits(prev => {
          const next = { ...prev };
          if (next[key]) {
            delete next[key].precio_usd;
            if (Object.keys(next[key]).length === 0) delete next[key];
          }
          return next;
        });
        setRowStatus(prev => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
          setRowStatus(prev => {
            const next = { ...prev };
            if (next[key] === 'saved') delete next[key];
            return next;
          });
        }, 2500);
        onRefresh();
        onRefreshCatalog?.();
      }
    } catch (err) {
      console.error('Error guardando precio:', err);
    } finally {
      setRowStatus(prev => {
        if (prev[key] === 'saving') {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      if (filtroTipo !== 'TODOS' && p.tipo_dispositivo !== filtroTipo) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchModelo = p.modelo.toLowerCase().includes(q);
        const matchSerie = (p.serie || '').toLowerCase().includes(q);
        const matchSub = (p.subtipo || '').toLowerCase().includes(q);
        const matchCod1 = p.codigo_1 ? p.codigo_1.toLowerCase().includes(q) : false;
        const matchCod2 = p.codigo_2 ? p.codigo_2.toLowerCase().includes(q) : false;
        if (!matchModelo && !matchSerie && !matchSub && !matchCod1 && !matchCod2) return false;
      }
      return true;
    });
  }, [productos, busqueda, filtroTipo]);

  const handleSaveBatch = async () => {
    const itemsToUpdate = Object.entries(edits).map(([id, changes]) => ({
      id: Number(id),
      ...changes
    }));

    if (itemsToUpdate.length === 0) {
      setFeedback({ type: 'error', message: 'No hay cambios pendientes para guardar.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setFeedback({
          type: 'success',
          message: `¡${itemsToUpdate.length} productos actualizados exitosamente en la base de datos!`
        });
        setEdits({});
        setPriceInputs({});
        onRefresh();
        onRefreshCatalog?.();
      } else {
        setFeedback({
          type: 'error',
          message: result.error || 'Error al guardar los cambios en lote.'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Error de red: ${err.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  // Asignar masivo de stock para la vista actual
  const handleBulkSetStock = (stock: EstadoStock) => {
    const newEdits = { ...edits };
    filteredProducts.forEach((p) => {
      if (p.id) {
        const key = String(p.id);
        newEdits[key] = {
          ...newEdits[key],
          estado_stock: stock
        };
      }
    });
    setEdits(newEdits);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header y Controles */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 mb-1">
              <DollarSign className="h-4 w-4" />
              Editor Rápido de Precios y Stock
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Edición Masiva en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modifica precios de lista en U$S (con hasta 2 decimales) y disponibilidades de múltiples modelos a la vez.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Recargar
            </button>

            <button
              onClick={handleSaveBatch}
              disabled={isSaving || pendingCount === 0}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg ${
                pendingCount > 0
                  ? 'bg-tiandy-700 hover:bg-tiandy-600 shadow-tiandy-700/30'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : `Guardar Cambios (${pendingCount})`}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`rounded-2xl p-4 text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Pestañas de Categoría (Separación Cámaras, NVRs, Switches) */}
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
            <Cctv className="h-4 w-4" />
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

          <button
            type="button"
            onClick={() => setFiltroTipo('ACCESORIO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filtroTipo === 'ACCESORIO'
                ? 'bg-tiandy-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="h-4 w-4" />
            Accesorios ({counts.accesorios})
          </button>
        </div>

        {/* Filtros de la Tabla Batch y Acciones Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por modelo o serie..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-tiandy-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Acción rápida para los {filteredProducts.length} visibles:</span>
            <button
              onClick={() => handleBulkSetStock('ENTREGA_INMEDIATA')}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
            >
              Set Entrega Inmediata
            </button>
            <button
              onClick={() => handleBulkSetStock('CONSULTAR')}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Set Consultar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Edición Batch Contenida con Barra de Desplazamiento */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 text-[10px]">
              <tr>
                <th className="py-3 px-4">Modelo & Variante</th>
                <th className="py-3 px-3">Serie / Tipo</th>
                <th className="py-3 px-4 w-44">Precio Neto U$S (s/IVA)</th>
                <th className="py-3 px-4 w-48">Disponibilidad Stock</th>
                <th className="py-3 px-3 text-center">Nuevo</th>
                <th className="py-3 px-3 text-center">Visible</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredProducts.map((prod) => {
                const key = String(prod.id);
                const currentEdit = edits[key] || {};
                const currentPrice = currentEdit.precio_usd !== undefined ? currentEdit.precio_usd : (prod.precio_usd || 0);
                const currentStock = currentEdit.estado_stock || prod.estado_stock;
                const currentNuevo = currentEdit.badge_nuevo !== undefined ? currentEdit.badge_nuevo : prod.badge_nuevo;
                const currentVisible = currentEdit.visible !== undefined ? currentEdit.visible : prod.visible;
                const isModified = Boolean(edits[key]);

                const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);

                return (
                  <tr
                    key={prod.id}
                    className={`transition-colors ${
                      isModified
                        ? 'bg-amber-50/50 dark:bg-amber-950/20'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    {/* Modelo y Variante abajo sin 'Spec' */}
                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {baseModel}
                      </div>
                      {variantSpec && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal tracking-tight mt-0.5">
                          {variantSpec}
                        </div>
                      )}
                      {(prod.codigo_1 || prod.codigo_2) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {prod.codigo_1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700/60">
                              Cód 1: <strong className="text-slate-700 dark:text-slate-200">{prod.codigo_1}</strong>
                            </span>
                          )}
                          {prod.codigo_2 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700/60">
                              Cód 2: <strong className="text-slate-700 dark:text-slate-200">{prod.codigo_2}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Serie / Tipo */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.serie}</span>
                      <span className="text-[10px] block text-slate-400">{prod.tipo_dispositivo}</span>
                    </td>

                    {/* Precio U$S Editable (siempre con 2 dígitos decimales y guardado al salir o Enter) */}
                    <td className="py-2.5 px-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          U$S
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={getPriceInputValue(prod)}
                          onChange={(e) =>
                            handlePriceInputChange(prod.id!, e.target.value)
                          }
                          onBlur={() => handlePriceCommit(prod)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full rounded-lg border border-slate-300 py-1 pl-10 pr-2 font-mono text-xs font-bold text-slate-900 focus:border-tiandy-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </td>

                    {/* Estado Stock Editable con color de la opción seleccionada */}
                    <td className="py-2.5 px-4">
                      {(() => {
                        const stockStyle = getStockStyle(currentStock);
                        return (
                          <select
                            value={currentStock}
                            onChange={(e) =>
                              handleEditChange(prod.id!, 'estado_stock', e.target.value as EstadoStock)
                            }
                            className={`w-full rounded-lg border py-1 px-2 text-xs font-bold transition-colors focus:outline-none ${stockStyle.bg} ${stockStyle.border} ${stockStyle.text}`}
                          >
                            <option value="ENTREGA_INMEDIATA" className="bg-white text-emerald-700 dark:bg-slate-900 dark:text-emerald-300 font-bold">ENTREGA INMEDIATA</option>
                            <option value="POCAS_UNIDADES" className="bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-300 font-bold">POCAS UNIDADES</option>
                            <option value="ULTIMA_UNIDAD" className="bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-300 font-bold">ÚLTIMA UNIDAD</option>
                            <option value="PROXIMO_ARRIBO" className="bg-white text-sky-700 dark:bg-slate-900 dark:text-sky-300 font-bold">PRÓXIMO ARRIBO</option>
                            <option value="AGOTADO" className="bg-white text-rose-700 dark:bg-slate-900 dark:text-rose-300 font-bold">AGOTADO</option>
                            <option value="CONSULTAR" className="bg-white text-purple-700 dark:bg-slate-900 dark:text-purple-300 font-bold">CONSULTAR</option>
                          </select>
                        );
                      })()}
                    </td>

                    {/* Badge Nuevo */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={currentNuevo}
                        onChange={(e) => handleEditChange(prod.id!, 'badge_nuevo', e.target.checked)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </td>

                    {/* Visibilidad (azul cuando activo) */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={currentVisible}
                        onChange={(e) => handleEditChange(prod.id!, 'visible', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </td>

                    {/* Estado Fila */}
                    <td className="py-2.5 px-4 text-right">
                      {rowStatus[key] === 'saving' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          Guardando...
                        </span>
                      ) : rowStatus[key] === 'saved' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                          Guardado
                        </span>
                      ) : isModified ? (
                        <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                          Pendiente
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Al día</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
