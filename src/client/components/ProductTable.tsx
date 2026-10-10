import React from 'react';
import { Producto } from '../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { BadgeOverlay } from './Badges.js';
import { Eye, Plus, Check, FileText, Zap, ShoppingCart } from 'lucide-react';

interface ProductTableProps {
  productos: Producto[];
  onSelect: (producto: Producto) => void;
  comparedIds: string[];
  onToggleCompare: (producto: Producto) => void;
  canCompare: boolean;
  onAddToCotizacion?: (producto: Producto) => void;
  cotizacionIds?: string[];
}

export const ProductTable: React.FC<ProductTableProps> = ({
  productos,
  onSelect,
  comparedIds,
  onToggleCompare,
  canCompare,
  onAddToCotizacion,
  cotizacionIds = []
}) => {
  const stockStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ENTREGA_INMEDIATA: {
      label: 'ENTREGA INMEDIATA',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    POCAS_UNIDADES: {
      label: 'POCAS UNIDADES',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    },
    ULTIMA_UNIDAD: {
      label: 'ÚLTIMA UNIDAD',
      bg: 'bg-amber-100 dark:bg-amber-900/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700'
    },
    PROXIMO_ARRIBO: {
      label: 'PRÓXIMO ARRIBO',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800'
    },
    AGOTADO: {
      label: 'AGOTADO',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700'
    },
    CONSULTAR: {
      label: 'CONSULTAR',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    }
  };

  const serieBadges: Record<string, { label: string; bg: string; text: string }> = {
    AK: { label: 'AK Series', bg: 'bg-emerald-600', text: 'text-white' },
    Spark: { label: 'Spark Lite', bg: 'bg-sky-600', text: 'text-white' },
    Lite: { label: 'Lite Series', bg: 'bg-blue-600', text: 'text-white' },
    Pro: { label: 'Pro Series', bg: 'bg-purple-600', text: 'text-white' },
    Ultra: { label: 'Ultra Series', bg: 'bg-rose-600', text: 'text-white' },
    Panoramic: { label: 'Panoramic', bg: 'bg-amber-600', text: 'text-white' },
    Expert: { label: 'Expert Series', bg: 'bg-indigo-600', text: 'text-white' }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
        <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          <tr>
            <th className="py-3.5 px-3 w-10 text-center">Comp.</th>
            <th className="py-3.5 px-3 min-w-[200px]">Modelo / Serie</th>
            <th className="py-3.5 px-3">Formato / Tipo</th>
            <th className="py-3.5 px-3">Specs Clave</th>
            <th className="py-3.5 px-3">Óptica / Conectividad</th>
            <th className="py-3.5 px-3">Badges / Tecnologías</th>
            <th className="py-3.5 px-3">Audio / E/S</th>
            <th className="py-3.5 px-3 text-center">Estado Stock</th>
            <th className="py-3.5 px-3 text-right">Precio Neto</th>
            <th className="py-3.5 px-3 text-center w-20">Ficha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
          {productos.map((prod) => {
            const isCompared = comparedIds.includes(String(prod.id));
            const stockInfo = stockStyles[prod.estado_stock] || stockStyles.CONSULTAR;
            const serieInfo = serieBadges[prod.serie] || { label: prod.serie, bg: 'bg-slate-600', text: 'text-white' };
            const specs = getProductSpecs(prod);

            return (
              <tr
                key={prod.id}
                onClick={() => onSelect(prod)}
                className="group cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40"
              >
                {/* Compare Checkbox */}
                <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleCompare(prod)}
                    disabled={!isCompared && !canCompare}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                      isCompared
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : canCompare
                        ? 'border-slate-300 bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-800'
                        : 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900'
                    }`}
                    title={isCompared ? 'Quitar de comparador' : canCompare ? 'Agregar a comparador' : 'Máximo 3 productos'}
                  >
                    {isCompared ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </button>
                </td>

                {/* Modelo & Serie */}
                <td className="py-2.5 px-3 font-sans">
                  {(() => {
                    const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);
                    return (
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold font-mono text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-slate-100 dark:group-hover:text-emerald-400">
                            {baseModel}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${serieInfo.bg} ${serieInfo.text}`}>
                            {serieInfo.label}
                          </span>
                          {prod.badge_nuevo && (
                            <span className="rounded bg-amber-500 px-1 py-0.2 text-[8px] font-bold text-white uppercase">
                              Nuevo
                            </span>
                          )}
                        </div>
                        {variantSpec && (
                          <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight">
                            {variantSpec}
                          </div>
                        )}
                        <p className="line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                          {prod.subtipo || prod.especificacion_completa}
                        </p>
                      </div>
                    );
                  })()}
                </td>

                {/* Formato / Tipo */}
                <td className="py-2.5 px-3 font-sans capitalize text-slate-600 dark:text-slate-300">
                  {specs.formato}
                </td>

                {/* Specs Clave */}
                <td className="py-2.5 px-3">
                  <div className="space-y-0.5">
                    {specs.resolucion && (
                      <div className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                        {specs.resolucion}
                      </div>
                    )}
                    {specs.canales && (
                      <div className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                        {specs.canales} Canales {specs.canales_poe ? `(${specs.canales_poe} PoE)` : ''}
                      </div>
                    )}
                    {specs.puertos_poe && (
                      <div className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                        {specs.puertos_poe}x PoE ({specs.presupuesto_poe || 0}W)
                      </div>
                    )}
                    {specs.bahias && (
                      <div className="text-slate-500 dark:text-slate-400">
                        {specs.bahias}x SATA {specs.capacidad_disco ? `(hasta ${specs.capacidad_disco}TB)` : ''}
                      </div>
                    )}
                  </div>
                </td>

                {/* Óptica / Conectividad */}
                <td className="py-2.5 px-3">
                  <div className="space-y-0.5">
                    {specs.lente && <div>{specs.lente} {specs.fov ? `(${specs.fov})` : ''}</div>}
                    {specs.dori_detectar && (
                      <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                        DORI Det: {specs.dori_detectar}m | Id: {specs.dori_identificar || '-'}m
                      </div>
                    )}
                    {specs.puertos_uplink && <div>{specs.puertos_uplink}</div>}
                    {specs.ancho_banda_in && (
                      <div>In: {specs.ancho_banda_in}Mbps / Out: {specs.ancho_banda_out || '-'}Mbps</div>
                    )}
                  </div>
                </td>

                {/* Badges / Tecnologías */}
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {prod.badges_detectados?.slice(0, 3).map((b) => (
                      <span key={b} className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {b}
                      </span>
                    ))}
                    {(prod.badges_detectados?.length || 0) > 3 && (
                      <span className="text-[10px] text-slate-400 font-sans">
                        +{(prod.badges_detectados?.length || 0) - 3} más
                      </span>
                    )}
                  </div>
                </td>

                {/* Audio / E/S */}
                <td className="py-2.5 px-3 font-sans">
                  <div className="space-y-0.5">
                    {specs.microfono && <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded mr-1">Mic Incorp.</span>}
                    {specs.altavoz && <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded mr-1">Altavoz</span>}
                    {specs.ranura_sd && <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded mr-1">MicroSD</span>}
                  </div>
                </td>

                {/* Estado Stock */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider font-sans ${stockInfo.bg} ${stockInfo.text} ${stockInfo.border}`}
                  >
                    {stockInfo.label}
                  </span>
                </td>

                {/* Precio Neto U$S */}
                <td className="py-2.5 px-3 text-right">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(prod.precio_usd)}
                  </div>
                  <div className="text-[8px] text-slate-400 font-sans">Neto oficial s/IVA</div>
                </td>

                {/* Acciones: Cotizar y Ficha */}
                <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    {onAddToCotizacion && (
                      <button
                        onClick={() => onAddToCotizacion(prod)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          cotizacionIds.includes(String(prod.id))
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                        title="Añadir a la cotización"
                      >
                        {cotizacionIds.includes(String(prod.id)) ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onSelect(prod)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 dark:hover:text-white"
                      title="Ver ficha técnica completa"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
