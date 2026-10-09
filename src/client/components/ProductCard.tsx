import React from 'react';
import { Producto } from '../../shared/types.js';
import { BadgeOverlay } from './Badges.js';
import { Eye, Plus, Check, FileText, Zap, Shield, HardDrive, Wifi, Radio } from 'lucide-react';

interface ProductCardProps {
  producto: Producto;
  onSelect: (producto: Producto) => void;
  isCompared: boolean;
  onToggleCompare: (producto: Producto) => void;
  canCompare: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  onSelect,
  isCompared,
  onToggleCompare,
  canCompare
}) => {
  const { modelo, serie, tipo_dispositivo, precio_usd, estado_stock, badge_nuevo, badges_detectados, datos_tecnicos } = producto;

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
      label: 'ÚLTIMA EN STOCK',
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
      label: 'CONSULTAR STOCK',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    }
  };

  const stockBadge = stockStyles[estado_stock] || stockStyles.ENTREGA_INMEDIATA;

  // Resumen de specs según tipo
  const cam = datos_tecnicos?.camara;
  const nvr = datos_tecnicos?.nvr;
  const sw = datos_tecnicos?.switch;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-tiandy-400 dark:hover:border-tiandy-600 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative">
      
      {/* Contenedor Visual con Badges */}
      <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center p-4 overflow-hidden">
        <BadgeOverlay badges={badges_detectados} isNew={badge_nuevo} />

        {/* Imagen del producto o placeholder vectorial técnico */}
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 group-hover:scale-105 transition-transform duration-300">
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
            {cam?.formato || (tipo_dispositivo === 'NVR' ? `${nvr?.canales_ip} Canales` : `${sw?.puertos_poe_totales}P PoE`)}
          </span>
        </div>

        {/* Botón flotante para comparar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(producto);
          }}
          disabled={!isCompared && !canCompare}
          className={`absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-sm ${
            isCompared
              ? 'bg-tiandy-700 text-white'
              : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-tiandy-50 dark:hover:bg-slate-700'
          }`}
        >
          {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isCompared ? 'Comparando' : 'Comparar'}</span>
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Serie y Subtipo */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1">
            <span className="font-semibold text-tiandy-700 dark:text-tiandy-400 uppercase tracking-wider text-[11px]">
              {serie || 'Tiandy Series'}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {tipo_dispositivo}
            </span>
          </div>

          {/* Modelo */}
          <h3 
            onClick={() => onSelect(producto)}
            className="text-base font-bold text-slate-900 dark:text-white hover:text-tiandy-600 dark:hover:text-tiandy-400 cursor-pointer transition line-clamp-1"
            title={producto.especificacion_completa}
          >
            {modelo}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
            {producto.subtipo || producto.especificacion_completa}
          </p>

          {/* Chips técnicos */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cam && (
              <>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {cam.resolucion_mp}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {cam.distancia_focal}
                </span>
                {cam.apertura_iris && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {cam.apertura_iris}
                  </span>
                )}
                {cam.alcance_ir_metros ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    IR {cam.alcance_ir_metros}m
                  </span>
                ) : null}
                {cam.alcance_luz_blanca_metros ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Luz {cam.alcance_luz_blanca_metros}m
                  </span>
                ) : null}
              </>
            )}

            {nvr && (
              <>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  {nvr.canales_ip} Canales IP
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {nvr.ancho_banda_ingreso_mbps} Mbps
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {nvr.bahias_sata} SATA (hasta {nvr.capacidad_max_por_disco_tb}TB)
                </span>
              </>
            )}

            {sw && (
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

          {/* Resumen DORI (si aplica a cámara) */}
          {cam?.dori_metros?.detectar && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2 mb-3 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                <span>Alcance DORI (Metros)</span>
                <span className="font-mono text-tiandy-600 dark:text-tiandy-400">EN 62676-4</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                <div className="bg-white dark:bg-slate-700 py-0.5 rounded border border-slate-200/60 dark:border-slate-600">
                  <span className="text-[9px] text-slate-400 block">D</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cam.dori_metros.detectar}m</span>
                </div>
                <div className="bg-white dark:bg-slate-700 py-0.5 rounded border border-slate-200/60 dark:border-slate-600">
                  <span className="text-[9px] text-slate-400 block">O</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cam.dori_metros.observar}m</span>
                </div>
                <div className="bg-white dark:bg-slate-700 py-0.5 rounded border border-slate-200/60 dark:border-slate-600">
                  <span className="text-[9px] text-slate-400 block">R</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cam.dori_metros.reconocer}m</span>
                </div>
                <div className="bg-white dark:bg-slate-700 py-0.5 rounded border border-slate-200/60 dark:border-slate-600">
                  <span className="text-[9px] text-slate-400 block">I</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cam.dori_metros.identificar}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie Comercial: Precio USD y Estado de Stock */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Precio Mayorista
            </div>
            <div className="text-lg font-black text-tiandy-800 dark:text-tiandy-300 font-mono">
              {precio_usd !== null && precio_usd !== undefined ? (
                <>
                  <span className="text-xs text-slate-500 font-normal mr-1">USD</span>
                  ${precio_usd.toFixed(2)}
                </>
              ) : (
                <span className="text-xs text-slate-400 font-sans italic">Consultar</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockBadge.bg} ${stockBadge.text} ${stockBadge.border}`}>
              {stockBadge.label}
            </span>
            <button
              onClick={() => onSelect(producto)}
              className="mt-1 text-xs font-semibold text-tiandy-700 dark:text-tiandy-400 hover:underline flex items-center gap-0.5"
            >
              <span>Ver ficha</span>
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
