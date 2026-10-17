import React, { useState, useEffect, useRef } from 'react';
import { 
  BadgeGlobalConfig, 
  PosicionSello, 
  CapaSello, 
  AnclajeSello,
  Producto 
} from '../../../shared/types.js';
import { 
  Layers, 
  Upload, 
  RotateCcw, 
  Check, 
  Loader2, 
  Eye, 
  Sliders, 
  Maximize2, 
  Move, 
  Sparkles, 
  Sun, 
  Moon, 
  Cpu, 
  Volume2, 
  ShieldAlert, 
  Flame, 
  Camera,
  Trash2,
  ImagePlus,
  Compass,
  Tag
} from 'lucide-react';
import { SellosGraficosOverlay } from '../../components/Badges.js';

interface AdminBadgesModuleProps {
  productos?: Producto[];
}

export const AdminBadgesModule: React.FC<AdminBadgesModuleProps> = ({ productos = [] }) => {
  const [badges, setBadges] = useState<BadgeGlobalConfig[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('NUEVO_MODELO');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modoSimulador, setModoSimulador] = useState<'ficha' | 'tabla'>('ficha');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cargar configuración global de etiquetas
  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/configuracion/badges?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.badges) {
        setBadges(data.badges);
        if (data.badges.length > 0 && !data.badges.find((b: any) => b.id === selectedBadgeId)) {
          setSelectedBadgeId(data.badges[0].id);
        }
      }
    } catch (err: any) {
      showToast(`Error al cargar etiquetas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  // Guardar configuración global
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/configuracion/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badges)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Configuración global de etiquetas guardada exitosamente.');
        try {
          localStorage.setItem('tiandy_global_badges', JSON.stringify(badges));
          const bc = new BroadcastChannel('tiandy_sync');
          bc.postMessage({ type: 'REFRESH_ALL' });
          bc.close();
        } catch {}
      } else {
        showToast(`Error: ${data.error || 'No se pudo guardar'}`);
      }
    } catch (err: any) {
      showToast(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBadge = badges.find((b) => b.id === selectedBadgeId) || badges[0];

  const updateSelectedBadge = (updates: Partial<BadgeGlobalConfig>) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === selectedBadgeId ? { ...b, ...updates } : b))
    );
  };

  // Subir imagen personalizada para la etiqueta seleccionada
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.imageUrl;
      if (data.success && uploadedUrl) {
        updateSelectedBadge({ imagen_url: uploadedUrl, es_sello_grafico: true });
        showToast(`Imagen asignada a ${selectedBadge.nombre}`);
      } else {
        showToast(`Error al subir: ${data.error || 'Formato inválido'}`);
      }
    } catch (err: any) {
      showToast(`Error de subida: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Quitar imagen para convertir a etiqueta puramente textual
  const handleRemoveImage = () => {
    updateSelectedBadge({ imagen_url: '', es_sello_grafico: false });
    showToast(`Se quitó la imagen de ${selectedBadge.nombre}. Ahora funciona como distintivo textual.`);
  };

  // Restaurar imagen oficial predeterminada
  const handleRestoreOfficial = () => {
    const defaultsMap: Record<string, string> = {
      NUEVO_MODELO: '/data/badges/nuevo-modelo.png',
      COLORMAKER: '/data/badges/colormaker.png',
      POLAR_DAY: '/data/badges/polarday.png',
      SMD_1: '/data/badges/smd-1.svg',
      SMD_2: '/data/badges/smd-2.svg',
      SMD_3: '/data/badges/smd-3.svg',
      VCA: '/data/badges/vca.svg'
    };
    const official = defaultsMap[selectedBadge.id] || '';
    if (official) {
      updateSelectedBadge({ imagen_url: official, es_sello_grafico: true });
      showToast(`Sello oficial restaurado para ${selectedBadge.nombre}`);
    } else {
      showToast(`No hay sello oficial predeterminado para ${selectedBadge.nombre}`);
    }
  };

  // Posiciones disponibles con etiquetas legibles
  const posiciones: { id: PosicionSello; label: string; icon: string }[] = [
    { id: 'top-left', label: 'Arriba Izq.', icon: '↖' },
    { id: 'top-right', label: 'Arriba Der.', icon: '↗' },
    { id: 'bottom-left', label: 'Abajo Izq.', icon: '↙' },
    { id: 'bottom-center', label: 'Abajo Centro', icon: '↓' },
    { id: 'bottom-right', label: 'Abajo Der.', icon: '↘' },
    { id: 'center', label: 'Centro', icon: '•' }
  ];

  // Tamaños predeterminados para selección rápida (hasta 200%)
  const tamanoPresets = [
    { valor: 70, label: '70% Compacto' },
    { valor: 100, label: '100% Estándar' },
    { valor: 130, label: '130% Destacado' },
    { valor: 160, label: '160% Grande' },
    { valor: 200, label: '200% Máximo' }
  ];

  // Producto de muestra para el simulador
  const productoMuestra = productos.find((p) => p.imagen_principal && p.tipo_dispositivo === 'CAMARA') || productos[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header del Gestor de Etiquetas */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Biblioteca Global de Etiquetas
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">Cargando biblioteca de etiquetas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA 1: Listado de Etiquetas (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center justify-between">
              <span>Catálogo de Etiquetas ({badges.length})</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Global</span>
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {badges.map((b) => {
                const isSelected = b.id === selectedBadgeId;
                const tieneImagen = Boolean(b.imagen_url && b.imagen_url.trim() !== '');

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(b.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20 translate-x-1'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Miniatura o icono */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1 ${
                        isSelected ? 'bg-white/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {tieneImagen ? (
                          <img src={b.imagen_url} alt={b.nombre} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Tag className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">{b.nombre}</div>
                        <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {tieneImagen ? `Sello gráfico (${b.tamano || 100}%)` : 'Distintivo de texto'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/25 text-white' 
                          : (b.activo_global ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500')
                      }`}>
                        {b.activo_global ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMNA 2: Parámetros de la Etiqueta Seleccionada (5 cols) */}
          {selectedBadge && (
            <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Header de la Etiqueta */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                    ID: {selectedBadge.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedBadge.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {selectedBadge.descripcion || 'Configuración geométrica y visual aplicada a todos los productos con esta etiqueta activa.'}
                  </p>
                </div>

                {/* Switch Activo Global */}
                <button
                  type="button"
                  onClick={() => updateSelectedBadge({ activo_global: !selectedBadge.activo_global })}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedBadge.activo_global
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {selectedBadge.activo_global ? '✓ Habilitada' : '✕ Deshabilitada'}
                </button>
              </div>

              {/* 1. Imagen / Sello Gráfico vs Distintivo Textual */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-emerald-600" />
                    Imagen y Gráfico del Sello
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {selectedBadge.imagen_url ? 'Sello gráfico activo' : 'Distintivo de texto puro'}
                  </span>
                </div>

                {selectedBadge.imagen_url ? (
                  /* Modo Sello Gráfico con Imagen */
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={selectedBadge.imagen_url}
                        alt={selectedBadge.nombre}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                        >
                          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          <span>Cambiar Imagen</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
                          title="Eliminar imagen y dejar como etiqueta puramente textual"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Quitar Imagen</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRestoreOfficial}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                          title="Restaurar vector original"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Oficial</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        PNG transparente o vector SVG que se superpondrá sobre la foto del producto.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Modo Etiqueta Textual sin Imagen */
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Etiqueta en formato texto
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Sin imagen superpuesta. Se muestra como distintivo de texto en la ficha del producto.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                        <span>+ Asignar Imagen</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={handleRestoreOfficial}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                        title="Restaurar vector original"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Oficial</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Ubicación / Posición en la Foto */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Move className="h-4 w-4 text-emerald-600" />
                    Ubicación en la Foto del Producto
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {posiciones.find(p => p.id === selectedBadge.posicion)?.label || selectedBadge.posicion}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {posiciones.map((pos) => {
                    const isCurrent = selectedBadge.posicion === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateSelectedBadge({ posicion: pos.id })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="text-sm font-mono">{pos.icon}</span>
                        <span>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Control de Anclaje de Escala (Esquina vs Centro) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-emerald-600" />
                    Anclaje de Escala (Reducción y Expansión)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedBadge.anclaje === 'centro' ? 'Centrado' : 'Pegado a la Esquina / Borde'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSelectedBadge({ anclaje: 'esquina' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all text-left ${
                      (selectedBadge.anclaje || 'esquina') === 'esquina'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>↖ Anclado al Borde / Esquina</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 leading-tight">
                      Al achicar el tamaño, se mantiene pegado a la orilla sin invadir ni tapar el producto.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSelectedBadge({ anclaje: 'centro' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all text-left ${
                      selectedBadge.anclaje === 'centro'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>• Centrado en el Sector</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-80 leading-tight">
                      Reduce o amplía el tamaño de forma equidistante desde el centro de la zona.
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. Escala y Tamaño */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4 text-emerald-600" />
                    Tamaño del Sello ({selectedBadge.tamano || 100}%)
                  </span>
                  <span className="text-[10px] text-slate-400">Escala uniforme en tarjeta y tabla</span>
                </div>

                {/* Slider interactivo con entrada numérica hasta 200% */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={selectedBadge.tamano || 100}
                    onChange={(e) => updateSelectedBadge({ tamano: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="50"
                      max="200"
                      step="5"
                      value={selectedBadge.tamano || 100}
                      onChange={(e) => {
                        const val = Math.min(200, Math.max(50, parseInt(e.target.value, 10) || 100));
                        updateSelectedBadge({ tamano: val });
                      }}
                      className="w-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono font-bold text-center text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Presets rápidos de tamaño */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tamanoPresets.map((preset) => {
                    const isCurrent = (selectedBadge.tamano || 100) === preset.valor;
                    return (
                      <button
                        key={preset.valor}
                        type="button"
                        onClick={() => updateSelectedBadge({ tamano: preset.valor })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Control de Transparencia (Tope 50%) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-emerald-600" />
                    Transparencia del Sello ({Math.round((1 - (selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1)) * 100)}%)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tope máx. 50% ({Math.round((selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1) * 100)}% opacidad)
                  </span>
                </div>

                {/* Slider interactivo limitado a máximo 50% de transparencia */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={Math.round((1 - (selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1)) * 100)}
                    onChange={(e) => {
                      const transp = Math.min(50, Math.max(0, parseInt(e.target.value, 10) || 0));
                      const newOpacidad = Number(((100 - transp) / 100).toFixed(2));
                      updateSelectedBadge({ opacidad: newOpacidad });
                    }}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="5"
                      value={Math.round((1 - (selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1)) * 100)}
                      onChange={(e) => {
                        const transp = Math.min(50, Math.max(0, parseInt(e.target.value, 10) || 0));
                        const newOpacidad = Number(((100 - transp) / 100).toFixed(2));
                        updateSelectedBadge({ opacidad: newOpacidad });
                      }}
                      className="w-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono font-bold text-center text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Presets rápidos de transparencia */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { valor: 0, label: '0% Sólido (100% Opaco)' },
                    { valor: 15, label: '15% Translúcido' },
                    { valor: 30, label: '30% Translúcido' },
                    { valor: 50, label: '50% Máx. Permitido' }
                  ].map((preset) => {
                    const currentTransp = Math.round((1 - (selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1)) * 100);
                    const isCurrent = currentTransp === preset.valor;
                    return (
                      <button
                        key={preset.valor}
                        type="button"
                        onClick={() => {
                          const newOpacidad = Number(((100 - preset.valor) / 100).toFixed(2));
                          updateSelectedBadge({ opacidad: newOpacidad });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Capa: Delante o Detrás */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    Capa en la Fotografía
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedBadge.capa === 'back' ? 'Detrás (Fondo decorativo)' : 'Delante (Superpuesto)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSelectedBadge({ capa: 'front' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedBadge.capa === 'front'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <span>🛡️ Delante del producto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSelectedBadge({ capa: 'back' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedBadge.capa === 'back'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <span>🖼️ Detrás (Fondo)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COLUMNA 3: Previsualización en Vivo Realista (Ficha vs Tabla) con Guardado Integrado (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-600" />
                Simulador en Vivo
              </div>

              {/* Selector de Modalidad Ficha vs Tabla */}
              <div className="flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setModoSimulador('ficha')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    modoSimulador === 'ficha'
                      ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Ficha
                </button>
                <button
                  type="button"
                  onClick={() => setModoSimulador('tabla')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    modoSimulador === 'tabla'
                      ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {modoSimulador === 'ficha'
                ? 'Simulación idéntica a la tarjeta en Modo Ficha (proporción rectangular 16:10 con escala estándar).'
                : 'Simulación idéntica a la fila en Modo Tabla (contenedor cuadrado de 112×112px con escala compacta).'}
            </p>

            {/* Simulación según modalidad seleccionada */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 shadow-inner">
              {modoSimulador === 'ficha' ? (
                /* 1. MOCKUP MODO FICHA (Tarjeta aspect-[16/10] idéntica a ProductCard) */
                <div>
                  <div className="relative aspect-[16/10] bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-4 overflow-hidden shadow-sm">
                    {/* Sello simulado detrás */}
                    {selectedBadge.imagen_url && selectedBadge.capa === 'back' && (
                      <SellosGraficosOverlay
                        sellos={[{
                          id: selectedBadge.id,
                          nombre: selectedBadge.nombre,
                          activo: true,
                          imagen_url: selectedBadge.imagen_url,
                          posicion: selectedBadge.posicion,
                          capa: 'back',
                          tamano: selectedBadge.tamano || 100,
                          anclaje: selectedBadge.anclaje || 'esquina',
                          opacidad: selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1
                        }]}
                        capaFiltro="back"
                        tamano="normal"
                      />
                    )}

                    {/* Imagen del producto muestra */}
                    {productoMuestra?.imagen_principal ? (
                      <img
                        src={productoMuestra.imagen_principal}
                        alt="Modelo Demo"
                        className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm"
                      />
                    ) : (
                      <div className="relative z-10 text-slate-400 text-xs font-mono">
                        Cámara Tiandy
                      </div>
                    )}

                    {/* Sello simulado delante */}
                    {selectedBadge.imagen_url && selectedBadge.capa !== 'back' && (
                      <SellosGraficosOverlay
                        sellos={[{
                          id: selectedBadge.id,
                          nombre: selectedBadge.nombre,
                          activo: true,
                          imagen_url: selectedBadge.imagen_url,
                          posicion: selectedBadge.posicion,
                          capa: 'front',
                          tamano: selectedBadge.tamano || 100,
                          anclaje: selectedBadge.anclaje || 'esquina',
                          opacidad: selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1
                        }]}
                        capaFiltro="front"
                        tamano="normal"
                      />
                    )}

                    {/* Distintivo funcional si no tiene imagen gráfica */}
                    {!selectedBadge.imagen_url && (
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider rounded bg-tiandy-700 text-white shadow-sm border border-white/20">
                          {selectedBadge.nombre.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 text-center">
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {productoMuestra?.modelo || 'TC-C320N Demo'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Modo Ficha · aspect 16:10 · escala normal ({selectedBadge.tamano || 100}%)
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. MOCKUP MODO TABLA (Caja cuadrada 112×112px idéntica a ProductTable) */
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden p-1.5 relative shadow-sm">
                    {/* Sello simulado detrás */}
                    {selectedBadge.imagen_url && selectedBadge.capa === 'back' && (
                      <SellosGraficosOverlay
                        sellos={[{
                          id: selectedBadge.id,
                          nombre: selectedBadge.nombre,
                          activo: true,
                          imagen_url: selectedBadge.imagen_url,
                          posicion: selectedBadge.posicion,
                          capa: 'back',
                          tamano: selectedBadge.tamano || 100,
                          anclaje: selectedBadge.anclaje || 'esquina',
                          opacidad: selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1
                        }]}
                        capaFiltro="back"
                        tamano="compact"
                      />
                    )}

                    {/* Imagen principal */}
                    {productoMuestra?.imagen_principal ? (
                      <img
                        src={productoMuestra.imagen_principal}
                        alt="Modelo Demo"
                        className="relative z-10 max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="relative z-10 text-slate-400 text-xs font-mono">
                        Cámara Tiandy
                      </div>
                    )}

                    {/* Sello simulado delante */}
                    {selectedBadge.imagen_url && selectedBadge.capa !== 'back' && (
                      <SellosGraficosOverlay
                        sellos={[{
                          id: selectedBadge.id,
                          nombre: selectedBadge.nombre,
                          activo: true,
                          imagen_url: selectedBadge.imagen_url,
                          posicion: selectedBadge.posicion,
                          capa: 'front',
                          tamano: selectedBadge.tamano || 100,
                          anclaje: selectedBadge.anclaje || 'esquina',
                          opacidad: selectedBadge.opacidad !== undefined ? selectedBadge.opacidad : 1
                        }]}
                        capaFiltro="front"
                        tamano="compact"
                      />
                    )}

                    {!selectedBadge.imagen_url && (
                      <div className="absolute top-1.5 right-1.5 z-20">
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider rounded bg-tiandy-700 text-white shadow-sm border border-white/20">
                          {selectedBadge.nombre.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 text-center">
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {productoMuestra?.modelo || 'TC-C320N Demo'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Modo Tabla · 112×112px · escala compacta ({selectedBadge.tamano || 100}%)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN DE GUARDADO GLOBAL INTEGRADO */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>{isSaving ? 'Guardando configuración...' : 'Guardar Configuración Global'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
