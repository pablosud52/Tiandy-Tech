import React, { useState } from 'react';
import { ItemCotizacion } from '../../shared/types.js';
import { formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { 
  X, 
  Calculator, 
  Trash2, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  Printer, 
  Cctv, 
  HardDrive, 
  Network, 
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemCotizacion[];
  onUpdateQuantity: (productId: any, newQty: number) => void;
  onRemoveItem: (productId: any) => void;
  onClear: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClear
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalUnidades = items.reduce((acc, it) => acc + it.cantidad, 0);
  const totalPrecio = items.reduce((acc, it) => {
    const price = it.producto.precio_usd || 0;
    return acc + price * it.cantidad;
  }, 0);

  const handleCopyText = () => {
    const fecha = new Date().toLocaleDateString('es-ES');
    let text = `📋 COTIZACIÓN TÉCNICA TIANDY TECH\nFecha: ${fecha}\n===============================\n\n`;

    items.forEach((it) => {
      const { baseModel, variantSpec } = parseModelAndSpec(it.producto.modelo, it.producto.subtipo);
      const name = variantSpec ? `${baseModel} (${variantSpec})` : baseModel;
      const unit = formatCurrency(it.producto.precio_usd);
      const sub = formatCurrency((it.producto.precio_usd || 0) * it.cantidad);
      text += `• ${name} [${it.producto.tipo_dispositivo}]\n`;
      text += `  Cantidad: ${it.cantidad} | P. Unitario: ${unit} | Subtotal: ${sub}\n\n`;
    });

    text += `===============================\n`;
    text += `TOTAL ESTIMADO: ${formatCurrency(totalPrecio)} (Neto oficial s/IVA)\n`;
    text += `Equipos cotizados: ${totalUnidades} unidades.\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Cotización de Equipamiento
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cotizador en tiempo real con precios oficiales de lista.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Calculator className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Tu cotización está vacía
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explora el catálogo y presiona el botón "+ Cotizar" en los modelos que deseas presupuestar.
              </p>
              <button
                onClick={onClose}
                className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => {
                const prod = it.producto;
                const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo);
                const unitPrice = prod.precio_usd || 0;
                const subtotal = unitPrice * it.cantidad;

                return (
                  <div
                    key={prod.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80"
                  >
                    {/* Producto Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                        {prod.imagen_principal ? (
                          <img
                            src={prod.imagen_principal}
                            alt={baseModel}
                            className="h-full w-full object-contain"
                          />
                        ) : prod.tipo_dispositivo === 'CAMARA' ? (
                          <Cctv className="h-6 w-6 text-slate-400" />
                        ) : prod.tipo_dispositivo === 'NVR' ? (
                          <HardDrive className="h-6 w-6 text-slate-400" />
                        ) : (
                          <Network className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div>
                          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white block">
                            {baseModel}
                          </span>
                          {variantSpec && (
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 block mt-0.5 tracking-tight">
                              {variantSpec}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {prod.serie && prod.serie.trim() && prod.serie.trim().toLowerCase() !== 'general series' ? (
                            <>
                              <span className="font-semibold">{prod.serie.trim()}</span>
                              <span>•</span>
                            </>
                          ) : null}
                          <span>{prod.tipo_dispositivo === 'CAMARA' ? 'Cámara IP' : prod.tipo_dispositivo === 'NVR' ? 'Grabador NVR' : prod.tipo_dispositivo === 'SWITCH' ? 'Switch PoE' : 'Accesorio'}</span>
                        </div>

                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          Unitario: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(unitPrice)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Controles de Cantidad y Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                      {/* Selector de Cantidad */}
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(prod.id, Math.max(1, it.cantidad - 1))}
                          disabled={it.cantidad <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={it.cantidad}
                          onChange={(e) => onUpdateQuantity(prod.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 text-center font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                        />

                        <button
                          onClick={() => onUpdateQuantity(prod.id, it.cantidad + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(subtotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {it.cantidad} {it.cantidad === 1 ? 'unidad' : 'unidades'}
                        </div>
                      </div>

                      {/* Botón Borrar */}
                      <button
                        onClick={() => onRemoveItem(prod.id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        title="Quitar de la cotización"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con Resumen y Acciones */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-tiandy-500 flex-shrink-0" />
                  Los precios están expresados en Dólares Americanos (U$S) y no incluyen impuestos.
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-tiandy-500 flex-shrink-0" />
                    Mercadería sujeta a stock disponible.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-tiandy-500 flex-shrink-0" />
                    Los precios pueden variar sin previo aviso.
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Presupuesto:
                </span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPrecio)}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vaciar Lista
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-all"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? '¡Copiado al portapapeles!' : 'Copiar para WhatsApp / Email'}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-all"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export const QuotationFloatingBar: React.FC<{
  items: ItemCotizacion[];
  onOpen: () => void;
  onRemove: (id: any) => void;
  onClear: () => void;
  onUpdateQuantity?: (id: any, newQty: number) => void;
  standalone?: boolean;
}> = ({ items, onOpen, onRemove, onClear, onUpdateQuantity, standalone = true }) => {
  if (items.length === 0) return null;

  const totalUnidades = items.reduce((acc, it) => acc + (it.cantidad || 0), 0);
  const isMultiModel = items.length > 1;

  return (
    <div className={`${standalone ? 'fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform' : ''} animate-in slide-in-from-bottom duration-300`}>
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-3 sm:px-5 sm:py-3.5 shadow-2xl backdrop-blur-md text-white transition-all duration-200">
        
        {/* Columna 1: Indicador y Contador Total de Productos */}
        <div
          className={`flex ${
            isMultiModel
              ? 'flex-col items-start self-start gap-1.5 pr-2.5 sm:pr-3 pt-0.5'
              : 'items-center gap-2 pr-2.5 sm:pr-3'
          } border-r border-slate-700/80 shrink-0`}
        >
          {/* Icono blanco directo sin fondo ni borde */}
          <Calculator className="h-4 w-4 text-white shrink-0" />

          {!isMultiModel ? (
            /* 1 solo modelo: [ (X) ] PRODUCTO o PRODUCTOS */
            <div className="flex items-center gap-2">
              <span className="flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-slate-950 shadow-xs">
                {totalUnidades}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 hidden sm:inline">
                {totalUnidades === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
              </span>
            </div>
          ) : (
            /* Más de 1 modelo: Contadores de Modelos y Productos debajo del icono */
            <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-xs">
                  {items.length}
                </span>
                <span className="tracking-wide text-slate-200">
                  {items.length === 1 ? 'Modelo' : 'Modelos'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-xs">
                  {totalUnidades}
                </span>
                <span className="tracking-wide text-slate-200">
                  {totalUnidades === 1 ? 'Producto' : 'Productos'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Columna 2: Lista de modelos apilados verticalmente con Mini-Stepper
            - 1 producto: 1 fila
            - 2 productos: 2 filas
            - >2 productos: 2 productos y medio visibles (peek effect a 92px) con scroll vertical y fade mask */}
        <div
          className={`flex flex-col gap-1.5 min-w-[210px] sm:min-w-[260px] lg:min-w-[300px] transition-all duration-200 ${
            items.length > 2
              ? 'max-h-[92px] overflow-y-auto pr-1.5 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] [scrollbar-width:thin]'
              : ''
          }`}
        >
          {items.map((it) => (
            <div
              key={it.producto.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/95 pl-2.5 sm:pl-3 pr-1 py-0.5 text-xs font-mono font-medium border border-slate-700/80 text-slate-200 shrink-0 shadow-2xs hover:border-slate-600 transition-colors h-[36px]"
            >
              <span className="truncate max-w-[105px] sm:max-w-[135px] font-bold text-slate-100" title={it.producto.modelo}>
                {it.producto.modelo}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                {/* Mini Stepper: [-] [qty] [+] con márgenes superior e inferior reducidos a la mitad y número blanco más grande */}
                <div className="flex items-center h-[28px] rounded-lg bg-slate-900 border border-slate-700 px-1 text-slate-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateQuantity) {
                        if (it.cantidad <= 1) {
                          onRemove(it.producto.id);
                        } else {
                          onUpdateQuantity(it.producto.id, it.cantidad - 1);
                        }
                      } else if (it.cantidad <= 1) {
                        onRemove(it.producto.id);
                      }
                    }}
                    className="w-4.5 h-4.5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all"
                    title="Disminuir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="min-w-[22px] px-0.5 text-center font-black text-xs sm:text-[13px] font-mono text-white select-none">
                    {it.cantidad}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateQuantity) {
                        onUpdateQuantity(it.producto.id, it.cantidad + 1);
                      }
                    }}
                    className="w-4.5 h-4.5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all"
                    title="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Botón rápido para eliminar este producto */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(it.producto.id);
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Quitar producto de la cotización"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Columna 3: Botones de acción rápida (Vaciar en rojo y Ver Cotizador) */}
        <div
          className={`flex ${
            isMultiModel ? 'flex-col justify-center items-stretch gap-1.5' : 'items-center gap-2'
          } pl-3 sm:pl-4 border-l border-slate-700/80 shrink-0`}
        >
          <button
            onClick={onClear}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-950/40 transition-all active:scale-95 shrink-0"
            title="Vaciar lista de cotización"
          >
            <span>Vaciar</span>
          </button>
          <button
            onClick={onOpen}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition-all active:scale-95 shrink-0"
            title="Abrir cotizador oficial"
          >
            <span>Ver Cotizador</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

