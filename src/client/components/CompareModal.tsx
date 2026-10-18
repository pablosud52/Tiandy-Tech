import React, { useMemo } from 'react';
import { Producto } from '../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { BadgeOverlay } from './Badges.js';
import { X, ArrowRight, Check, Minus, Shield, Zap, Eye, Trash2, ArrowLeftRight } from 'lucide-react';

interface CompareModalProps {
  productos: Producto[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

export const CompareFloatingBar: React.FC<{
  productos: Producto[];
  onOpen: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  standalone?: boolean;
}> = ({ productos, onOpen, onRemove, onClear, standalone = true }) => {
  if (productos.length === 0) return null;

  return (
    <div className={`${standalone ? 'fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform' : ''} animate-in slide-in-from-bottom duration-300`}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-5 py-3 shadow-2xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-slate-950">
            {productos.length}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
            Comparativa ({productos.length}/4)
          </span>
        </div>

        {/* Product pills */}
        <div className="flex items-center gap-2">
          {productos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono font-medium border border-slate-700 text-slate-200"
            >
              <span className="truncate max-w-[120px]">{p.modelo}</span>
              <button
                onClick={() => onRemove(p.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
                title="Quitar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1"
          >
            Limpiar
          </button>
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition-all"
          >
            Ver Comparativa
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CompareModal: React.FC<CompareModalProps> = ({
  productos,
  isOpen,
  onClose,
  onRemove,
  onClear
}) => {
  if (!isOpen) return null;

  const specsMap = useMemo(() => {
    const map: Record<string, any> = {};
    for (const p of productos) {
      if (p.id) map[p.id] = getProductSpecs(p);
    }
    return map;
  }, [productos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Comparador Técnico Cara a Cara
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluación detallada de prestaciones ópticas, analíticas e interfaces de conexión
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar todo
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Matrix Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="w-48 py-3 px-3 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  Especificación
                </th>
                {productos.map((prod) => (
                  <th key={prod.id} className="py-3 px-4 min-w-[240px] max-w-[320px]">
                    <div className="flex items-start justify-between">
                      <div>
                        {prod.serie && prod.serie.trim() && prod.serie.trim().toLowerCase() !== 'general series' && (
                          <span className="rounded bg-tiandy-700 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            {prod.serie.trim()}
                          </span>
                        )}
                        {(() => {
                          const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo);
                          return (
                            <div>
                              <h3 className="font-mono text-base font-black text-slate-900 dark:text-white mt-1">
                                {baseModel}
                              </h3>
                              {variantSpec && (
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block mt-0.5 tracking-tight">
                                  {variantSpec}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                          {formatCurrency(prod.precio_usd)} <span className="text-[9px] font-normal text-slate-400">s/IVA</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(prod.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
                        title="Quitar de comparativa"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {/* Disponibilidad Stock */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Disponibilidad</td>
                {productos.map((p) => (
                  <td key={p.id} className="py-2.5 px-4 font-mono font-semibold text-[11px]">
                    {p.estado_stock.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* Formato / Chasis */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Formato / Chasis</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4 capitalize">
                      {s.formato || p.tipo_dispositivo}
                    </td>
                  );
                })}
              </tr>

              {/* Resolución */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Resolución</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {s.resolucion || s.resolucion_pixels || '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Lente & FOV */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Lente / Ángulo FOV</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      {s.lente ? (
                        <div>
                          <span className="font-semibold">{s.lente}</span>
                          <div className="text-[11px] text-slate-500">{s.fov || ''}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* DORI Detectar */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">DORI: Detectar / Identificar</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  const det = s.dori_detectar;
                  const idn = s.dori_identificar;
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      {det ? (
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-mono">
                            <span className="text-emerald-600 font-bold">Det: {det}m</span>
                            <span className="text-rose-600 font-bold">Id: {idn || '-'}m</span>
                          </div>
                          {/* Visual bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                            <div
                              style={{ width: `${Math.min(100, (det / 120) * 100)}%` }}
                              className="bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Visión Nocturna */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Visión Nocturna</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      {s.distancia_ir && (
                        <div>IR Smart: <span className="font-semibold">{s.distancia_ir}m</span></div>
                      )}
                      {s.distancia_luz_calida && (
                        <div className="text-amber-600 dark:text-amber-400">
                          Luz Cálida: <span className="font-semibold">{s.distancia_luz_calida}m</span>
                        </div>
                      )}
                      {!s.distancia_ir && !s.distancia_luz_calida && '-'}
                    </td>
                  );
                })}
              </tr>

              {/* WDR */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">WDR Dinámico</td>
                {productos.map((p) => (
                  <td key={p.id} className="py-2.5 px-4 font-semibold">
                    {p.datos_tecnicos?.camara?.wdr || (p.datos_tecnicos as any)?.wdr_db || '-'}
                  </td>
                ))}
              </tr>

              {/* Audio */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Micrófono / Altavoz</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      {s.microfono ? (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Micrófono incorporado
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Minus className="h-3.5 w-3.5" /> Sin micrófono
                        </div>
                      )}
                      {s.altavoz && (
                        <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 mt-1">
                          <Check className="h-3.5 w-3.5" /> Altavoz integrado
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Almacenamiento Ranura SD / Bahías */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Almacenamiento Local</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      {s.ranura_sd && <div>MicroSD hasta {s.max_sd_gb}</div>}
                      {s.bahias && <div>{s.bahias}x SATA (hasta {s.capacidad_disco}TB c/u)</div>}
                      {!s.ranura_sd && !s.bahias && '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Grado Protección IP/IK */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Protección Intemperie</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.grado_proteccion || '-'} {s.antivandalico ? ` / ${s.antivandalico}` : ''}
                    </td>
                  );
                })}
              </tr>

              {/* Alimentación y PoE */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Alimentación / PoE</td>
                {productos.map((p) => {
                  const s = specsMap[p.id] || {};
                  return (
                    <td key={p.id} className="py-2.5 px-4">
                      <div>{s.alimentacion || (s.puertos_poe ? `${s.puertos_poe}x PoE (${s.presupuesto_poe || 0}W)` : '-')}</div>
                      {s.consumo_w && (
                        <div className="text-slate-500 text-[11px]">Consumo: {s.consumo_w}</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Analíticas de IA */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-500">Analíticas IA</td>
                {productos.map((p) => (
                  <td key={p.id} className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {((p.datos_tecnicos?.camara?.analiticas_ia?.clasificacion_objetos || p.datos_tecnicos?.nvr?.ia_propia_nvr || (p.datos_tecnicos as any)?.analiticas_ia || []) as string[]).map((ia: string, i: number) => (
                        <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">
                          {ia}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          >
            Cerrar Comparador
          </button>
        </div>
      </div>
    </div>
  );
};
