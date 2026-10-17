import React from 'react';
import { Producto, BadgeGlobalConfig, TipoDispositivo } from '../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { SellosGraficosOverlay, getProductSellos } from './Badges.js';
import { Check, Calculator, ArrowLeftRight, Cctv } from 'lucide-react';

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

  const isNvrView = activeTab === 'NVR' || (productos.length > 0 && productos.every((p) => p.tipo_dispositivo === 'NVR'));

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Caja contenedora ampliada en altura para ver 2 filas adicionales de inmediato */}
      <div className="overflow-x-auto overflow-y-auto max-h-[880px] custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md font-bold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-400 text-[10px] shadow-xs">
            {isNvrView ? (
              <tr>
                <th className="py-3 px-3 w-36 text-center">FOTO</th>
                <th className="py-3 px-3 min-w-[180px]">MODELO</th>
                <th className="py-3 px-2.5">RESOLUCIÓN / CANALES</th>
                <th className="py-3 px-2.5">CAPACIDAD</th>
                <th className="py-3 px-2.5">SALIDA VIDEO</th>
                <th className="py-3 px-2.5">TECNOLOGÍAS</th>
                <th className="py-3 px-2.5">AUDIO & E/S</th>
                <th className="py-3 px-2.5 text-center">DISPONIBILIDAD</th>
                <th className="py-3 px-3 text-right">PRECIO</th>
                <th className="py-3 px-3 text-center w-28">ACCIONES</th>
              </tr>
            ) : (
              <tr>
                <th className="py-3 px-3 w-36 text-center">FOTO</th>
                <th className="py-3 px-3 min-w-[180px]">MODELO, SERIE & RED</th>
                <th className="py-3 px-2.5">FORMATO TIPO</th>
                <th className="py-3 px-2.5">RESOLUCIÓN</th>
                <th className="py-3 px-2.5 min-w-[160px]">ÓPTICA & SENSOR</th>
                <th className="py-3 px-2.5">TECNOLOGÍAS</th>
                <th className="py-3 px-2.5">AUDIO & E/S</th>
                <th className="py-3 px-2.5 text-center">DISPONIBILIDAD</th>
                <th className="py-3 px-3 text-right">PRECIO</th>
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

              // Datos técnicos específicos
              const cam = prod.tipo_dispositivo === 'CAMARA' ? prod.datos_tecnicos?.camara : null;
              const nvr = prod.datos_tecnicos?.nvr;
              const sw = prod.datos_tecnicos?.switch;
              const cp = (prod.datos_tecnicos as any)?.caracteristicas_principales;

              // Sensor (Solo cámaras)
              const sensorRaw = cp?.sensor || cam?.sensor_imagen;
              const sensor = sensorRaw ? sensorRaw.replace(/([0-9/.]+")([A-Za-z])/i, '$1 $2') : null;

              // Min. Iluminación (Solo cámaras)
              const minIlumRaw = cp?.min_iluminacion || cam?.iluminacion_minima_color;
              const minIlum = (() => {
                if (!minIlumRaw) return null;
                const match = minIlumRaw.match(/([\d.]+)\s*Lux/i);
                if (match) return `${match[1]} Lux`;
                return minIlumRaw.replace(/@\s*\(?F[\d.]+/i, '').replace(/Color:\s*/i, '').trim();
              })();

              // Visión Nocturna (Solo cámaras)
              const visionRaw = cp?.vision_nocturna || (cam?.alcance_ir_metros ? `IR ${cam.alcance_ir_metros}m` : null);
              const vision = visionRaw ? visionRaw.replace(/LED\s*/i, '').trim() : null;

              // SMD o VCA
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

              // Salidas de Video formateadas para NVR (sin la palabra 'Salidas:' y con cantidad)
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

              // Audio & E/S para NVR (Alarma In/Out y Audio)
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

              // Audio & E/S para Cámaras
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

              // Analíticas deduplicadas
              const seen = new Set<string>();
              const uniqueBadges: string[] = [];
              if (smdOrVca) {
                seen.add(smdOrVca.toUpperCase());
                uniqueBadges.push(smdOrVca);
              }
              (prod.badges_detectados || []).forEach((b: string) => {
                const upper = b.toUpperCase().trim();
                if (smdOrVca && upper.startsWith('SMD')) return;
                if (!seen.has(upper)) {
                  seen.add(upper);
                  uniqueBadges.push(b);
                }
              });

              return (
                <tr
                  key={prod.id}
                  onClick={() => onSelect(prod)}
                  className="group cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40"
                >
                  {/* 1. Foto con padding vertical reducido para maximizar la imagen */}
                  <td className="py-2 px-3 text-center w-36 shrink-0" onClick={(e) => { e.stopPropagation(); onSelect(prod); }}>
                    <div
                      className="w-[116px] h-[116px] mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all p-1 relative shadow-xs"
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
                        <Cctv className="w-10 h-10 text-slate-400 relative z-10" />
                      )}

                      <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="front" tamano="compact" />
                    </div>
                  </td>

                  {/* 2. Modelo */}
                  <td className="py-2.5 px-3 min-w-[180px] max-w-[230px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelect(prod); }}
                          className="text-left font-bold font-mono text-sm text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-slate-100 dark:group-hover:text-emerald-400 hover:underline cursor-pointer"
                          title={`Ver ficha técnica de ${baseModel}`}
                        >
                          {baseModel}
                        </button>
                        {prod.serie && prod.serie.trim() && prod.serie.trim().toLowerCase() !== 'general series' && (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide border border-slate-200 dark:border-slate-700">
                            {prod.serie.trim()}
                          </span>
                        )}
                      </div>
                      
                      {variantSpec && (
                        <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                          {variantSpec}
                        </div>
                      )}

                      {/* Red & Ancho de Banda */}
                      {(cam?.conectividad_tipo || specs.puertos_uplink || specs.ancho_banda_in || sw?.modo_extend_cctv_250m) && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                          {cam?.conectividad_tipo && <span>{cam.conectividad_tipo}</span>}
                          {specs.puertos_uplink && <span>• {specs.puertos_uplink}</span>}
                          {specs.ancho_banda_in && <span>• In: {specs.ancho_banda_in}M / Out: {specs.ancho_banda_out || '-'}M</span>}
                          {sw?.modo_extend_cctv_250m && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Extend 250m</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* COLUMNAS ESPECÍFICAS SEGÚN NVR O CÁMARA */}
                  {isNvrRow ? (
                    <>
                      {/* 3. NVR: Resolución / Canales */}
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="space-y-0.5">
                          {specs.resolucion && (
                            <div className="text-slate-900 dark:text-slate-100 font-bold">
                              {specs.resolucion}
                            </div>
                          )}
                          <div className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                            {specs.canales || 8} Canales {specs.canales_poe ? `(${specs.canales_poe} PoE)` : ''}
                          </div>
                        </div>
                      </td>

                      {/* 4. NVR: Capacidad */}
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="space-y-0.5">
                          <div className="text-slate-900 dark:text-slate-100 font-bold">
                            {specs.bahias || 1}x SATA
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                            hasta {specs.capacidad_disco || 10}TB
                          </div>
                        </div>
                      </td>

                      {/* 5. NVR: Salida Video */}
                      <td className="py-2.5 px-2.5 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {videoOutputs}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* 3. Cámara: Formato / Tipo */}
                      <td className="py-2.5 px-2.5 capitalize font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {specs.formato}
                      </td>

                      {/* 4. Cámara: Resolución */}
                      <td className="py-2.5 px-2.5 font-mono">
                        <div className="text-slate-900 dark:text-slate-100 font-bold text-xs">
                          {specs.resolucion || (specs.puertos_poe ? `${specs.puertos_poe}x PoE (${specs.presupuesto_poe || 0}W)` : '—')}
                        </div>
                      </td>

                      {/* 5. Cámara: Óptica & Sensor */}
                      <td className="py-2.5 px-2.5 min-w-[160px]">
                        {specs.lente || sensor || minIlum || vision ? (
                          <div className="space-y-0.5 text-[11px]">
                            {specs.lente && (
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {specs.lente} {cam?.apertura_iris ? `• ${cam.apertura_iris}` : ''}
                              </div>
                            )}
                            {sensor && (
                              <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                Sensor: {sensor}
                              </div>
                            )}
                            {minIlum && (
                              <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                Min. Ilum: <span className="font-semibold text-slate-700 dark:text-slate-300">{minIlum}</span>
                              </div>
                            )}
                            {vision && (
                              <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                Visión: <span className="font-semibold text-slate-700 dark:text-slate-300">{vision}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">—</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* 6. Tecnologías / Analítica & Etiquetas */}
                  <td className="py-2.5 px-2.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {uniqueBadges.slice(0, 3).map((b) => (
                        <span
                          key={b}
                          className="rounded bg-slate-800 dark:bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white border border-slate-700/80 shadow-2xs whitespace-nowrap"
                        >
                          {b}
                        </span>
                      ))}
                      {uniqueBadges.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-sans self-center">
                          +{uniqueBadges.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 7. Audio & E/S */}
                  <td className="py-2.5 px-2.5">
                    {isNvrRow ? (
                      nvrIO.length > 0 ? (
                        <div className="space-y-0.5 text-[10px]">
                          {nvrIO.map((item, idx) => (
                            <div key={idx} className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">—</span>
                      )
                    ) : (
                      camIO.length > 0 ? (
                        <div className="space-y-0.5 text-[10px]">
                          {camIO.map((item, idx) => (
                            <span key={idx} className="inline-block bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">—</span>
                      )
                    )}
                  </td>

                  {/* 8. Disponibilidad de Stock */}
                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${stockInfo.bg} ${stockInfo.text} ${stockInfo.border}`}
                    >
                      {stockInfo.label}
                    </span>
                  </td>

                  {/* 9. Precio Neto U$S (Más grande y Consultar en gris, sin texto IVA) */}
                  <td className="py-2.5 px-3 text-right">
                    {prod.precio_usd && prod.precio_usd > 0 ? (
                      <div className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(prod.precio_usd)}
                      </div>
                    ) : (
                      <div className="font-mono text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                        Consultar
                      </div>
                    )}
                  </td>

                  {/* 10. Acciones: Botones completos apilados con texto idénticos a Ficha */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1.5 items-stretch min-w-[95px]">
                      {/* Botón Comparar */}
                      <button
                        onClick={() => onToggleCompare(prod)}
                        disabled={!isCompared && !canCompare}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs ${
                          isCompared
                            ? 'bg-tiandy-700 text-white shadow-tiandy-700/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                        }`}
                        title={isCompared ? 'Quitar de la comparativa' : 'Comparar con otros modelos'}
                      >
                        {isCompared ? <Check className="w-3 h-3" /> : <ArrowLeftRight className="w-3 h-3" />}
                        <span>{isCompared ? 'Comparando' : 'Comparar'}</span>
                      </button>

                      {/* Botón Cotizador */}
                      {onAddToCotizacion && (
                        <button
                          onClick={() => onAddToCotizacion(prod)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs ${
                            cotizacionIds.includes(String(prod.id))
                              ? 'bg-tiandy-700 text-white shadow-tiandy-700/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                          }`}
                          title="Añadir a la cotización"
                        >
                          {cotizacionIds.includes(String(prod.id)) ? <Check className="w-3 h-3" /> : <Calculator className="w-3 h-3" />}
                          <span>{cotizacionIds.includes(String(prod.id)) ? 'Cotizando' : '+ Cotizar'}</span>
                        </button>
                      )}
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
