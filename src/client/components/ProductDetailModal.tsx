import React, { useState, useMemo } from 'react';
import { Producto, BadgeGlobalConfig } from '../../shared/types.js';
import { getProductSpecs, formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { SellosGraficosOverlay, getProductSellos, BadgeOverlay } from './Badges.js';
import { 
  X, Check, ArrowLeftRight, Download, Calculator, 
  Minus, Plus, Cpu, ChevronDown, ChevronUp, Layers, SlidersHorizontal
} from 'lucide-react';

interface ProductDetailModalProps {
  producto: Producto | null;
  onClose: () => void;
  onToggleCompare: (producto: Producto) => void;
  isCompared: boolean;
  canCompare: boolean;
  onAddToCotizacion?: (producto: Producto, cantidad: number) => void;
  globalBadges?: BadgeGlobalConfig[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  producto,
  onClose,
  onToggleCompare,
  isCompared,
  canCompare,
  onAddToCotizacion,
  globalBadges
}) => {
  if (!producto) return null;

  const specs = getProductSpecs(producto);
  const [modalImgError, setModalImgError] = useState(false);
  const [quoteQty, setQuoteQty] = useState(1);
  const [showFullDatasheetSpecs, setShowFullDatasheetSpecs] = useState(false);
  const sellosGraficos = useMemo(() => getProductSellos(producto, globalBadges), [producto, globalBadges]);
  const hasTopRightSello = useMemo(() => sellosGraficos.some((s) => s.posicion === 'top-right'), [sellosGraficos]);

  const stockBadgeMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ENTREGA_INMEDIATA: {
      label: 'STOCK DISPONIBLE',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-700'
    },
    POCAS_UNIDADES: {
      label: 'POCAS UNIDADES',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-700'
    },
    ULTIMA_UNIDAD: {
      label: 'ÚLTIMA UNIDAD',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-300 dark:border-orange-700'
    },
    PROXIMO_ARRIBO: {
      label: 'PRÓXIMO ARRIBO',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700'
    },
    AGOTADO: {
      label: 'AGOTADO',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-700'
    },
    CONSULTAR: {
      label: 'CONSULTAR STOCK',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700'
    }
  };

  const currentStock = stockBadgeMap[producto.estado_stock] || stockBadgeMap.CONSULTAR;
  const { baseModel, variantSpec } = parseModelAndSpec(producto.modelo, producto.subtipo, producto.especificacion_completa);

  const dt: any = producto.datos_tecnicos || {};
  const cp: any = dt.caracteristicas_principales || {};
  const fullSpecs: Record<string, Record<string, string | null>> = dt.especificaciones_datasheet || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {producto.serie && producto.serie.trim() && producto.serie.trim().toLowerCase() !== 'general series' && (
                <span className="rounded bg-tiandy-700 px-2 py-0.5 text-xs font-bold text-white tracking-wide">
                  {producto.serie.trim()}
                </span>
              )}
              <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                {producto.tipo_dispositivo === 'CAMARA' ? 'Cámara IP' : producto.tipo_dispositivo === 'NVR' ? 'NVR' : 'Switch PoE'}
              </span>
              {producto.badge_nuevo && (
                <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white uppercase">
                  Nuevo Lanzamiento
                </span>
              )}
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${currentStock.bg} ${currentStock.text} ${currentStock.border}`}
              >
                {currentStock.label}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {baseModel}
              </h2>
              {variantSpec && (
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">
                  {variantSpec}
                </span>
              )}
            </div>
            {producto.subtipo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {producto.subtipo}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(producto)}
              disabled={!isCompared && !canCompare}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                isCompared
                  ? 'bg-emerald-600 text-white'
                  : canCompare
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600'
                  : 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {isCompared ? <Check className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
              {isCompared ? 'En comparador' : 'Comparar'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Showcase: Foto destacada + Precios & Cotizador */}
          <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            {/* Foto del Producto con Sellos Gráficos y Badges Funcionales */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-3 flex items-center justify-center shrink-0 shadow-sm relative group overflow-hidden">
              <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="back" tamano="large" />
              <BadgeOverlay badges={producto.badges_detectados} hasTopRightSello={hasTopRightSello} />
              {producto.imagen_principal && !modalImgError ? (
                <img
                  src={producto.imagen_principal}
                  alt={producto.modelo}
                  className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 relative z-10"
                  onError={() => setModalImgError(true)}
                />
              ) : (
                <div className="text-center text-slate-300 dark:text-slate-600 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center border border-slate-200 dark:border-slate-700 mb-2">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {producto.tipo_dispositivo === 'CAMARA' ? 'IPC' : producto.tipo_dispositivo === 'NVR' ? 'NVR' : 'PoE'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {specs.formato || 'Hardware Tiandy'}
                  </span>
                </div>
              )}
              <SellosGraficosOverlay sellos={sellosGraficos} capaFiltro="front" tamano="large" />
            </div>

            {/* Datos Comerciales y Cotizador */}
            <div className="flex-1 w-full flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Precio Especial Gremio / Integrador
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`font-mono text-3xl sm:text-4xl ${
                    producto.precio_usd && producto.precio_usd > 0
                      ? 'font-black text-slate-900 dark:text-white'
                      : 'font-semibold text-slate-400 dark:text-slate-500 text-2xl'
                  }`}>
                    {formatCurrency(producto.precio_usd)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Stock garantizado para integradores y gremio de seguridad electrónica.
                </p>
              </div>

              {/* Cotizador Action */}
              {onAddToCotizacion && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
                    <button
                      onClick={() => setQuoteQty(Math.max(1, quoteQty - 1))}
                      disabled={quoteQty <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {quoteQty}
                    </span>
                    <button
                      onClick={() => setQuoteQty(quoteQty + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCotizacion(producto, quoteQty);
                      onClose();
                    }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <Calculator className="h-4 w-4" />
                    Añadir {quoteQty} {quoteQty === 1 ? 'unidad' : 'unidades'} a Cotización
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARACTERÍSTICAS PRINCIPALES (Ficha Homologada)                 */}
          {/* ============================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="bg-slate-100/70 dark:bg-slate-800/70 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Características Principales
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {producto.tipo_dispositivo === 'CAMARA' ? '13 Parámetros Clave' : 'Parámetros Clave'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {producto.tipo_dispositivo === 'CAMARA' && (
                <>
                  {/* 1. Formato */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Formato:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.formato || specs.formato || '-'}
                    </span>
                  </div>

                  {/* 2. Carcasa */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Carcasa:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.carcasa || 'Metal'}
                    </span>
                  </div>

                  {/* 3. Resolución */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Resolución:</span>
                    <span className="sm:col-span-2 font-bold text-slate-900 dark:text-white">
                      {cp.resolucion || specs.resolucion || '-'}
                    </span>
                  </div>

                  {/* 4. Sensor */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Sensor:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.sensor || '1/2.8" CMOS'}
                    </span>
                  </div>

                  {/* 5. Min. Iluminación */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Min. Iluminación:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.min_iluminacion || 'Color: 0.0001Lux @ (F1.0, AGC ON)'}
                    </span>
                  </div>

                  {/* 6. Visión Nocturna */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Visión Nocturna:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.vision_nocturna || (specs.distancia_ir ? `IR LED ${specs.distancia_ir}m` : '-')}
                    </span>
                  </div>

                  {/* 7. DORI (Normalizado como un atributo estándar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">DORI:</span>
                    <div className="sm:col-span-2 space-y-1">
                      {cp.dori ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Detecta</span>
                            <span className="font-bold text-slate-900 dark:text-white">{cp.dori.detecta || '-'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Observa</span>
                            <span className="font-bold text-slate-900 dark:text-white">{cp.dori.observa || '-'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Reconoce</span>
                            <span className="font-bold text-slate-900 dark:text-white">{cp.dori.reconoce || '-'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Identifica</span>
                            <span className="font-bold text-slate-900 dark:text-white">{cp.dori.identifica || '-'}</span>
                          </div>
                        </div>
                      ) : specs.dori_detectar ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Detecta</span>
                            <span className="font-bold text-slate-900 dark:text-white">{specs.dori_detectar}m</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Observa</span>
                            <span className="font-bold text-slate-900 dark:text-white">{specs.dori_observar ? `${specs.dori_observar}m` : '-'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Reconoce</span>
                            <span className="font-bold text-slate-900 dark:text-white">{specs.dori_reconocer ? `${specs.dori_reconocer}m` : '-'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-500 block">Identifica</span>
                            <span className="font-bold text-slate-900 dark:text-white">{specs.dori_identificar ? `${specs.dori_identificar}m` : '-'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>

                  {/* 8. Almacenamiento */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Almacenamiento:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.almacenamiento || (specs.ranura_sd ? `MicroSD hasta ${specs.max_sd_gb || '512GB'}` : '-')}
                    </span>
                  </div>

                  {/* 9. Compresión de video */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Compresión de video:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.compresion_video || 'S+265/H.265/H.264B/H.264M/H.264H'}
                    </span>
                  </div>

                  {/* 10. SMD (Estrictamente versión: SMD 2.0 o SMD 1.0 o -) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">SMD:</span>
                    <span className="sm:col-span-2 font-bold text-emerald-600 dark:text-emerald-400">
                      {cp.smd || '-'}
                    </span>
                  </div>

                  {/* 11. VCA */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">VCA:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.vca || (specs.analiticas_ia?.length ? specs.analiticas_ia.join('; ') : '-')}
                    </span>
                  </div>

                  {/* 12. Alimentación */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Alimentación:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.alimentacion || specs.alimentacion || 'DC12V, PoE IEEE 802.3af'}
                    </span>
                  </div>

                  {/* 13. Salidas Alarma */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Salidas Alarma:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">
                      {cp.salidas_alarma || '-'}
                    </span>
                  </div>
                </>
              )}

              {producto.tipo_dispositivo === 'NVR' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Canales IP:</span>
                    <span className="sm:col-span-2 font-bold text-slate-900 dark:text-white">{cp.canales_ip || `${specs.canales} canales`}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Ancho de Banda:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.ancho_banda || `${specs.ancho_banda_in}Mbps / ${specs.ancho_banda_out}Mbps`}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Bahías SATA:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.bahias_sata || `${specs.bahias}x SATA`}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Capacidad Máxima:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.capacidad_max || `Hasta ${specs.capacidad_disco}TB`}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Puertos PoE Integrados:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.puertos_poe || (specs.canales_poe ? `${specs.canales_poe} puertos` : '-')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Salidas de Video:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.salidas_video || 'HDMI / VGA'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Decodificación:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.decodificacion || specs.resolucion_grabacion_max || '-'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Compresión:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.compresion || 'S+265 / H.265 / S+264 / H.264'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">IA Soportada:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.ia_soportada || '-'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Alimentación:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.alimentacion || specs.alimentacion || 'DC12V'}</span>
                  </div>
                </>
              )}

              {producto.tipo_dispositivo === 'SWITCH' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Puertos PoE:</span>
                    <span className="sm:col-span-2 font-bold text-slate-900 dark:text-white">{cp.puertos_poe || `${specs.puertos_poe} puertos PoE`}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Velocidad PoE:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.velocidad_poe || '10/100/1000 Mbps (Gigabit)'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Puertos Uplink:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.puertos_uplink || specs.puertos_uplink || '-'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Puertos SFP Fibra:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.puertos_sfp || '-'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Presupuesto Watts:</span>
                    <span className="sm:col-span-2 font-bold text-emerald-600 dark:text-emerald-400">{cp.presupuesto_watts || (specs.presupuesto_poe ? `${specs.presupuesto_poe}W` : '-')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Estándar PoE:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.estandar_poe || 'IEEE802.3af (15.4W) / IEEE802.3at (30W)'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Modo CCTV Extend 250m:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.modo_extend || 'Soporta hasta 250m con PoE Watchdog'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">PoE Watchdog:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.poe_watchdog || 'Sí (Watchdog automático)'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Alimentación:</span>
                    <span className="sm:col-span-2 font-medium text-slate-900 dark:text-white">{cp.alimentacion || specs.alimentacion || 'AC 100-240V'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* ESPECIFICACIONES COMPLETAS DEL DATASHEET (Desplegable)         */}
          {/* ============================================================== */}
          {Object.keys(fullSpecs).length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <button
                onClick={() => setShowFullDatasheetSpecs(!showFullDatasheetSpecs)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Especificaciones Técnicas Completas del Datasheet
                  </span>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {Object.keys(fullSpecs).length} secciones
                  </span>
                </div>
                {showFullDatasheetSpecs ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {showFullDatasheetSpecs && (
                <div className="p-4 sm:p-5 space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in duration-200">
                  {Object.entries(fullSpecs).map(([catName, attrs]) => (
                    <div key={catName} className="pt-4 first:pt-0 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                        {catName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs pt-1">
                        {Object.entries(attrs).map(([attrKey, attrVal]) => (
                          <div key={attrKey} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                            <span className="text-slate-500 dark:text-slate-400 pr-2">{attrKey}:</span>
                            <span className="font-medium text-slate-900 dark:text-white text-right break-words max-w-[60%]">
                              {attrVal || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Ficha técnica oficial para integradores y gremio de seguridad electrónica.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {producto.datasheet_pdf && (
              <a
                href={producto.datasheet_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                Descargar Datasheet PDF
              </a>
            )}

            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
