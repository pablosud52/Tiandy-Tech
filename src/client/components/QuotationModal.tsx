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
                Presupuesto en tiempo real con precios oficiales de lista para el gremio.
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
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Precios netos expresados en moneda oficial <strong className="text-slate-700 dark:text-slate-300">U$S</strong> (sin IVA).
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cotización sujeta a disponibilidad de stock y tipo de cambio oficial del día.
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
