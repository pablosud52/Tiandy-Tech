import React, { useState, useMemo } from 'react';
import { Producto, BadgeGlobalConfig } from '../../shared/types.js';
import { BadgeOverlay, SellosGraficosOverlay, getProductSellos } from './Badges.js';
import { parseModelAndSpec } from '../../shared/helpers.js';
import { Check, Calculator, ArrowLeftRight, Eye } from 'lucide-react';

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
  const { modelo, serie, tipo_dispositivo, precio_usd, estado_stock, badges_detectados, datos_tecnicos, imagen_principal } = producto;
  const [imgError, setImgError] = useState(false);
  const sellosGraficos = useMemo(() => getProductSellos(producto, globalBadges), [producto, globalBadges]);
  const hasTopRightSello = useMemo(() => sellosGraficos.some((s) => s.posicion === 'top-right'), [sellosGraficos]);

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
    const smdVal = cp?.smd || cam?.analiticas_ia?.version_smd || (producto.badges_detectados?.find((b: string) => /SMD/i.test(b)));
    if (smdVal && smdVal !== '-') {
      const cleanSmd = typeof smdVal === 'string' && smdVal.toUpperCase().startsWith('SMD') ? smdVal : `SMD ${smdVal}`;
      return { label: cleanSmd, title: 'Smart Motion Detection' };
    }
    const vcaVal = cp?.vca || cam?.analiticas_ia?.vca_funciones;
    if (vcaVal && (Array.isArray(vcaVal) ? vcaVal.length > 0 : String(vcaVal).trim() !== '' && vcaVal !== '-')) {
      const details = Array.isArray(vcaVal) ? vcaVal.join('; ') : String(vcaVal);
      return { label: 'VCA', title: `Analíticas VCA: ${details}` };
    }
    return null;
  })();

  return (
    <div className="group bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-tiandy-500/70 dark:hover:border-tiandy-500/60 shadow-hardware hover:shadow-hardware-hover dark:shadow-hardware-dark dark:hover:shadow-hardware-dark-hover hardware-card flex flex-col overflow-hidden relative">
      
      {/* Contenedor Visual de Imagen con Sellos Gráficos, Badges y Estado de Stock */}
      <div className="relative aspect-[16/10] bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-900 dark:to-slate-950/80 border-b border-slate-100 dark:border-slate-800/90 flex items-center justify-center p-3 overflow-hidden select-none">
        {/* Sellos de fondo (detrás del producto) */}
        <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="back" />

        <BadgeOverlay badges={badges_detectados} hasTopRightSello={hasTopRightSello} />

        {/* Imagen real del producto o placeholder vectorial técnico */}
        {imagen_principal && !imgError ? (
          <div 
            onClick={() => onSelect(producto)}
            className="w-full h-full flex items-center justify-center p-2 cursor-pointer relative z-10"
          >
            <img
              src={imagen_principal}
              alt={modelo}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-md"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div 
            onClick={() => onSelect(producto)}
            className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 group-hover:scale-105 transition-transform duration-300 cursor-pointer relative z-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-200/80 dark:border-slate-700">
              {tipo_dispositivo === 'CAMARA' ? (
                <span className="text-xl font-mono font-black text-tiandy-700 dark:text-tiandy-400">IPC</span>
              ) : tipo_dispositivo === 'NVR' ? (
                <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">NVR</span>
              ) : (
                <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400">PoE</span>
              )}
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest mt-2 font-bold text-slate-400 dark:text-slate-500">
              {formatoLabel}
            </span>
          </div>
        )}

        {/* Sellos frontales (delante del producto) */}
        <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="front" />

        {/* Estado de Stock con look sólido */}
        <span className={`absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono font-bold tracking-wider shadow-sm z-30 ${stockBadge.bg} ${stockBadge.text}`}>
          {stockBadge.label}
        </span>
      </div>

      {/* Contenido Principal */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Cabecera: Modelo y Serie a la izquierda | Precio a la derecha */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            {/* Izquierda: Serie arriba y Modelo principal abajo */}
            <div className="min-w-0 flex-1">
              {serie && serie.trim() && serie.trim().toLowerCase() !== 'general series' && (
                <div className="mb-0.5">
                  <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider uppercase border border-slate-200 dark:border-slate-700">
                    {serie.trim()}
                  </span>
                </div>
              )}
              <h3 
                onClick={() => onSelect(producto)}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-tiandy-600 dark:hover:text-tiandy-400 cursor-pointer transition-colors line-clamp-1 font-mono tracking-tight"
                title={producto.especificacion_completa || modelo}
              >
                {baseModel}
              </h3>
              {variantSpec && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mt-0.5 truncate tracking-tight">
                  {variantSpec}
                </span>
              )}
            </div>

            {/* Derecha: Precio en USD */}
            <div className="text-right shrink-0 pl-1">
              {precio_usd && precio_usd > 0 ? (
                <div className="flex items-baseline justify-end">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1 font-mono">
                    U$S
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {precio_usd.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Consultar
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fila de Especificaciones Clave con Chips Neutros Uniformes */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {formatoLabel && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 uppercase" title="Formato">
                {formatoLabel}
              </span>
            )}
            {tipo_dispositivo === 'CAMARA' && cam && (
              <>
                {cam.resolucion_mp && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Resolución">
                    {cam.resolucion_mp}
                  </span>
                )}
                {cam.distancia_focal && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Distancia focal">
                    {cam.distancia_focal}
                  </span>
                )}
                {cam.apertura_iris && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Apertura de iris">
                    {cam.apertura_iris}
                  </span>
                )}
                {sensor && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Sensor de imagen">
                    {sensor}
                  </span>
                )}
                {minIlum && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Iluminación mínima">
                    {minIlum}
                  </span>
                )}
                {vision && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title="Visión nocturna">
                    {vision}
                  </span>
                )}
                {smdOrVca && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60" title={smdOrVca.title}>
                    {smdOrVca.label}
                  </span>
                )}
              </>
            )}

            {tipo_dispositivo === 'NVR' && nvr && (
              <>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {nvr.canales_ip || (nvr as any).canales_video || 8}CH {nvr.puertos_poe_integrados ? `(${nvr.puertos_poe_integrados} PoE)` : ''}
                </span>
                {nvr.ancho_banda_ingreso_mbps && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {nvr.ancho_banda_ingreso_mbps} Mbps
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {nvr.bahias_sata || (nvr as any).bahias_hdd || 1} SATA
                </span>
              </>
            )}

            {tipo_dispositivo === 'SWITCH' && sw && (
              <>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {sw.puertos_poe_totales} Puertos PoE
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  Budget {sw.presupuesto_poe_watts}W
                </span>
              </>
            )}
          </div>
        </div>

        {/* Barra de Acciones de la Tarjeta */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end mt-auto">
          {/* Pastilla agrupada: Cotizar a la izquierda + Comparar a la derecha */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {/* Cotizar */}
            {onAddToCotizacion && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCotizacion(producto);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-150 ${
                  isEnCotizacion
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title="Añadir a la cotización"
              >
                {isEnCotizacion ? <Check className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
                <span>{isEnCotizacion ? 'Cotizado' : 'Cotizar'}</span>
              </button>
            )}

            {/* Separador vertical */}
            <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Comparar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(producto);
              }}
              disabled={!isCompared && !canCompare}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-150 ${
                isCompared
                  ? 'bg-tiandy-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={isCompared ? 'Quitar de la comparativa' : 'Comparar con otros modelos'}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
              <span>{isCompared ? 'En lista' : 'Comparar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
