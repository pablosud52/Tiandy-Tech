import React from 'react';
import { Producto, BadgeGlobalConfig } from '../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { SellosGraficosOverlay, getProductSellos, getProductSmdBadge } from './Badges.js';
import { Check, Calculator, ArrowLeftRight, Cctv, Eye } from 'lucide-react';

interface ProductTableProps {
  productos: Producto[];
  onSelect: (producto: Producto) => void;
  comparedIds: string[];
  onToggleCompare: (producto: Producto) => void;
  canCompare: boolean;
  onAddToCotizacion?: (producto: Producto) => void;
  cotizacionIds?: string[];
  globalBadges?: BadgeGlobalConfig[];
  activeTab?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  productos,
  onSelect,
  comparedIds,
  onToggleCompare,
  canCompare,
  onAddToCotizacion,
  cotizacionIds = [],
  globalBadges,
  activeTab
}) => {
  const stockStyles: Record<string, { label: string; bg: string; text: string }> = {
    ENTREGA_INMEDIATA: {
      label: 'ENTREGA INMEDIATA',
      bg: 'bg-emerald-600',
      text: 'text-white'
    },
    POCAS_UNIDADES: {
      label: 'POCAS UNIDADES',
      bg: 'bg-amber-500',
      text: 'text-white'
    },
    ULTIMA_UNIDAD: {
      label: 'POCAS UNIDADES',
      bg: 'bg-amber-500',
      text: 'text-white'
    },
    PROXIMO_ARRIBO: {
      label: 'PRÓXIMO ARRIBO',
      bg: 'bg-yellow-400',
      text: 'text-slate-950 font-bold'
    },
    AGOTADO: {
      label: 'AGOTADO',
      bg: 'bg-rose-600',
      text: 'text-white'
    },
    CONSULTAR: {
      label: 'CONSULTAR',
      bg: 'bg-slate-500',
      text: 'text-white'
    }
  };

  const isNvrView = activeTab === 'NVR' || (productos.length > 0 && productos.every((p) => p.tipo_dispositivo === 'NVR'));

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-hardware dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[880px] custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-md font-mono font-bold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 text-[10px] select-none">
            {isNvrView ? (
              <tr>
                <th className="py-3 px-3 w-32 text-center">IMAGEN</th>
                <th className="py-3 px-3 min-w-[180px]">MODELO & SERIE</th>
                <th className="py-3 px-2.5">CANALES & POE</th>
                <th className="py-3 px-2.5">ALMACENAMIENTO</th>
                <th className="py-3 px-2.5">SALIDAS VIDEO</th>
                <th className="py-3 px-2.5">TECNOLOGÍAS</th>
                <th className="py-3 px-2.5">INTERFACES I/O</th>
                <th className="py-3 px-2.5 text-left">STOCK</th>
                <th className="py-3 px-3 text-right">PRECIO (USD)</th>
                <th className="py-3 px-3 text-center w-28">ACCIONES</th>
              </tr>
            ) : (
              <tr>
                <th className="py-3 px-3 w-32 text-center">IMAGEN</th>
                <th className="py-3 px-3 min-w-[180px]">MODELO & SERIE</th>
                <th className="py-3 px-2.5">FORMATO</th>
                <th className="py-3 px-2.5">RESOLUCIÓN</th>
                <th className="py-3 px-2.5 min-w-[160px]">ÓPTICA & SENSOR</th>
                <th className="py-3 px-2.5">TECNOLOGÍAS</th>
                <th className="py-3 px-2.5">AUDIO & E/S</th>
                <th className="py-3 px-2.5 text-left">STOCK</th>
                <th className="py-3 px-3 text-right">PRECIO (USD)</th>
                <th className="py-3 px-3 text-center w-28">ACCIONES</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
            {productos.map((prod) => {
              const isCompared = comparedIds.includes(String(prod.id));
              const stockInfo = stockStyles[prod.estado_stock] || stockStyles.CONSULTAR;
              const specs = getProductSpecs(prod);
              const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);
              const sellosGraficos = getProductSellos(prod, globalBadges);
              const isNvrRow = isNvrView || prod.tipo_dispositivo === 'NVR';

              const cam = prod.tipo_dispositivo === 'CAMARA' ? prod.datos_tecnicos?.camara : null;
              const nvr = prod.datos_tecnicos?.nvr;
              const sw = prod.datos_tecnicos?.switch;
              const cp = (prod.datos_tecnicos as any)?.caracteristicas_principales;

              const sensorRaw = cp?.sensor || cam?.sensor_imagen;
              const sensor = sensorRaw ? sensorRaw.replace(/([0-9/.]+")([A-Za-z])/i, '$1 $2') : null;

              const minIlumRaw = cp?.min_iluminacion || cam?.iluminacion_minima_color;
              const minIlum = (() => {
                if (!minIlumRaw) return null;
                const match = minIlumRaw.match(/([\d.]+)\s*Lux/i);
                if (match) return `${match[1]} Lux`;
                return minIlumRaw.replace(/@\s*\(?F[\d.]+/i, '').replace(/Color:\s*/i, '').trim();
              })();

              const visionRaw = cp?.vision_nocturna || (cam?.alcance_ir_metros ? `IR ${cam.alcance_ir_metros}m` : null);
              const vision = visionRaw ? visionRaw.replace(/LED\s*/i, '').trim() : null;

              const smdOrVca = (() => {
                const smdVal = cp?.smd || cam?.analiticas_ia?.version_smd || (prod.badges_detectados?.find((b: string) => /SMD/i.test(b)));
                if (smdVal && smdVal !== '-') {
                  return typeof smdVal === 'string' && smdVal.toUpperCase().startsWith('SMD') ? smdVal : `SMD ${smdVal}`;
                }
                const vcaVal = cp?.vca || cam?.analiticas_ia?.vca_funciones;
                if (vcaVal && (Array.isArray(vcaVal) ? vcaVal.length > 0 : String(vcaVal).trim() !== '' && vcaVal !== '-')) {
                  return 'VCA';
                }
                return null;
              })();

              const videoOutputs = (() => {
                const cpOut = cp?.salidas_video;
                if (cpOut && typeof cpOut === 'string') {
                  return cpOut.replace(/^Salidas:?\s*/i, '').trim();
                }
                const nvrSalidas: any = nvr?.salidas_video;
                if (Array.isArray(nvrSalidas)) {
                  return nvrSalidas.map((v: string) => (v.includes('x') ? v : `1x ${v}`)).join(', ');
                }
                if (typeof nvrSalidas === 'string') {
                  return nvrSalidas.replace(/^Salidas:?\s*/i, '').trim();
                }
                return '1x HDMI, 1x VGA';
              })();

              const nvrIO = (() => {
                const items: string[] = [];
                const inRaw = nvr?.entradas_alarma || cp?.entradas_alarma || '';
                const outRaw = nvr?.salidas_alarma || cp?.salidas_alarma || '';
                const inMatch = inRaw.match(/(\d+)/);
                const outMatch = outRaw.match(/(\d+)/);
                if (inMatch || outMatch) {
                  const inC = inMatch ? inMatch[1] : '0';
                  const outC = outMatch ? outMatch[1] : '0';
                  items.push(`${inC} In / ${outC} Out Alarma`);
                } else if (specs.entrada_alarma || specs.salida_alarma) {
                  items.push('Alarma I/O');
                }

                const audioRaw = nvr?.audio_io || cp?.audio_io || '';
                if (audioRaw) {
                  items.push(audioRaw.replace(/^Audio:?\s*/i, ''));
                } else if (specs.salida_audio) {
                  items.push('Audio 2 Vías');
                }
                return items;
              })();

              const camIO = (() => {
                const items: string[] = [];
                if (specs.microfono) items.push('Mic Incorp.');
                if (specs.altavoz) items.push('Altavoz');
                if (specs.entrada_alarma || specs.salida_alarma) {
                  const inPart = specs.entrada_alarma ? '1 In' : '';
                  const outPart = specs.salida_alarma ? '1 Out' : '';
                  items.push(`${[inPart, outPart].filter(Boolean).join('/')} Alarma`);
                }
                if (specs.ranura_sd) items.push(`MicroSD`);
                return items;
              })();

              const smdBadge = prod.tipo_dispositivo === 'CAMARA' ? getProductSmdBadge(prod, globalBadges) : null;

              const seen = new Set<string>();
              const uniqueBadges: string[] = [];
              if (smdOrVca && !smdOrVca.toUpperCase().startsWith('SMD')) {
                seen.add(smdOrVca.toUpperCase());
                uniqueBadges.push(smdOrVca);
              }
              (prod.badges_detectados || []).forEach((b: string) => {
                const upper = b.toUpperCase().trim();
                if (upper.startsWith('SMD')) return;
                if (!seen.has(upper)) {
                  seen.add(upper);
                  uniqueBadges.push(b);
                }
              });

              return (
                <tr
                  key={prod.id}
                  onClick={() => onSelect(prod)}
                  className="group cursor-pointer hover:bg-tiandy-50/50 dark:hover:bg-tiandy-950/20 transition-colors"
                >
                  {/* Foto */}
                  <td className="py-2 px-3 text-center w-32 shrink-0" onClick={(e) => { e.stopPropagation(); onSelect(prod); }}>
                    <div
                      className="w-24 h-24 mx-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden cursor-pointer group-hover:border-tiandy-500 transition-all p-1.5 relative shadow-xs"
                      title={`Ver ficha técnica de ${prod.modelo}`}
                    >
                      <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="back" tamano="compact" />

                      {prod.imagen_principal ? (
                        <img
                          src={prod.imagen_principal}
                          alt={prod.modelo}
                          className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <Cctv className="w-8 h-8 text-slate-400 relative z-10" />
                      )}

                      <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="front" tamano="compact" />
                    </div>
                  </td>

                  {/* Modelo */}
                  <td className="py-2.5 px-3 min-w-[180px] max-w-[230px]">
                    <div className="space-y-0.5">
                      {prod.serie && prod.serie.trim() && prod.serie.trim().toLowerCase() !== 'general series' && (
                        <div className="mb-0.5">
                          <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wide border border-slate-200 dark:border-slate-700 uppercase">
                            {prod.serie.trim()}
                          </span>
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelect(prod); }}
                          className="text-left font-bold font-mono text-sm text-slate-900 group-hover:text-tiandy-600 transition-colors dark:text-slate-100 dark:group-hover:text-tiandy-400 hover:underline cursor-pointer tracking-tight"
                          title={`Ver ficha técnica de ${baseModel}`}
                        >
                          {baseModel}
                        </button>
                      </div>
                      
                      {variantSpec && (
                        <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 truncate">
                          {variantSpec}
                        </div>
                      )}

                      {(cam?.conectividad_tipo || specs.puertos_uplink || specs.ancho_banda_in || sw?.modo_extend_cctv_250m) && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                          {cam?.conectividad_tipo && <span>{cam.conectividad_tipo}</span>}
                          {specs.puertos_uplink && <span>• {specs.puertos_uplink}</span>}
                          {specs.ancho_banda_in && <span>• In: {specs.ancho_banda_in}M</span>}
                          {sw?.modo_extend_cctv_250m && <span className="text-tiandy-600 dark:text-tiandy-400 font-bold">• Extend 250m</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Columnas específicas */}
                  {isNvrRow ? (
                    <>
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="space-y-0.5">
                          {specs.resolucion && (
                            <div className="text-slate-900 dark:text-slate-100 font-bold">
                              {specs.resolucion}
                            </div>
                          )}
                          <div className="text-tiandy-700 dark:text-tiandy-300 font-semibold text-xs">
                            {specs.canales || 8} CH {specs.canales_poe ? `(${specs.canales_poe} PoE)` : ''}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {specs.bahias || '1'} SATA
                          </div>
                          {specs.capacidad_disco && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              hasta {specs.capacidad_disco}TB
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {videoOutputs}
                      </td>

                      <td className="py-2.5 px-2.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {uniqueBadges.map((badge, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono text-[11px]">
                        <div className="space-y-0.5">
                          {nvrIO.map((item, idx) => (
                            <div key={idx} className="text-slate-700 dark:text-slate-300 font-medium">
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-tiandy-50 dark:bg-tiandy-950/60 text-tiandy-700 dark:text-tiandy-300 border border-tiandy-200/80 dark:border-tiandy-800/80 uppercase">
                            {specs.formato || 'Cámara'}
                          </span>
                          {prod.tipo_dispositivo === 'CAMARA' && specs.ambiente && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              title={specs.ambiente === 'INTERIOR' ? 'Cámara de uso interior' : 'Cámara para intemperie / exterior'}
                            >
                              {specs.ambiente}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cámaras: Resolución */}
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {specs.resolucion || '—'}
                          </div>
                          {smdBadge && (
                            <img
                              src={smdBadge.imgUrl}
                              alt={smdBadge.label}
                              className="h-4 sm:h-4.5 w-auto max-w-[70px] object-contain select-none drop-shadow-2xs mt-0.5"
                              title={smdBadge.label}
                            />
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {specs.lente || '—'} {cam?.apertura_iris && <span className="text-slate-600 dark:text-slate-400 font-medium">({cam.apertura_iris})</span>}
                          </div>
                          {sensor && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {sensor}
                            </div>
                          )}
                          {minIlum && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {minIlum}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {vision && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                              {vision}
                            </span>
                          )}
                          {uniqueBadges.map((badge, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono">
                        {camIO.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {camIO.map((item, idx) => (
                              <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* Stock */}
                  <td className="py-2.5 px-2.5 text-left">
                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider shadow-2xs ${stockInfo.bg} ${stockInfo.text}`}
                    >
                      {stockInfo.label}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="py-2.5 px-3 text-right">
                    {prod.precio_usd && prod.precio_usd > 0 ? (
                      <div className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(prod.precio_usd)}
                      </div>
                    ) : (
                      <div className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Consultar
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1 items-stretch min-w-[90px]">
                      {onAddToCotizacion && (
                        <button
                          onClick={() => onAddToCotizacion(prod)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                            cotizacionIds.includes(String(prod.id))
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Añadir a la cotización"
                        >
                          {cotizacionIds.includes(String(prod.id)) ? <Check className="w-3 h-3" /> : <Calculator className="w-3 h-3" />}
                          <span>{cotizacionIds.includes(String(prod.id)) ? 'Cotizado' : 'Cotizar'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => onToggleCompare(prod)}
                        disabled={!isCompared && !canCompare}
                        className={`rounded-lg px-2 py-1 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                          isCompared
                            ? 'bg-tiandy-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                        title={isCompared ? 'Quitar de la comparativa' : 'Comparar con otros modelos'}
                      >
                        {isCompared ? <Check className="w-3 h-3" /> : <ArrowLeftRight className="w-3 h-3" />}
                        <span>{isCompared ? 'En lista' : 'Comparar'}</span>
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
  );
};
