import React, { useState, useEffect } from 'react';
import { Producto, EstadoStock, TipoDispositivo, SerieTiandy } from '../../shared/types.js';
import {
  UploadCloud,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Sliders,
  DollarSign,
  Package,
  Layers,
  Check,
  X,
  Plus
} from 'lucide-react';

interface AdminPageProps {
  onBackToCatalog: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToCatalog }) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'extractor' | 'nuevo'>('batch');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Quick Batch Edits State (id -> partial changes)
  const [edits, setEdits] = useState<Record<string, { precio_usd?: number; estado_stock?: EstadoStock; badge_nuevo?: boolean; activo?: boolean }>>({});

  // Extractor State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [extractorError, setExtractorError] = useState<string | null>(null);
  const [extractorSuccess, setExtractorSuccess] = useState<string | null>(null);

  // Cargar productos
  const loadProductos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/productos?limit=500');
      const data = await res.json();
      if (data.success) {
        setProductos(data.data);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  // Manejar cambios en la tabla rápida
  const handleEditChange = (id: string, field: string, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  // Guardar cambios masivos
  const handleSaveBatch = async () => {
    const itemsToUpdate = Object.entries(edits).map(([id, changes]) => ({
      id,
      ...changes
    }));

    if (itemsToUpdate.length === 0) {
      setSaveMessage('No hay cambios pendientes de guardar.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      const result = await res.json();
      if (result.success) {
        setSaveMessage(`¡${itemsToUpdate.length} productos actualizados con éxito!`);
        setEdits({});
        loadProductos();
      } else {
        setSaveMessage(`Error: ${result.error || 'No se pudo actualizar'}`);
      }
    } catch (err: any) {
      setSaveMessage(`Error al conectar con el servidor: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  // Manejo de extracción de PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractorError(null);
      setExtractedData(null);
    }
  };

  const handleRunExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractorError(null);
    setExtractorSuccess(null);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setExtractedData(data.data);
      } else {
        setExtractorError(data.error || 'Error desconocido al analizar el PDF');
      }
    } catch (err: any) {
      setExtractorError(`Error de conexión: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveExtractedProduct = async () => {
    if (!extractedData) return;

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData)
      });
      const result = await res.json();
      if (result.success) {
        setExtractorSuccess(`¡Producto ${extractedData.modelo} guardado exitosamente en el catálogo!`);
        setExtractedData(null);
        setSelectedFile(null);
        loadProductos();
      } else {
        setExtractorError(result.error || 'No se pudo guardar el producto');
      }
    } catch (err: any) {
      setExtractorError(`Error: ${err.message}`);
    }
  };

  const pendingCount = Object.keys(edits).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Sliders className="h-4 w-4" />
            Panel de Control Backoffice
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Gestión de Catálogo y Precios
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Actualización rápida de stock, precios gremio y procesador automático de datasheets PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-sm"
          >
            ← Volver al Catálogo Público
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'batch'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Editor Rápido de Precios y Stock
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('extractor')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'extractor'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Extractor Inteligente de Datasheets (PDF)
        </button>
      </div>

      {/* Feedback Alert */}
      {saveMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{saveMessage}</span>
          <button onClick={() => setSaveMessage(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: QUICK BATCH EDITOR */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Total en catálogo: <strong>{productos.length}</strong></span>
              <span>•</span>
              <span>Cambios sin guardar: <strong className="text-amber-600 dark:text-amber-400">{pendingCount}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadProductos}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Recargar
              </button>

              <button
                onClick={handleSaveBatch}
                disabled={isSaving || pendingCount === 0}
                className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white transition-all shadow-md ${
                  pendingCount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20'
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Guardando...' : `Guardar Cambios (${pendingCount})`}
              </button>
            </div>
          </div>

          {/* Batch Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-3">Serie / Tipo</th>
                  <th className="py-3 px-4 w-36">Precio USD (s/IVA)</th>
                  <th className="py-3 px-4 w-48">Estado Stock</th>
                  <th className="py-3 px-3 text-center">Nuevo</th>
                  <th className="py-3 px-3 text-center">Visible</th>
                  <th className="py-3 px-3 text-right">Estado Fila</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {productos.map((prod) => {
                  const currentEdit = edits[prod.id] || {};
                  const currentPrice = currentEdit.precio_usd !== undefined ? currentEdit.precio_usd : prod.precio_usd;
                  const currentStock = currentEdit.estado_stock || prod.estado_stock;
                  const currentNuevo = currentEdit.badge_nuevo !== undefined ? currentEdit.badge_nuevo : prod.badge_nuevo;
                  const currentActivo = currentEdit.activo !== undefined ? currentEdit.activo : prod.activo;
                  const isModified = Boolean(edits[prod.id]);

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${
                        isModified ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      {/* Modelo */}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {prod.modelo}
                      </td>

                      {/* Serie / Tipo */}
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.serie}</span>
                        <span className="text-[10px] block text-slate-400">{prod.tipo_dispositivo}</span>
                      </td>

                      {/* Precio USD Editable */}
                      <td className="py-2.5 px-4">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={currentPrice}
                            onChange={(e) =>
                              handleEditChange(prod.id, 'precio_usd', parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded-lg border border-slate-300 py-1 pl-6 pr-2 font-mono text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </td>

                      {/* Estado Stock Editable */}
                      <td className="py-2.5 px-4">
                        <select
                          value={currentStock}
                          onChange={(e) =>
                            handleEditChange(prod.id, 'estado_stock', e.target.value as EstadoStock)
                          }
                          className="w-full rounded-lg border border-slate-300 py-1 px-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <option value="ENTREGA_INMEDIATA">ENTREGA INMEDIATA</option>
                          <option value="POCAS_UNIDADES">POCAS UNIDADES</option>
                          <option value="ULTIMA_UNIDAD">ÚLTIMA UNIDAD</option>
                          <option value="PROXIMO_ARRIBO">PRÓXIMO ARRIBO</option>
                          <option value="AGOTADO">AGOTADO</option>
                          <option value="CONSULTAR">CONSULTAR</option>
                        </select>
                      </td>

                      {/* Badge Nuevo Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={currentNuevo}
                          onChange={(e) => handleEditChange(prod.id, 'badge_nuevo', e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </td>

                      {/* Activo Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={currentActivo}
                          onChange={(e) => handleEditChange(prod.id, 'activo', e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </td>

                      {/* Estado Fila */}
                      <td className="py-2.5 px-3 text-right">
                        {isModified ? (
                          <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Modificado
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Guardado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PDF DATASHEET EXTRACTOR */}
      {activeTab === 'extractor' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
              Cargar Ficha Técnica Datasheet (PDF de Tiandy)
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              El motor de extracción inteligente procesará el archivo siguiendo la especificación técnica:
              detectará serie, formato, DORI, lentes, audio, WDR, PoE y generará la ficha estructurada.
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer"
              />

              {selectedFile && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>

                  <button
                    onClick={handleRunExtract}
                    disabled={isExtracting}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow"
                  >
                    {isExtracting ? 'Analizando PDF...' : 'Ejecutar Extracción Inteligente'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extraction Error */}
          {extractorError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{extractorError}</span>
            </div>
          )}

          {/* Extraction Success */}
          {extractorSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{extractorSuccess}</span>
            </div>
          )}

          {/* Extracted Product Preview Card */}
          {extractedData && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div>
                  <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                    {extractedData.serie}
                  </span>
                  <h3 className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    {extractedData.modelo}
                  </h3>
                </div>

                <button
                  onClick={handleSaveExtractedProduct}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
                >
                  <Check className="h-4 w-4" />
                  Confirmar e Insertar en Catálogo
                </button>
              </div>

              {/* Editable Price and Stock before saving */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Precio Neto USD
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedData.precio_usd || 0}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, precio_usd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Disponibilidad de Stock
                  </label>
                  <select
                    value={extractedData.estado_stock || 'ENTREGA_INMEDIATA'}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, estado_stock: e.target.value as EstadoStock })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="ENTREGA_INMEDIATA">ENTREGA INMEDIATA</option>
                    <option value="POCAS_UNIDADES">POCAS UNIDADES</option>
                    <option value="ULTIMA_UNIDAD">ÚLTIMA UNIDAD</option>
                    <option value="PROXIMO_ARRIBO">PRÓXIMO ARRIBO</option>
                    <option value="AGOTADO">AGOTADO</option>
                    <option value="CONSULTAR">CONSULTAR</option>
                  </select>
                </div>
              </div>

              {/* JSON Raw Specs Viewer */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Datos Técnicos Extraídos Automáticamente:
                </h4>
                <pre className="max-h-64 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400">
                  {JSON.stringify(extractedData.datos_tecnicos, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
