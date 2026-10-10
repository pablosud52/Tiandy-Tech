import React, { useState } from 'react';
import { Producto } from '../../../shared/types.js';
import { ProductEditForm } from '../components/ProductEditForm.js';
import { 
  UploadCloud, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ArrowLeft
} from 'lucide-react';

interface AdminExtractorModuleProps {
  onProductAdded: () => void;
  existingProducts?: Producto[];
}

export const AdminExtractorModule: React.FC<AdminExtractorModuleProps> = ({
  onProductAdded,
  existingProducts = []
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<Producto | null>(null);
  const [extractorError, setExtractorError] = useState<string | null>(null);
  const [extractorSuccess, setExtractorSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractorError(null);
      setExtractedData(null);
      setExtractorSuccess(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setExtractorError(null);
        setExtractedData(null);
        setExtractorSuccess(null);
      } else {
        setExtractorError('El archivo debe ser un documento PDF (.pdf)');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRunExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractorError(null);
    setExtractorSuccess(null);

    const formData = new FormData();
    formData.append('datasheet', selectedFile);

    try {
      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExtractedData(data.data);
      } else {
        setExtractorError(data.error || 'Error al analizar el archivo PDF');
      }
    } catch (err: any) {
      setExtractorError(`Error de comunicación con el servidor: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveExtractedProduct = async (productToSave: Producto) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSave)
      });
      const result = await res.json();
      if (res.ok) {
        setExtractorSuccess(`¡Producto ${productToSave.modelo} guardado exitosamente en el catálogo!`);
        setExtractedData(null);
        setSelectedFile(null);
        onProductAdded();
      } else {
        setExtractorError(result.error || 'No se pudo guardar el producto');
      }
    } catch (err: any) {
      setExtractorError(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 mb-1">
          <Sparkles className="h-4 w-4" />
          Ingesta Inteligente de Datasheets
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Extractor de Fichas Técnicas PDF
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Sube un datasheet oficial de Tiandy. El extractor analizará automáticamente el documento y desplegará la información organizada por secciones técnicas para su revisión, carga de imagen y guardado en catálogo.
        </p>
      </div>

      {/* Zona Drag & Drop (Visible solo si no hay un producto extraído en revisión) */}
      {!extractedData && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:border-tiandy-600 transition-all dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-tiandy-50 text-tiandy-700 dark:bg-tiandy-950/60 dark:text-tiandy-400 mb-4">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Arrastra tu archivo PDF aquí o haz clic para examinar
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Archivos compatibles: Datasheets oficiales Tiandy (.pdf de hasta 35MB)
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-3">
            <label className="cursor-pointer rounded-2xl bg-tiandy-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-tiandy-600 active:scale-95 transition-all shadow-md shadow-tiandy-700/20">
              Seleccionar archivo PDF
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/80">
                <FileText className="h-4 w-4 text-tiandy-700 dark:text-tiandy-400" />
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={handleRunExtract}
                  disabled={isExtracting}
                  className="ml-2 rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-tiandy-700 dark:hover:bg-tiandy-600 flex items-center gap-1.5 transition-all"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analizando PDF...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Ejecutar Extracción
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta de Error */}
      {extractorError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{extractorError}</span>
        </div>
      )}

      {/* Alerta de Éxito */}
      {extractorSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{extractorSuccess}</span>
        </div>
      )}

      {/* Formulario Estructurado de Revisión y Carga Técnica (Reemplazo del JSON crudo) */}
      {extractedData && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setExtractedData(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Subir otro archivo PDF
            </button>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Extracción completada con éxito
            </span>
          </div>

          <ProductEditForm
            initialData={extractedData}
            existingProducts={existingProducts}
            onSave={handleSaveExtractedProduct}
            onCancel={() => setExtractedData(null)}
            isSaving={isSaving}
            title={`Revisión y Ajuste de Ficha: ${extractedData.modelo}`}
            submitLabel="Confirmar e Insertar en Catálogo"
          />
        </div>
      )}
    </div>
  );
};
