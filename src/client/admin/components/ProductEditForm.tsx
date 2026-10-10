import React, { useState, useEffect, useMemo } from 'react';
import { Producto, TipoDispositivo, EstadoStock } from '../../../shared/types.js';
import { formatCurrency, parseModelAndSpec } from '../../../shared/helpers.js';
import { optimizeImageToWebP, formatFileSize } from '../../utils/imageOptimizer.js';
import { 
  Camera, 
  HardDrive, 
  Network, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  Layers, 
  Cpu, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  Eye, 
  ShieldCheck,
  Volume2,
  Mic,
  Database,
  Sparkles
} from 'lucide-react';

interface ProductEditFormProps {
  initialData: Partial<Producto>;
  existingProducts?: Producto[];
  isNew?: boolean;
  onSave: (product: Producto) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
  title?: string;
  submitLabel?: string;
}

const AVAILABLE_BADGES: { id: string; label: string; desc: string }[] = [
  { id: 'COLORMAKER', label: 'ColorMaker', desc: 'Color vívido las 24 horas con gran apertura' },
  { id: 'SUPER_STARLIGHT', label: 'Super Starlight', desc: 'Sensibilidad extrema a ultra baja luz' },
  { id: 'EARLY_WARNING', label: 'Early Warning (EW)', desc: 'Disuasión activa con estrobo y altavoz' },
  { id: 'DUAL_LIGHT', label: 'Dual Light', desc: 'Iluminación híbrida IR + Luz blanca' },
  { id: 'MIC_INCORPORADO', label: 'Micrófono Incorporado', desc: 'Captura de audio en tiempo real' },
  { id: 'PARLANTE_INCORPORADO', label: 'Altavoz / Parlante', desc: 'Audio bidireccional y sirenas' },
  { id: 'POE_INTEGRADO', label: 'PoE Integrado', desc: 'Alimentación y datos por un solo cable' },
  { id: 'SMART_IR', label: 'Smart IR', desc: 'Ajuste inteligente de infrarrojos sin sobreexposición' }
];

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  initialData,
  existingProducts = [],
  isNew = false,
  onSave,
  onCancel,
  isSaving = false,
  title,
  submitLabel = 'Guardar Ficha Técnica'
}) => {
  const [formData, setFormData] = useState<Partial<Producto>>({
    modelo: '',
    serie: 'Lite Series',
    tipo_dispositivo: 'CAMARA',
    subtipo: '',
    especificacion_completa: '',
    codigo_1: '',
    codigo_2: '',
    precio_usd: 0,
    estado_stock: 'ENTREGA_INMEDIATA',
    badge_nuevo: false,
    visible: true,
    imagen_principal: '',
    datasheet_pdf: '',
    badges_detectados: [],
    datos_tecnicos: {},
    ...initialData
  });

  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'badges'>('general');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageStats, setImageStats] = useState<{
    originalSize: string;
    optimizedSize: string;
    dimensions: string;
  } | null>(null);

  const [baseModelInput, setBaseModelInput] = useState(() => {
    const parsed = parseModelAndSpec(initialData?.modelo || '', initialData?.subtipo, initialData?.especificacion_completa);
    return parsed.baseModel;
  });

  const [variantSpecInput, setVariantSpecInput] = useState(() => {
    const parsed = parseModelAndSpec(initialData?.modelo || '', initialData?.subtipo, initialData?.especificacion_completa);
    return parsed.variantSpec;
  });

  // Validación de unicidad de Código 1 y Código 2 en tiempo real contra los productos existentes
  const codeValidation = useMemo(() => {
    const c1 = (formData.codigo_1 || '').trim();
    const c2 = (formData.codigo_2 || '').trim();
    const currentId = formData.id;

    let errorCod1: string | null = null;
    let errorCod2: string | null = null;

    if (!existingProducts || existingProducts.length === 0) {
      return { errorCod1, errorCod2, isValid: true };
    }

    for (const other of existingProducts) {
      // Ignorar el mismo producto (por ID o por modelo si es edición)
      if (currentId && String(other.id) === String(currentId)) continue;
      if (formData.modelo && other.modelo.toUpperCase() === formData.modelo.toUpperCase() && !currentId) continue;

      const o1 = (other.codigo_1 || '').trim();
      const o2 = (other.codigo_2 || '').trim();

      if (c1 && (c1 === o1 || c1 === o2)) {
        errorCod1 = `El Código 1 "${c1}" ya está en uso por "${other.modelo}". No puede repetirse entre productos.`;
      }
      if (c2 && (c2 === o1 || c2 === o2)) {
        errorCod2 = `El Código 2 "${c2}" ya está en uso por "${other.modelo}". No puede repetirse entre productos.`;
      }
    }

    return {
      errorCod1,
      errorCod2,
      isValid: !errorCod1 && !errorCod2
    };
  }, [formData.codigo_1, formData.codigo_2, formData.id, formData.modelo, existingProducts]);

  // Sincronizar si cambia initialData (ej: tras extracción de PDF o selección de producto)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
      const parsed = parseModelAndSpec(initialData.modelo || '', initialData.subtipo, initialData.especificacion_completa);
      setBaseModelInput(parsed.baseModel);
      setVariantSpecInput(parsed.variantSpec);
    }
  }, [initialData]);

  // Manejo de cambios en Modelo Base y Spec en cuadros separados
  const handleBaseModelChange = (val: string) => {
    setBaseModelInput(val);
    const trimmedBase = val.trim();
    const trimmedSpec = variantSpecInput.trim();
    const combined = trimmedSpec ? `${trimmedBase} ${trimmedSpec}` : trimmedBase;
    setFormData(prev => ({ ...prev, modelo: combined, especificacion_completa: combined }));
  };

  const handleVariantSpecChange = (val: string) => {
    const cleanVal = val.replace(/^Spec[:.\s-]*/i, '');
    setVariantSpecInput(cleanVal);
    const trimmedBase = baseModelInput.trim();
    const trimmedSpec = cleanVal.trim();
    const combined = trimmedSpec ? `${trimmedBase} ${trimmedSpec}` : trimmedBase;
    setFormData(prev => ({ ...prev, modelo: combined, especificacion_completa: combined }));
  };

  // Detección de duplicado por modelo
  const isDuplicate = React.useMemo(() => {
    if (!formData.modelo || !formData.modelo.trim()) return false;
    const cleanCurrent = formData.modelo.trim().toLowerCase();
    return existingProducts.some(
      (p) => p.modelo.toLowerCase() === cleanCurrent && (!formData.id || p.id !== formData.id)
    );
  }, [formData.modelo, formData.id, existingProducts]);

  // Manejo de cambios en datos generales
  const handleGeneralChange = (field: keyof Producto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Manejo de cambios en datos técnicos específicos
  const handleTechnicalChange = (section: 'camara' | 'nvr' | 'switch', field: string, value: any) => {
    setFormData((prev) => {
      const existingSection = (prev.datos_tecnicos as any)?.[section] || {};
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          [section]: {
            ...existingSection,
            [field]: value
          }
        }
      };
    });
  };

  // Toggle de badges
  const handleToggleBadge = (badge: string) => {
    setFormData((prev) => {
      const current = prev.badges_detectados || [];
      const updated = current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge];
      return { ...prev, badges_detectados: updated };
    });
  };

  // Subir imagen local al backend con optimización automática a WebP y redimensionado
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);
    setImageStats(null);

    try {
      // 1. Redimensionar a máx 800px y convertir a WebP ligero
      const optimized = await optimizeImageToWebP(file, 800, 0.85);

      // 2. Preparar payload con archivo .webp
      const body = new FormData();
      body.append('image', optimized.blob, optimized.fileName);

      // 3. Enviar a endpoint de guardado
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, imagen_principal: data.url }));
        setImageStats({
          originalSize: formatFileSize(optimized.originalSize),
          optimizedSize: formatFileSize(optimized.optimizedSize),
          dimensions: `${optimized.width}x${optimized.height} px`
        });
      } else {
        setImageUploadError(data.error || 'Error al subir la imagen');
      }
    } catch (err: any) {
      setImageUploadError(`Error procesando imagen: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
      // Reset input para permitir seleccionar el mismo archivo si se desea reintentar
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBase = baseModelInput.trim();
    const finalSpec = variantSpecInput.trim();
    const finalModel = finalSpec ? `${finalBase} ${finalSpec}` : finalBase;

    if (!finalBase) {
      alert('El Modelo Base del producto es obligatorio');
      return;
    }

    if (!codeValidation.isValid) {
      alert(codeValidation.errorCod1 || codeValidation.errorCod2 || 'No puede haber códigos repetidos entre distintos productos.');
      return;
    }

    const toSave: Producto = {
      ...(formData as Producto),
      modelo: finalModel,
      especificacion_completa: formData.especificacion_completa || finalModel,
      codigo_1: formData.codigo_1 ? formData.codigo_1.trim() : null,
      codigo_2: formData.codigo_2 ? formData.codigo_2.trim() : null
    };
    onSave(toSave);
  };

  const camSpecs = (formData.datos_tecnicos as any)?.camara || {};
  const nvrSpecs = (formData.datos_tecnicos as any)?.nvr || {};
  const switchSpecs = (formData.datos_tecnicos as any)?.switch || {};

  const { baseModel, variantSpec } = parseModelAndSpec(formData.modelo || '', formData.subtipo || '');

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header del Modal */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 px-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {title || (formData.id ? `Editar Modelo: ${formData.modelo}` : 'Nuevo Producto en Catálogo')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {baseModel} {variantSpec ? `• Variante: ${variantSpec}` : ''}
          </p>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Alerta de Producto Duplicado */}
      {isDuplicate && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 p-3.5 flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">¡Atención! Este modelo ya existe en el catálogo:</span>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Se detectó el modelo <strong>"{formData.modelo}"</strong> previamente cargado. Si guardas estos cambios, sobrescribirás o duplicarás la ficha técnica existente.
            </p>
          </div>
        </div>
      )}

      {/* Tabs de Navegación Interna */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          1. General y Comercial
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'specs'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4" />
          2. Especificaciones Técnicas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Tag className="h-4 w-4" />
          3. Tecnologías y Badges ({formData.badges_detectados?.length || 0})
        </button>
      </div>

      {/* Formulario Scrolleable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-1 space-y-5">
        {/* TAB 1: GENERAL & COMERCIAL */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Modelo Base y Spec en Cuadros Separados */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cuadro 1: Modelo Base */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Modelo Base *
                  </label>
                  <input
                    type="text"
                    value={baseModelInput}
                    onChange={(e) => handleBaseModelChange(e.target.value)}
                    placeholder="ej. TC-C320N, TC-C34XN, TC-R3110"
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Código base del dispositivo (sin variante de lente/hardware)
                  </span>
                </div>

                {/* Cuadro 2: Especificación / Variante (Spec) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Especificación / Variante (Spec)
                  </label>
                  <input
                    type="text"
                    value={variantSpecInput}
                    onChange={(e) => handleVariantSpecChange(e.target.value)}
                    placeholder="ej. 1ANB-28, 1CNB-28, I3W/E/Y/2.8mm/V4.2"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:border-tiandy-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sin prefijo "Spec:". Se visualiza debajo del modelo en gris.
                  </span>
                </div>
              </div>

              {/* Vista previa en tiempo real */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Visualización en catálogo:</span>
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {baseModelInput || '—'}
                    </span>
                    {variantSpecInput && (
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                        {variantSpecInput}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Modelo exacto guardado: <span className="font-bold text-slate-700 dark:text-slate-300">"{formData.modelo || ''}"</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Serie Comercial */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Serie Comercial *
                </label>
                <input
                  type="text"
                  value={formData.serie || ''}
                  onChange={(e) => handleGeneralChange('serie', e.target.value)}
                  placeholder="ej. Lite Series, AK Series, Spark Series..."
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                />
              </div>

              {/* Tipo de Dispositivo */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Dispositivo *
                </label>
                <select
                  value={formData.tipo_dispositivo || 'CAMARA'}
                  onChange={(e) => handleGeneralChange('tipo_dispositivo', e.target.value as TipoDispositivo)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                >
                  <option value="CAMARA">Cámara IP</option>
                  <option value="NVR">Grabador NVR</option>
                  <option value="SWITCH">Switch PoE</option>
                </select>
              </div>

              {/* Subtipo / Variante descriptiva */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Subtipo / Variante
                </label>
                <input
                  type="text"
                  value={formData.subtipo || ''}
                  onChange={(e) => handleGeneralChange('subtipo', e.target.value)}
                  placeholder="ej. Turret 2MP Fixed Lens"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                />
              </div>

              {/* Precio en U$S (2 decimales) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Precio Neto U$S (s/IVA) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    U$S
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_usd || 0}
                    onChange={(e) => handleGeneralChange('precio_usd', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-12 pr-3 font-mono text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estado de Stock */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Disponibilidad de Stock *
                </label>
                <select
                  value={formData.estado_stock || 'ENTREGA_INMEDIATA'}
                  onChange={(e) => handleGeneralChange('estado_stock', e.target.value as EstadoStock)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
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

            {/* Códigos de Sincronización e Integración (Sistema de Stock y Precios) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                    <Database className="h-4 w-4 text-tiandy-700 dark:text-tiandy-400" />
                    <span>Códigos de Sincronización e Integración</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Reservados para vincular con la base de datos de stock y precios de la empresa. No visibles en la web pública, pero indexados para búsquedas.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  Dejar en blanco si no aplica • Unicidad estricta
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Código 1 */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Código 1 (ej: Código ERP / Stock)
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_1 || ''}
                    onChange={(e) => handleGeneralChange('codigo_1', e.target.value)}
                    placeholder="ej. ART-0491 o 10442 (opcional)"
                    className={`w-full rounded-xl border p-2.5 font-mono text-xs font-bold focus:outline-none transition-colors ${
                      codeValidation.errorCod1
                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-tiandy-600'
                    }`}
                  />
                  {codeValidation.errorCod1 ? (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                      ⚠️ {codeValidation.errorCod1}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Identificador principal. No puede repetirse en otros productos.
                    </span>
                  )}
                </div>

                {/* Código 2 */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Código 2 (ej: Código de barras / alternativo)
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_2 || ''}
                    onChange={(e) => handleGeneralChange('codigo_2', e.target.value)}
                    placeholder="ej. 779812345678 (opcional)"
                    className={`w-full rounded-xl border p-2.5 font-mono text-xs font-bold focus:outline-none transition-colors ${
                      codeValidation.errorCod2
                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-tiandy-600'
                    }`}
                  />
                  {codeValidation.errorCod2 ? (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                      ⚠️ {codeValidation.errorCod2}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Puede ser igual al Código 1 en este mismo producto, pero no repetirse en otros.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Checkboxes de Visibilidad y Nuevo */}
            <div className="flex flex-wrap items-center gap-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.visible !== false}
                  onChange={(e) => handleGeneralChange('visible', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Visible en Catálogo Público
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-400">
                <input
                  type="checkbox"
                  checked={Boolean(formData.badge_nuevo)}
                  onChange={(e) => handleGeneralChange('badge_nuevo', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <span>Marcar con Badge "Nuevo Ingreso"</span>
              </label>
            </div>

            {/* Carga de Imagen del Producto con Optimización Automática WebP */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Imagen Principal del Producto
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  Auto-optimización WebP (Máx. 800px)
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Preview */}
                <div className="relative w-28 h-28 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
                  {formData.imagen_principal ? (
                    <>
                      <img
                        src={formData.imagen_principal}
                        alt={formData.modelo}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider">
                        {formData.imagen_principal.endsWith('.webp') ? 'WEBP' : 'IMG'}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <ImageIcon className="h-8 w-8 mb-1" />
                      <span className="text-[9px] font-semibold text-slate-400">Sin Imagen</span>
                    </div>
                  )}
                </div>

                {/* Subir archivo o ingresar URL */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-xl bg-slate-900 text-white dark:bg-tiandy-700 hover:bg-slate-800 dark:hover:bg-tiandy-600 px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
                      {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploadingImage ? 'Optimizando a WebP...' : 'Subir imagen desde equipo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>

                    {formData.imagen_principal && (
                      <button
                        type="button"
                        onClick={() => {
                          handleGeneralChange('imagen_principal', '');
                          setImageStats(null);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>

                  {/* Estadísticas de compresión WebP en tiempo real */}
                  {imageStats && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Imagen optimizada a <strong>{imageStats.dimensions}</strong> • Reducida de {imageStats.originalSize} a <strong>{imageStats.optimizedSize}</strong> en formato WebP ultraligero.
                      </span>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.imagen_principal || ''}
                    onChange={(e) => handleGeneralChange('imagen_principal', e.target.value)}
                    placeholder="o pega una URL directa de imagen (ej: /data/images/... o https://...)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                  />

                  {imageUploadError && (
                    <p className="text-xs text-rose-600 font-semibold">{imageUploadError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción / Ficha Completa */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Especificación Completa / Resumen de Ficha
              </label>
              <textarea
                rows={3}
                value={formData.especificacion_completa || ''}
                onChange={(e) => handleGeneralChange('especificacion_completa', e.target.value)}
                placeholder="Resumen de especificaciones para búsqueda rápida..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ESPECIFICACIONES TÉCNICAS */}
        {activeTab === 'specs' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {formData.tipo_dispositivo === 'CAMARA' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <Camera className="h-4 w-4" />
                  Parámetros Técnicos de Cámara IP
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Formato de Carcasa
                    </label>
                    <select
                      value={camSpecs.formato || 'Turret'}
                      onChange={(e) => handleTechnicalChange('camara', 'formato', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Bullet">Bullet</option>
                      <option value="Turret">Turret</option>
                      <option value="Domo">Domo</option>
                      <option value="PTZ">PTZ</option>
                      <option value="Fisheye">Fisheye</option>
                      <option value="Box">Box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución (Megapíxeles)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.resolucion_mp || '2MP'}
                      onChange={(e) => handleTechnicalChange('camara', 'resolucion_mp', e.target.value)}
                      placeholder="ej. 2MP, 4MP, 8MP (4K)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución Máx. Píxeles
                    </label>
                    <input
                      type="text"
                      value={camSpecs.resolucion_max_pixels || '1920x1080'}
                      onChange={(e) => handleTechnicalChange('camara', 'resolucion_max_pixels', e.target.value)}
                      placeholder="ej. 1920x1080, 2560x1440, 3840x2160"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Lente / Distancia Focal
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_focal || '2.8mm'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_focal', e.target.value)}
                      placeholder="ej. 2.8mm, 4mm, 2.7-13.5mm motorizado"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Apertura de Iris
                    </label>
                    <input
                      type="text"
                      value={camSpecs.apertura_iris || 'F1.6'}
                      onChange={(e) => handleTechnicalChange('camara', 'apertura_iris', e.target.value)}
                      placeholder="ej. F1.6, F2.0, F1.0"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Sensor de Imagen
                    </label>
                    <input
                      type="text"
                      value={camSpecs.sensor_imagen || '1/2.8" CMOS'}
                      onChange={(e) => handleTechnicalChange('camara', 'sensor_imagen', e.target.value)}
                      placeholder='ej. 1/2.8" CMOS, 1/1.8" CMOS'
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Alcance Infrarrojo (IR)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_ir_m || '30m'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_ir_m', e.target.value)}
                      placeholder="ej. 30m, 50m, 80m"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Luz Cálida / Blanca
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_luz_blanca_m || '0m'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_luz_blanca_m', e.target.value)}
                      placeholder="ej. 30m, 50m (si aplica)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      WDR (Rango Dinámico)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.wdr || 'DWDR'}
                      onChange={(e) => handleTechnicalChange('camara', 'wdr', e.target.value)}
                      placeholder="ej. DWDR, 120dB, 140dB"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Compresión Códecs
                    </label>
                    <input
                      type="text"
                      value={camSpecs.codecs_video || 'S+265/H.265/H.264'}
                      onChange={(e) => handleTechnicalChange('camara', 'codecs_video', e.target.value)}
                      placeholder="ej. S+265/H.265/H.264"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Protección Intemperie
                    </label>
                    <input
                      type="text"
                      value={camSpecs.proteccion_ip || 'IP67'}
                      onChange={(e) => handleTechnicalChange('camara', 'proteccion_ip', e.target.value)}
                      placeholder="ej. IP67, IP66, IK10"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Toggles de Hardware de Cámara */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.microfono_incorporado)}
                      onChange={(e) => handleTechnicalChange('camara', 'microfono_incorporado', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Mic className="h-4 w-4 text-emerald-600" />
                    Micrófono Incorporado
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.altavoz_incorporado)}
                      onChange={(e) => handleTechnicalChange('camara', 'altavoz_incorporado', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    Altavoz / Sirena
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.slot_sd)}
                      onChange={(e) => handleTechnicalChange('camara', 'slot_sd', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Database className="h-4 w-4 text-amber-600" />
                    Ranura MicroSD (Slot SD)
                  </label>
                </div>
              </div>
            )}

            {formData.tipo_dispositivo === 'NVR' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" />
                  Parámetros Técnicos de Grabador NVR
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Canales de Video
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.canales_video || 8}
                      onChange={(e) => handleTechnicalChange('nvr', 'canales_video', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Bahías HDD
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.bahias_hdd || 1}
                      onChange={(e) => handleTechnicalChange('nvr', 'bahias_hdd', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Canales PoE Integrados
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.canales_poe || 0}
                      onChange={(e) => handleTechnicalChange('nvr', 'canales_poe', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución Máx. Grabación
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.resolucion_max_grabacion || '4K / 8MP'}
                      onChange={(e) => handleTechnicalChange('nvr', 'resolucion_max_grabacion', e.target.value)}
                      placeholder="ej. 4K, 8MP, 12MP"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Ancho de Banda Entrante (Mbps)
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.ancho_banda_entrada_mbps || '80 Mbps'}
                      onChange={(e) => handleTechnicalChange('nvr', 'ancho_banda_entrada_mbps', e.target.value)}
                      placeholder="ej. 80 Mbps, 160 Mbps"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Salidas de Video
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.salidas_video || '1x HDMI, 1x VGA'}
                      onChange={(e) => handleTechnicalChange('nvr', 'salidas_video', e.target.value)}
                      placeholder="ej. 1x HDMI 4K, 1x VGA"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.tipo_dispositivo === 'SWITCH' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <Network className="h-4 w-4" />
                  Parámetros Técnicos de Switch PoE
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Puertos PoE
                    </label>
                    <input
                      type="number"
                      value={switchSpecs.puertos_poe || 8}
                      onChange={(e) => handleTechnicalChange('switch', 'puertos_poe', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Presupuesto PoE Total (Watts)
                    </label>
                    <input
                      type="number"
                      value={switchSpecs.poe_budget_watts || 120}
                      onChange={(e) => handleTechnicalChange('switch', 'poe_budget_watts', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Puertos Uplink
                    </label>
                    <input
                      type="text"
                      value={switchSpecs.puertos_uplink || '2x Gigabit'}
                      onChange={(e) => handleTechnicalChange('switch', 'puertos_uplink', e.target.value)}
                      placeholder="ej. 2x Gigabit RJ45, 2x SFP"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(switchSpecs.modo_extendido_250m)}
                      onChange={(e) => handleTechnicalChange('switch', 'modo_extendido_250m', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <span>Soporta Modo Extendido (250m a 10Mbps)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BADGES Y TECNOLOGÍAS */}
        {activeTab === 'badges' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Selecciona las tecnologías y distintivos destacados para este modelo:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_BADGES.map((b) => {
                const isActive = (formData.badges_detectados || []).includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => handleToggleBadge(b.id)}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all flex items-start gap-3 ${
                      isActive
                        ? 'border-tiandy-600 bg-tiandy-50/60 dark:bg-tiandy-950/40 dark:border-tiandy-700 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive ? 'bg-tiandy-700 text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{b.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {b.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer de Acciones del Formulario */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400">
            {formData.precio_usd ? `Precio fijado: ${formatCurrency(formData.precio_usd)}` : 'Sin precio fijado'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-tiandy-700 hover:bg-tiandy-600 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-tiandy-700/20 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
