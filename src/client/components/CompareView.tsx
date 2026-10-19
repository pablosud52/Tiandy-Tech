import React, { useState, useMemo } from 'react';
import { Producto, TipoDispositivo } from '../../shared/types.js';
import { formatCurrency, parseModelAndSpec } from '../../shared/helpers.js';
import { 
  X, Plus, ArrowLeft, ArrowLeftRight, Trash2, SlidersHorizontal, 
  Layers, Search, CheckCircle2, AlertCircle, Eye, Calculator
} from 'lucide-react';

interface CompareViewProps {
  productos: Producto[];
  allProductos: Producto[];
  onRemove: (id: any) => void;
  onClear: () => void;
  onAddProduct: (producto: Producto) => void;
  onBackToCatalog: () => void;
  onOpenProductDetail: (producto: Producto) => void;
  onAddToCotizacion?: (producto: Producto, cantidad: number) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  productos,
  allProductos,
  onRemove,
  onClear,
  onAddProduct,
  onBackToCatalog,
  onOpenProductDetail,
  onAddToCotizacion
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<TipoDispositivo>('CAMARA');

  // Determinar la categoría activa de la comparativa
  const activeCategory: TipoDispositivo | null = useMemo(() => {
    if (productos.length > 0) {
      return productos[0].tipo_dispositivo;
    }
    return selectedCategoryTab;
  }, [productos, selectedCategoryTab]);

  // Filtrar productos disponibles para añadir (estrictamente de la misma categoría y no agregados aún)
  const availableToAdd = useMemo(() => {
    if (!activeCategory) return [];
    return allProductos.filter((p) => {
      if (p.tipo_dispositivo !== activeCategory) return false;
      if (productos.some((cp) => cp.id === p.id)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.modelo.toLowerCase().includes(q) ||
        (p.especificacion_completa && p.especificacion_completa.toLowerCase().includes(q)) ||
        (p.serie && p.serie.toLowerCase().includes(q)) ||
        (p.subtipo && p.subtipo.toLowerCase().includes(q))
      );
    });
  }, [allProductos, activeCategory, productos, searchQuery]);

  // Lista de atributos principales homologados según la categoría
  const caracteristicasPrincipalesLabels: Array<{ key: string; label: string }> = useMemo(() => {
    if (activeCategory === 'CAMARA') {
      return [
        { key: 'formato', label: 'Formato' },
        { key: 'carcasa', label: 'Carcasa' },
        { key: 'resolucion', label: 'Resolución' },
        { key: 'sensor', label: 'Sensor' },
        { key: 'min_iluminacion', label: 'Min. Iluminación' },
        { key: 'vision_nocturna', label: 'Visión Nocturna' },
        { key: 'dori', label: 'DORI (Distancias)' },
        { key: 'almacenamiento', label: 'Almacenamiento' },
        { key: 'compresion_video', label: 'Compresión de video' },
        { key: 'smd', label: 'SMD' },
        { key: 'vca', label: 'VCA (Analíticas)' },
        { key: 'alimentacion', label: 'Alimentación' },
        { key: 'salidas_alarma', label: 'Salidas Alarma' }
      ];
    } else if (activeCategory === 'NVR') {
      return [
        { key: 'canales_ip', label: 'Canales IP' },
        { key: 'ancho_banda', label: 'Ancho de Banda (In/Out)' },
        { key: 'bahias_sata', label: 'Bahías SATA' },
        { key: 'capacidad_max', label: 'Capacidad Máxima' },
        { key: 'puertos_poe', label: 'Puertos PoE Integrados' },
        { key: 'salidas_video', label: 'Salidas de Video' },
        { key: 'decodificacion', label: 'Decodificación' },
        { key: 'compresion', label: 'Compresión' },
        { key: 'ia_soportada', label: 'IA Soportada' },
        { key: 'alimentacion', label: 'Alimentación' }
      ];
    } else {
      return [
        { key: 'puertos_poe', label: 'Puertos PoE' },
        { key: 'velocidad_poe', label: 'Velocidad PoE' },
        { key: 'puertos_uplink', label: 'Puertos Uplink RJ45' },
        { key: 'puertos_sfp', label: 'Puertos SFP Fibra' },
        { key: 'presupuesto_watts', label: 'Presupuesto Watts (PoE Budget)' },
        { key: 'estandar_poe', label: 'Estándar PoE' },
        { key: 'modo_extend', label: 'Modo CCTV Extend 250m' },
        { key: 'poe_watchdog', label: 'PoE Watchdog' },
        { key: 'alimentacion', label: 'Alimentación' }
      ];
    }
  }, [activeCategory]);

