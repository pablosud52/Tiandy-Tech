import React, { useState, useMemo } from 'react';
import { Producto, BadgeGlobalConfig } from '../../shared/types.js';
import { BadgeOverlay, SellosGraficosOverlay, getProductSellos } from './Badges.js';
import { formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { Check, Calculator, ArrowLeftRight } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
  onSelect: (producto: Producto) => void;
  isCompared: boolean;
  onToggleCompare: (producto: Producto) => void;
  canCompare: boolean;
  onAddToCotizacion?: (producto: Producto) => void;
  isEnCotizacion?: boolean;
  globalBadges?: BadgeGlobalConfig[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  onSelect,
  isCompared,
  onToggleCompare,
  canCompare,
  onAddToCotizacion,
  isEnCotizacion = false,
  globalBadges,
}) => {
  const { modelo, serie, tipo_dispositivo, precio_usd, estado_stock, badge_nuevo, badges_detectados, datos_tecnicos, imagen_principal } = producto;
  const [imgError, setImgError] = useState(false);
  const sellosGraficos = useMemo(() => getProductSellos(producto, globalBadges), [producto, globalBadges]);
  const hasTopRightSello = useMemo(() => sellosGraficos.some((s) => s.posicion === 'top-right'), [sellosGraficos]);

  const stockStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ENTREGA_INMEDIATA: {
      label: 'ENTREGA INMEDIATA',
      bg: 'bg-emerald-50 dark:bg-emerald-950/70',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-700'
    },
    POCAS_UNIDADES: {
      label: 'POCAS UNIDADES',
      bg: 'bg-amber-50 dark:bg-amber-950/70',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700'
    },
    ULTIMA_UNIDAD: {
      label: 'ÚLTIMA EN STOCK',
      bg: 'bg-amber-100 dark:bg-amber-900/70',
      text: 'text-amber-800 dark:text-amber-200',
      border: 'border-amber-400 dark:border-amber-600'
    },
    PROXIMO_ARRIBO: {
      label: 'PRÓXIMO ARRIBO',
      bg: 'bg-sky-50 dark:bg-sky-950/70',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-300 dark:border-sky-700'
    },
    AGOTADO: {
      label: 'AGOTADO',
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600'
    },
    CONSULTAR: {
      label: 'CONSULTAR STOCK',
      bg: 'bg-purple-50 dark:bg-purple-950/70',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700'
    }
  };

  const stockBadge = stockStyles[estado_stock] || stockStyles.ENTREGA_INMEDIATA;

  // Extracción de datos y características técnicas
  const cam = datos_tecnicos?.camara;
  const nvr = datos_tecnicos?.nvr;
  const sw = datos_tecnicos?.switch;
  const cp = (datos_tecnicos as any)?.caracteristicas_principales;

  const { baseModel, variantSpec } = parseModelAndSpec(modelo, producto.subtipo, producto.especificacion_completa);

  // Formato del equipo
  const formatoLabel = (() => {
    if (tipo_dispositivo === 'CAMARA') {
      return cam?.formato || cp?.formato || 'Cámara';
    }
    if (tipo_dispositivo === 'NVR') {
      return 'NVR';
    }
    if (tipo_dispositivo === 'SWITCH') {
      return 'Switch PoE';
    }
    return tipo_dispositivo;
  })();

  // Sensor
  const sensorRaw = cp?.sensor || cam?.sensor_imagen;
  const sensor = sensorRaw ? sensorRaw.replace(/([0-9/.]+")([A-Za-z])/i, '$1 $2') : null;

  // Min. Iluminación
  const minIlumRaw = cp?.min_iluminacion || cam?.iluminacion_minima_color;
  const minIlum = (() => {
    if (!minIlumRaw) return null;
    const match = minIlumRaw.match(/([\d.]+)\s*Lux/i);
    if (match) return `${match[1]} Lux`;
    return minIlumRaw.replace(/@\s*\(?F[\d.]+/i, '').replace(/Color:\s*/i, '').trim();
  })();

  // Visión Nocturna
  const visionRaw = cp?.vision_nocturna || (cam?.alcance_ir_metros ? `IR ${cam.alcance_ir_metros}m` : null);
  const vision = visionRaw ? visionRaw.replace(/LED\s*/i, '').trim() : null;

  // SMD o VCA
  const smdOrVca = (() => {
    // 1. SMD prioritario si tiene versión especificada
    const smdVal = cp?.smd || cam?.analiticas_ia?.version_smd || (producto.badges_detectados?.find((b: string) => /SMD/i.test(b)));
    if (smdVal && smdVal !== '-') {
      const cleanSmd = typeof smdVal === 'string' && smdVal.toUpperCase().startsWith('SMD') ? smdVal : `SMD ${smdVal}`;
      return { label: cleanSmd, title: 'Smart Motion Detection' };
    }
    // 2. VCA si tiene analíticas VCA
    const vcaVal = cp?.vca || cam?.analiticas_ia?.vca_funciones;
    if (vcaVal && (Array.isArray(vcaVal) ? vcaVal.length > 0 : String(vcaVal).trim() !== '' && vcaVal !== '-')) {
      const details = Array.isArray(vcaVal) ? vcaVal.join('; ') : String(vcaVal);
      return { label: 'VCA', title: `Analíticas VCA: ${details}` };
    }
    return null;
  })();

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-tiandy-400 dark:hover:border-tiandy-600 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative">
      
      {/* Contenedor Visual de Imagen con Sellos Gráficos, Badges y Estado de Stock */}
      <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center p-4 overflow-hidden">
        {/* Sellos de fondo (detrás del producto) */}
        <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="back" />

        <BadgeOverlay badges={badges_detectados} hasTopRightSello={hasTopRightSello} />

        {/* Imagen real del producto o placeholder vectorial técnico */}
        {imagen_principal && !imgError ? (
          <div 
            onClick={() => onSelect(producto)}
            className="w-full h-full flex items-center justify-center p-3 cursor-pointer relative z-10"
          >
            <img
              src={imagen_principal}
              alt={modelo}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div 
            onClick={() => onSelect(producto)}
            className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 group-hover:scale-105 transition-transform duration-300 cursor-pointer relative z-10"
          >
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center border border-slate-100 dark:border-slate-700">
              {tipo_dispositivo === 'CAMARA' ? (
                <span className="text-2xl font-black text-tiandy-700 dark:text-tiandy-400">IPC</span>
              ) : tipo_dispositivo === 'NVR' ? (
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">NVR</span>
              ) : (
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">PoE</span>
              )}
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2 font-bold text-slate-400 dark:text-slate-500">
              {formatoLabel}
            </span>
          </div>
        )}

        {/* Sellos frontales (delante del producto) */}
        <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="front" />

        {/* Estado de Stock (+50% tamaño en modo Ficha para máxima visibilidad) */}
        <span className={`absolute bottom-2 left-2 px-3 py-1 rounded-lg text-xs sm:text-[13px] font-extrabold tracking-wide border shadow-md backdrop-blur-sm z-30 ${stockBadge.bg} ${stockBadge.text} ${stockBadge.border}`}>
          {stockBadge.label}
        </span>
      </div>

      {/* Contenido Principal */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Cabecera: Modelo a la izquierda | Serie al centro | Precio destacado a la derecha */}
          <div className="flex items-start justify-between gap-2.5 mb-2.5">
            {/* Izquierda: Modelo y Sub-especificación */}
            <div className="min-w-0 flex-1">
              <h3 
                onClick={() => onSelect(producto)}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-tiandy-600 dark:hover:text-tiandy-400 cursor-pointer transition line-clamp-1 font-mono tracking-tight"
                title={producto.especificacion_completa || modelo}
              >
                {baseModel}
              </h3>
              {variantSpec && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block mt-0.5 tracking-tight font-mono">
                  {variantSpec}
                </span>
              )}
            </div>

            {/* Centro: Insignia de Serie (bajada levemente con mt-1.5 para equilibrar el centro sin tapar la spec) */}
            {serie && serie.trim() && serie.trim().toLowerCase() !== 'general series' && (
              <div className="shrink-0 mt-1.5 flex justify-center">
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border border-slate-200/90 dark:border-slate-700">
                  {serie.trim()}
                </span>
              </div>
            )}

            {/* Derecha: Precio protagónico (U$S estándar, dígitos numéricos grandes en negrita gruesa) */}
            <div className="text-right shrink-0 pl-1">
              {precio_usd && precio_usd > 0 ? (
                <div className="flex items-baseline justify-end">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mr-1 font-mono">
                    U$S
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {precio_usd.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-base sm:text-lg font-semibold font-mono text-slate-400 dark:text-slate-500">
                    Consultar
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chips técnicos con Formato en la misma línea para reducir altura */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {formatoLabel && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase" title="Formato">
                {formatoLabel}
              </span>
            )}
            {tipo_dispositivo === 'CAMARA' && cam && (
              <>
                {cam.resolucion_mp && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Resolución">
                    {cam.resolucion_mp}
                  </span>
                )}
                {cam.distancia_focal && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Distancia focal">
                    {cam.distancia_focal}
                  </span>
                )}
                {cam.apertura_iris && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Apertura de iris">
                    {cam.apertura_iris}
                  </span>
                )}
                {sensor && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Sensor de imagen">
                    {sensor}
                  </span>
                )}
                {minIlum && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Iluminación mínima">
                    {minIlum}
                  </span>
                )}
                {vision && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" title="Visión nocturna">
                    {vision}
                  </span>
                )}
                {smdOrVca && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-white shadow-2xs border border-slate-700/80" title={smdOrVca.title}>
                    {smdOrVca.label}
                  </span>
                )}
              </>
            )}

            {tipo_dispositivo === 'NVR' && nvr && (
              <>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {nvr.canales_ip || (nvr as any).canales_video || 8} Canales IP {nvr.puertos_poe_integrados ? `(${nvr.puertos_poe_integrados} PoE)` : ''}
                </span>
                {nvr.ancho_banda_ingreso_mbps && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {nvr.ancho_banda_ingreso_mbps} Mbps
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {nvr.bahias_sata || (nvr as any).bahias_hdd || 1} SATA (hasta {nvr.capacidad_max_por_disco_tb || 10}TB)
                </span>
              </>
            )}

            {tipo_dispositivo === 'SWITCH' && sw && (
              <>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                  {sw.puertos_poe_totales} Puertos PoE
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Budget {sw.presupuesto_poe_watts}W
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pie: Botones de Acción (Comparar + Cotizar en estilo neutro sin color verde) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(producto);
            }}
            disabled={!isCompared && !canCompare}
            className={`rounded-xl px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isCompared
                ? 'bg-tiandy-700 text-white shadow-tiandy-700/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
            title={isCompared ? 'Quitar de la comparativa' : 'Comparar con otros modelos'}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isCompared ? 'Comparando' : 'Comparar'}</span>
          </button>

          {onAddToCotizacion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCotizacion(producto);
              }}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isEnCotizacion
                  ? 'bg-tiandy-700 text-white shadow-tiandy-700/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
              title="Añadir a la cotización"
            >
              {isEnCotizacion ? <Check className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isEnCotizacion ? 'Cotizando' : '+ Cotizar'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
