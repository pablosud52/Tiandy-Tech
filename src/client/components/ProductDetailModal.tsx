import React from 'react';
import { Producto } from '../../shared/types.js';
import { getProductSpecs } from '../../shared/helpers.js';
import { BadgeOverlay } from './Badges.js';
import {
  X,
  FileText,
  Download,
  Shield,
  Eye,
  Radio,
  Wifi,
  HardDrive,
  Volume2,
  Mic,
  Thermometer,
  Zap,
  CheckCircle2,
  Plus,
  Check
} from 'lucide-react';

interface ProductDetailModalProps {
  producto: Producto | null;
  onClose: () => void;
  isCompared: boolean;
  onToggleCompare: (producto: Producto) => void;
  canCompare: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  producto,
  onClose,
  isCompared,
  onToggleCompare,
  canCompare
}) => {
  if (!producto) return null;

  const dt = producto.datos_tecnicos || {};
  const specs = getProductSpecs(producto);

  const stockBadgeMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ENTREGA_INMEDIATA: {
      label: 'ENTREGA INMEDIATA',
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
      bg: 'bg-amber-100 dark:bg-amber-900/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700'
    },
    PROXIMO_ARRIBO: {
      label: 'PRÓXIMO ARRIBO',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-300 dark:border-sky-700'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white tracking-wide">
                {producto.serie} Series
              </span>
              <span className="rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                {specs.formato}
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
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {producto.modelo}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {producto.subtipo || producto.especificacion_completa}
            </p>
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
              {isCompared ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Price & Badges Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Precio Especial Gremio / Instalador
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
                  ${(producto.precio_usd || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  USD neto (s/IVA)
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              {producto.badges_detectados?.map((b) => (
                <BadgeOverlay key={b} badgeType={b} />
              ))}
            </div>
          </div>

          {/* DORI Visual Standard (Cameras only) */}
          {producto.tipo_dispositivo === 'CAMARA' && specs.dori_detectar && (
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Rango DORI Óptico (Estándar EN 62676-4)
                </h3>
                <span className="text-[11px] text-slate-400">Lente {specs.lente || 'estándar'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    Detectar (25 px/m)
                  </div>
                  <div className="font-mono text-xl font-black text-emerald-900 dark:text-emerald-200">
                    {specs.dori_detectar}m
                  </div>
                  <div className="text-[9px] text-slate-500">Presencia general</div>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2.5 border border-blue-200/60 dark:border-blue-800/40">
                  <div className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
                    Observar (63 px/m)
                  </div>
                  <div className="font-mono text-xl font-black text-blue-900 dark:text-blue-200">
                    {specs.dori_observar || '-'}m
                  </div>
                  <div className="text-[9px] text-slate-500">Ropa y dirección</div>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200/60 dark:border-amber-800/40">
                  <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                    Reconocer (125 px/m)
                  </div>
                  <div className="font-mono text-xl font-black text-amber-900 dark:text-amber-200">
                    {specs.dori_reconocer || '-'}m
                  </div>
                  <div className="text-[9px] text-slate-500">Persona conocida</div>
                </div>

                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2.5 border border-rose-200/60 dark:border-rose-800/40">
                  <div className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">
                    Identificar (250 px/m)
                  </div>
                  <div className="font-mono text-xl font-black text-rose-900 dark:text-rose-200">
                    {specs.dori_identificar || '-'}m
                  </div>
                  <div className="text-[9px] text-slate-500">Certeza facial</div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Video, Óptica y Performance */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {producto.tipo_dispositivo === 'CAMARA' ? 'Sensor, Óptica e Imagen' : 'Canales, Video y Decodificación'}
              </h4>

              <div className="space-y-2 text-xs">
                {specs.resolucion && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resolución:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.resolucion}</span>
                  </div>
                )}
                {specs.resolucion_pixels && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resolución Máx (px):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.resolucion_pixels}</span>
                  </div>
                )}
                {specs.lente && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lente Focal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.lente} {specs.apertura ? `(${specs.apertura})` : ''}
                    </span>
                  </div>
                )}
                {specs.fov && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campo Visual (FOV):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.fov}</span>
                  </div>
                )}
                {specs.distancia_ir && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distancia IR:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.distancia_ir} Metros</span>
                  </div>
                )}
                {specs.distancia_luz_calida && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Luz Cálida ColorMaker:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{specs.distancia_luz_calida} Metros</span>
                  </div>
                )}
                {specs.canales && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Canales IP:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.canales} Canales</span>
                  </div>
                )}
                {specs.ancho_banda_in && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ancho de Banda Ent/Sal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.ancho_banda_in} Mbps / {specs.ancho_banda_out || '-'} Mbps
                    </span>
                  </div>
                )}
                {specs.resolucion_grabacion_max && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grabación Máxima:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.resolucion_grabacion_max}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Interfaces, Almacenamiento y Protección */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Interfaces, Audio e Instalación
              </h4>

              <div className="space-y-2 text-xs">
                {specs.microfono !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Micrófono:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.microfono ? 'Incorporado (G.711)' : 'No'}
                    </span>
                  </div>
                )}
                {specs.altavoz !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Altavoz (Bidireccional):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.altavoz ? 'Incorporado' : 'No'}
                    </span>
                  </div>
                )}
                {specs.ranura_sd !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ranura MicroSD:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.ranura_sd ? `Hasta ${specs.max_sd_gb}` : 'No'}
                    </span>
                  </div>
                )}
                {specs.bahias && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bahías SATA:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.bahias}x SATA ({specs.capacidad_disco}TB c/u)
                    </span>
                  </div>
                )}
                {specs.puertos_poe && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Puertos PoE Integrados:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {specs.puertos_poe}x ({specs.presupuesto_poe || 0}W Total)
                    </span>
                  </div>
                )}
                {specs.grado_proteccion && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Protección Intemperie:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {specs.grado_proteccion} {specs.antivandalico ? ` / ${specs.antivandalico}` : ''}
                    </span>
                  </div>
                )}
                {specs.alimentacion && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alimentación:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.alimentacion}</span>
                  </div>
                )}
                {specs.consumo_w && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consumo Máximo:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{specs.consumo_w}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Analytics and Features */}
          {dt.analiticas_ia && dt.analiticas_ia.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Analíticas de Inteligencia Artificial VCA
              </h4>
              <div className="flex flex-wrap gap-2">
                {dt.analiticas_ia.map((ia, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {ia}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-[11px] text-slate-500">
            Ficha generada para uso técnico de distribuidores e instaladores.
          </div>

          <div className="flex items-center gap-3">
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