  // Obtener valor formateado de características principales para un producto
  const getCpValue = (prod: Producto, key: string): string => {
    const dt: any = prod.datos_tecnicos || {};
    const cp = dt.caracteristicas_principales || {};

    if (key === 'dori') {
      const dori = cp.dori;
      if (!dori && !dt.camara?.dori_metros?.detectar) return '-';
      const det = dori?.detecta || (dt.camara?.dori_metros?.detectar ? `${dt.camara.dori_metros.detectar}m` : '-');
      const obs = dori?.observa || (dt.camara?.dori_metros?.observar ? `${dt.camara.dori_metros.observar}m` : '-');
      const rec = dori?.reconoce || (dt.camara?.dori_metros?.reconocer ? `${dt.camara.dori_metros.reconocer}m` : '-');
      const ide = dori?.identifica || (dt.camara?.dori_metros?.identificar ? `${dt.camara.dori_metros.identificar}m` : '-');
      return `Det: ${det} | Obs: ${obs} | Rec: ${rec} | Id: ${ide}`;
    }

    if (cp && cp[key] !== undefined && cp[key] !== null && String(cp[key]).trim() !== '') {
      return String(cp[key]);
    }

    // Fallbacks si no viniera en cp
    if (key === 'formato') return dt.camara?.formato || '-';
    if (key === 'carcasa') return dt.camara?.carcasa || 'Metal';
    if (key === 'resolucion') return dt.camara?.resolucion_mp || '-';
    if (key === 'sensor') return dt.camara?.sensor_imagen || '-';
    if (key === 'min_iluminacion') return dt.camara?.iluminacion_minima_color || '-';
    if (key === 'vision_nocturna') return dt.camara?.alcance_ir_metros ? `IR ${dt.camara.alcance_ir_metros}m` : '-';
    if (key === 'almacenamiento') return dt.camara?.interfaces?.ranura_sd || (dt.camara?.slot_sd ? 'MicroSD' : '-');
    if (key === 'compresion_video') return dt.camara?.codecs_video || '-';
    if (key === 'smd') return '-';
    if (key === 'vca') return dt.camara?.analiticas_ia?.clasificacion_objetos?.join(', ') || '-';
    if (key === 'alimentacion') return dt.camara?.alimentacion?.tipo || dt.nvr?.alimentacion || dt.switch?.tipo_fuente || '-';
    if (key === 'salidas_alarma') return dt.camara?.interfaces?.salida_alarma || '-';
    if (key === 'canales_ip') return dt.nvr?.canales_ip ? `${dt.nvr.canales_ip} canales` : '-';
    if (key === 'ancho_banda') return dt.nvr?.ancho_banda_ingreso_mbps ? `${dt.nvr.ancho_banda_ingreso_mbps}Mbps` : '-';
    if (key === 'bahias_sata') return dt.nvr?.bahias_sata ? `${dt.nvr.bahias_sata}x SATA` : '-';
    if (key === 'capacidad_max') return dt.nvr?.capacidad_max_por_disco_tb ? `${dt.nvr.capacidad_max_por_disco_tb}TB` : '-';
    if (key === 'puertos_poe') return dt.nvr?.puertos_poe_integrados ? `${dt.nvr.puertos_poe_integrados} PoE` : dt.switch?.puertos_poe_totales ? `${dt.switch.puertos_poe_totales} PoE` : '-';
    if (key === 'salidas_video') return dt.nvr?.salidas_video ? dt.nvr.salidas_video.join(' / ') : '-';
    if (key === 'decodificacion') return dt.nvr?.decodificacion_simultanea || '-';
    if (key === 'compresion') return dt.nvr?.compresion || '-';
    if (key === 'ia_soportada') return dt.nvr?.ia_propia_nvr?.join(', ') || '-';
    if (key === 'velocidad_poe') return dt.switch?.velocidad_puertos_poe || '-';
    if (key === 'puertos_uplink') return dt.switch?.puertos_uplink_rj45 ? `${dt.switch.puertos_uplink_rj45}x Uplink` : '-';
    if (key === 'puertos_sfp') return dt.switch?.puertos_sfp_fibra ? `${dt.switch.puertos_sfp_fibra}x SFP` : '-';
    if (key === 'presupuesto_watts') return dt.switch?.presupuesto_poe_watts ? `${dt.switch.presupuesto_poe_watts}W` : '-';
    if (key === 'estandar_poe') return dt.switch?.estandar_poe?.join(' / ') || '-';
    if (key === 'modo_extend') return dt.switch?.modo_extend_cctv_250m ? 'Soporta 250m' : '-';
    if (key === 'poe_watchdog') return dt.switch?.poe_watchdog ? 'Sí' : '-';

    return '-';
  };

  // Construir mapa de todas las categorías y atributos únicos de los datasheets
  const fullDatasheetCategories = useMemo(() => {
    const catMap: Record<string, Set<string>> = {};

    for (const prod of productos) {
      const dt: any = prod.datos_tecnicos || {};
      const specs: Record<string, Record<string, string | null>> = dt.especificaciones_datasheet || {};

      for (const [catName, attrs] of Object.entries(specs)) {
        if (!catMap[catName]) catMap[catName] = new Set<string>();
        for (const attrKey of Object.keys(attrs)) {
          catMap[catName].add(attrKey);
        }
      }
    }

    const result: Array<{ category: string; attributes: string[] }> = [];
    for (const [category, attrSet] of Object.entries(catMap)) {
      result.push({
        category,
        attributes: Array.from(attrSet).sort()
      });
    }

    return result;
  }, [productos]);

  // Función para obtener valor de una categoría/atributo de datasheet
  const getDatasheetValue = (prod: Producto, category: string, attribute: string): string => {
    const dt: any = prod.datos_tecnicos || {};
    const specs: Record<string, Record<string, string | null>> = dt.especificaciones_datasheet || {};
    const catObj = specs[category];
    if (!catObj) return '-';
    const val = catObj[attribute];
    return val && String(val).trim() ? String(val).trim() : '-';
  };

  // Determinar si una fila tiene valores diferentes entre productos
  const isRowDifferent = (values: string[]): boolean => {
    if (values.length <= 1) return false;
    const first = values[0].toLowerCase().trim();
    return values.some((v) => v.toLowerCase().trim() !== first);
  };

  const maxSlots = 4;
  const emptySlotsCount = Math.max(0, maxSlots - productos.length);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Barra Superior de Control y Navegación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCatalog}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Catálogo
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Comparativa Técnica Oficial
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Comparativa {activeCategory === 'CAMARA' ? 'de Cámaras IP' : activeCategory === 'NVR' ? 'de NVRs / Grabadores' : 'de Switches PoE'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Análisis parámetro por parámetro extraído directamente de los datasheets oficiales de Tiandy.
          </p>
        </div>

        {/* Controles de Vista */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Interruptor de Resaltar Diferencias */}
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              highlightDifferences
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${highlightDifferences ? 'bg-amber-500' : 'bg-slate-400'}`} />
            Resaltar diferencias
          </button>

          {/* Interruptor de Ocultar Idénticos */}
          <button
            onClick={() => setOnlyDifferences(!onlyDifferences)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              onlyDifferences
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Solo diferencias
          </button>

          {/* Limpiar */}
          {productos.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Categoría Estricta */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
        <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          <strong>Regla de homogeneidad técnica:</strong> La comparativa solo permite contrastar dispositivos de la misma categoría ({activeCategory === 'CAMARA' ? 'Cámaras con Cámaras' : activeCategory === 'NVR' ? 'NVRs con NVRs' : 'Switches con Switches'}).
        </span>
      </div>

      {/* ESTADO VACÍO (0 productos) */}
      {productos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <ArrowLeftRight className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              No hay productos en la comparativa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Elige qué categoría deseas comparar para comenzar a agregar hasta 4 equipos en paralelo.
            </p>
          </div>

          {/* Selector de Categoría Inicial */}
          <div className="flex justify-center gap-2">
            {(['CAMARA', 'NVR', 'SWITCH'] as TipoDispositivo[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategoryTab(cat);
                  setIsAddModalOpen(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategoryTab === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'CAMARA' ? 'Comparar Cámaras' : cat === 'NVR' ? 'Comparar NVRs' : 'Comparar Switches'}
              </button>
            ))}
          </div>

          <div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 text-xs font-black shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" />
              Seleccionar Producto para Comparar
            </button>
          </div>
        </div>
      ) : (
        /* TABLA COMPARATIVA ESTILO GSMARENA */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              {/* CABECERA STICKY: FOTOS, MODELOS Y PRECIOS */}
              <thead className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b-2 border-slate-200 dark:border-slate-800">
                <tr>
                  {/* Columna 1: Etiqueta Parámetro */}
                  <th className="p-4 sm:p-5 w-56 sm:w-64 min-w-[200px] border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 align-bottom">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Parámetro Técnico
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      {productos.length} de {maxSlots} equipos
                    </div>
                  </th>

                  {/* Columnas de Productos Comparados */}
                  {productos.map((prod) => {
                    const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);
                    return (
                      <th
                        key={prod.id}
                        className="p-4 sm:p-5 w-72 min-w-[240px] max-w-[320px] border-r border-slate-200 dark:border-slate-800 align-top relative group"
                      >
                        {/* Botón Quitar */}
                        <button
                          onClick={() => onRemove(prod.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Quitar de la comparativa"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Imagen del Producto */}
                        <div className="w-28 h-28 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-2 flex items-center justify-center mb-3">
                          {prod.imagen_principal ? (
                            <img
                              src={prod.imagen_principal}
                              alt={prod.modelo}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {prod.tipo_dispositivo}
                            </span>
                          )}
                        </div>

                        {/* Serie y Badges */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {prod.serie || 'General Series'}
                          </span>
                        </div>

                        {/* Modelo Base y Spec */}
                        <div className="font-mono font-black text-lg text-slate-900 dark:text-white leading-tight">
                          {baseModel}
                        </div>
                        {variantSpec && (
                          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                            {variantSpec}
                          </div>
                        )}

                        {/* Precio Comercial Oficial */}
                        <div className="mt-2 text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(prod.precio_usd)}
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => onOpenProductDetail(prod)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Ficha
                          </button>
                          {onAddToCotizacion && (
                            <button
                              onClick={() => onAddToCotizacion(prod, 1)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-500 transition-colors"
                              title="Añadir 1 unidad a cotización"
                            >
                              <Calculator className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  {/* Ranuras vacías para añadir otro producto */}
                  {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                    <th
                      key={`empty-${idx}`}
                      className="p-6 w-72 min-w-[240px] max-w-[320px] border-r border-slate-200 dark:border-slate-800 align-middle text-center bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full h-full min-h-[180px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 flex flex-col items-center justify-center p-4 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 flex items-center justify-center mb-2 transition-colors">
                          <Plus className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold">Añadir otro equipo</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Misma categoría ({activeCategory === 'CAMARA' ? 'Cámaras' : activeCategory === 'NVR' ? 'NVRs' : 'Switches'})
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* CUERPO DE LA TABLA: CARACTERÍSTICAS Y ESPECIFICACIONES */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* ============================================================== */}
                {/* SECCIÓN 1: CARACTERÍSTICAS PRINCIPALES                         */}
                {/* ============================================================== */}
                <tr className="bg-slate-100/80 dark:bg-slate-800/80">
                  <td
                    colSpan={1 + productos.length + emptySlotsCount}
                    className="p-3.5 px-5 font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Características Principales (Ficha Homologada)
                  </td>
                </tr>

                {caracteristicasPrincipalesLabels.map(({ key, label }) => {
                  const values = productos.map((p) => getCpValue(p, key));
                  const isDiff = isRowDifferent(values);

                  if (onlyDifferences && !isDiff) return null;

                  return (
                    <tr
                      key={`cp-${key}`}
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 ${
                        highlightDifferences && isDiff
                          ? 'bg-amber-50/30 dark:bg-amber-950/15'
                          : ''
                      }`}
                    >
                      {/* Columna Nombre Parámetro */}
                      <td className="p-3.5 sm:px-5 font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                        {label}
                      </td>

                      {/* Columnas de Valores de cada Producto */}
                      {productos.map((prod, pIdx) => {
                        const val = values[pIdx];
                        return (
                          <td
                            key={`cp-val-${prod.id}-${key}`}
                            className={`p-3.5 sm:px-5 border-r border-slate-200 dark:border-slate-800 break-words ${
                              highlightDifferences && isDiff
                                ? 'font-semibold text-slate-950 dark:text-white'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}

                      {/* Celdas para ranuras vacías */}
                      {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                        <td
                          key={`cp-empty-${idx}-${key}`}
                          className="p-3.5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-center text-slate-300 dark:text-slate-700"
                        >
                          -
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* ============================================================== */}
                {/* SECCIÓN 2: ESPECIFICACIONES COMPLETAS DEL DATASHEET POR GRUPO  */}
                {/* ============================================================== */}
                {fullDatasheetCategories.map(({ category, attributes }) => (
                  <React.Fragment key={`cat-${category}`}>
                    <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 border-t-2 border-emerald-200 dark:border-emerald-800/50">
                      <td
                        colSpan={1 + productos.length + emptySlotsCount}
                        className="p-3.5 px-5 font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2"
                      >
                        <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {category}
                      </td>
                    </tr>

                    {attributes.map((attrName) => {
                      const values = productos.map((p) => getDatasheetValue(p, category, attrName));
                      const isDiff = isRowDifferent(values);

                      if (onlyDifferences && !isDiff) return null;

                      return (
                        <tr
                          key={`ds-${category}-${attrName}`}
                          className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 ${
                            highlightDifferences && isDiff
                              ? 'bg-amber-50/30 dark:bg-amber-950/15'
                              : ''
                          }`}
                        >
                          {/* Columna Nombre Atributo */}
                          <td className="p-3 sm:px-5 font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
                            {attrName}
                          </td>

                          {/* Columnas de Valores */}
                          {productos.map((prod, pIdx) => {
                            const val = values[pIdx];
                            return (
                              <td
                                key={`ds-val-${prod.id}-${category}-${attrName}`}
                                className={`p-3 sm:px-5 border-r border-slate-200 dark:border-slate-800 break-words ${
                                  val === '-'
                                    ? 'text-slate-400 dark:text-slate-600 font-mono'
                                    : highlightDifferences && isDiff
                                    ? 'font-semibold text-slate-950 dark:text-white'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}

                          {/* Celdas para ranuras vacías */}
                          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                            <td
                              key={`ds-empty-${idx}-${category}-${attrName}`}
                              className="p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-center text-slate-300 dark:text-slate-700"
                            >
                              -
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE SELECCIÓN DE PRODUCTO PARA AÑADIR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Añadir {activeCategory === 'CAMARA' ? 'Cámara IP' : activeCategory === 'NVR' ? 'NVR' : 'Switch'} a la Comparativa
                </h3>
                <p className="text-xs text-slate-500">
                  Solo se listan equipos de la misma categoría activa.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar modelo o especificación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Lista de Productos Disponibles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron productos disponibles para comparar en esta categoría.
                </div>
              ) : (
                availableToAdd.map((prod) => {
                  const { baseModel, variantSpec } = parseModelAndSpec(prod.modelo, prod.subtipo, prod.especificacion_completa);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => {
                        onAddProduct(prod);
                        setIsAddModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0">
                          {prod.imagen_principal ? (
                            <img
                              src={prod.imagen_principal}
                              alt={prod.modelo}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-mono text-[9px] text-slate-400">IMG</span>
                          )}
                        </div>

                        <div>
                          <div className="font-mono font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {baseModel}
                          </div>
                          {variantSpec && (
                            <div className="text-xs text-slate-500 font-mono">
                              {variantSpec}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              {prod.serie}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {formatCurrency(prod.precio_usd)}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          + Añadir
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
