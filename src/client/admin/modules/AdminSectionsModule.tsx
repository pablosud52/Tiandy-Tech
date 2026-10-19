import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Cctv, 
  HardDrive, 
  Network, 
  Wrench, 
  BookOpen, 
  Calculator, 
  Sliders, 
  Check, 
  Loader2, 
  BatteryCharging, 
  Database,
  ArrowLeftRight
} from 'lucide-react';
import { SeccionesWebConfig, Producto } from '../../../shared/types.js';

interface AdminSectionsModuleProps {
  productos?: Producto[];
  onRefresh?: () => void;
}

export const AdminSectionsModule: React.FC<AdminSectionsModuleProps> = ({ productos = [], onRefresh }) => {
  const [secciones, setSecciones] = useState<SeccionesWebConfig>({
    CAMARA: true,
    NVR: true,
    SWITCH: true,
    ACCESORIO: true,
    WIKI: true,
    COMPARADOR: true,
    COTIZADOR: true,
    HERRAMIENTAS: true,
    HERRAMIENTAS_UPS: true,
    HERRAMIENTAS_ALMACENAMIENTO: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSecciones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/configuracion/secciones?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.secciones) {
        setSecciones((prev) => ({ ...prev, ...data.secciones }));
      }
    } catch (err: any) {
      showToast(`Error al cargar secciones: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecciones();
  }, []);

  const handleToggle = async (key: keyof SeccionesWebConfig) => {
    const nuevoValor = !secciones[key];
    const updated = { ...secciones, [key]: nuevoValor };
    setSecciones(updated);
    setIsSaving(true);
    try {
      const res = await fetch('/api/configuracion/secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: nuevoValor })
      });
      if (res.ok) {
        const labels: Record<string, string> = {
          CAMARA: 'Cámaras IP',
          NVR: 'Grabadores NVR',
          SWITCH: 'Switches PoE',
          ACCESORIO: 'Accesorios',
          WIKI: 'Wiki Técnica',
          COMPARADOR: 'Comparador Cara a Cara',
          COTIZADOR: 'Cotizador de Presupuestos',
          HERRAMIENTAS: 'Sección Herramientas',
          HERRAMIENTAS_UPS: 'Calculadora UPS',
          HERRAMIENTAS_ALMACENAMIENTO: 'Calculadora Almacenamiento HDD'
        };
        showToast(`${labels[key] || key} ${nuevoValor ? 'visible' : 'oculto'} en la web pública`);
        try {
          const bc = new BroadcastChannel('tiandy_sync');
          bc.postMessage({ type: 'REFRESH_ALL' });
          bc.close();
        } catch {}
        onRefresh?.();
      }
    } catch (err: any) {
      showToast(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Conteos
  const counts = {
    camaras: productos.filter((p) => p.tipo_dispositivo === 'CAMARA').length,
    nvrs: productos.filter((p) => p.tipo_dispositivo === 'NVR').length,
    switches: productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length,
    accesorios: productos.filter((p) => p.tipo_dispositivo === 'ACCESORIO').length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header del Módulo */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 mb-1">
              <Sliders className="h-4 w-4" />
              Gestión Integral de Navegación
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Visibilidad de Secciones en la Web Pública
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Controla de forma independiente qué pestañas, herramientas técnicas y categorías de productos ven tus clientes e instaladores en el catálogo.
            </p>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando en tiempo real...</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Categorías Principales de Productos */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-600" />
            Categorías de Equipos en Catálogo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Oculta o muestra familias completas de hardware sin borrar su contenido de la base de datos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cámaras IP */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.CAMARA
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.CAMARA ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <Cctv className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cámaras IP</h4>
                  <div className="text-[10px] text-slate-500 font-mono">{counts.camaras} modelos en base</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Bullet, Turret, Domos fijos, PTZs y cámaras panorámicas 180°.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.CAMARA ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.CAMARA ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.CAMARA ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('CAMARA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.CAMARA
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.CAMARA ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Grabadores NVR */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.NVR
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.NVR ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Grabadores NVR</h4>
                  <div className="text-[10px] text-slate-500 font-mono">{counts.nvrs} modelos en base</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Equipos de 4 a 80 canales IP con analíticas IA y bahías SATA.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.NVR ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.NVR ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.NVR ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('NVR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.NVR
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.NVR ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Switches PoE */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.SWITCH
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.SWITCH ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Switches PoE</h4>
                  <div className="text-[10px] text-slate-500 font-mono">{counts.switches} modelos en base</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Switches CCTV Extend 250m, PoE Watchdog y puertos Uplink/SFP.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.SWITCH ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.SWITCH ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.SWITCH ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('SWITCH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.SWITCH
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.SWITCH ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Accesorios */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.ACCESORIO
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.ACCESORIO ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Accesorios</h4>
                  <div className="text-[10px] text-slate-500 font-mono">{counts.accesorios} modelos en base</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Cajas estancas, brazos de pared, anclajes de poste y soportes.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.ACCESORIO ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.ACCESORIO ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.ACCESORIO ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('ACCESORIO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.ACCESORIO
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.ACCESORIO ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Documentación & Base de Conocimientos: Wiki Técnica */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Documentación Técnica & Wiki
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Glosario interactivo de tecnologías Tiandy (ColorMaker, Polar Day, Early Warning y tabla óptica DORI).
          </p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          secciones.WIKI
            ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/80'
            : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${secciones.WIKI ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Botón y Página de Wiki Técnica</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pestaña visible en la barra de navegación del catálogo público</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.WIKI ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400'}`}>
              {secciones.WIKI ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {secciones.WIKI ? 'Visible en Web' : 'Oculto'}
            </span>
            <button
              type="button"
              onClick={() => handleToggle('WIKI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                secciones.WIKI
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {secciones.WIKI ? 'Activa' : 'Activar'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Herramientas Técnicas Individuales */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-4 w-4 text-amber-500" />
            Herramientas Técnicas & Utilidades
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cada herramienta posee su propio control independiente para activarse u ocultarse en la web pública.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Herramienta 1: Comparador Cara a Cara */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.COMPARADOR !== false
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.COMPARADOR !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Comparador Cara a Cara</h4>
                  <div className="text-[10px] text-slate-500">Matriz técnica de hasta 3 productos</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Permite a los usuarios seleccionar hasta 3 equipos y comparar alcance DORI, PoE, IA y óptica en tiempo real.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.COMPARADOR !== false ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.COMPARADOR !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.COMPARADOR !== false ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('COMPARADOR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.COMPARADOR !== false
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.COMPARADOR !== false ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Herramienta 2: Cotizador de Presupuestos */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.COTIZADOR !== false
              ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.COTIZADOR !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cotizador de Presupuestos</h4>
                  <div className="text-[10px] text-slate-500">Cesta y cálculo de presupuesto</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Habilita la barra flotante de cotización y los botones para añadir equipos y calcular el total de lista en USD.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.COTIZADOR !== false ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {secciones.COTIZADOR !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.COTIZADOR !== false ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('COTIZADOR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.COTIZADOR !== false
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.COTIZADOR !== false ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Herramienta 3: Calculadora UPS */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.HERRAMIENTAS_UPS
              ? 'bg-amber-50/50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.HERRAMIENTAS_UPS ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <BatteryCharging className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Calculadora Respaldo UPS</h4>
                  <div className="text-[10px] text-slate-500">Autonomía y consumo eléctrico</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Dimensionamiento de baterías y potencia requerida (Watts) consolidando cámaras, switches y grabadores.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.HERRAMIENTAS_UPS ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
                {secciones.HERRAMIENTAS_UPS ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.HERRAMIENTAS_UPS ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('HERRAMIENTAS_UPS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.HERRAMIENTAS_UPS
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.HERRAMIENTAS_UPS ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Herramienta 4: Calculadora Almacenamiento HDD */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            secciones.HERRAMIENTAS_ALMACENAMIENTO
              ? 'bg-blue-50/50 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800/80'
              : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Calculadora Almacenamiento HDD</h4>
                  <div className="text-[10px] text-slate-500">Estimación de Terabytes con S+265</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Cálculo de días de grabación y capacidad según resolución, FPS y tasa de compresión S+265 de Tiandy.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold flex items-center gap-1 ${secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'}`}>
                {secciones.HERRAMIENTAS_ALMACENAMIENTO ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'Visible en Web' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle('HERRAMIENTAS_ALMACENAMIENTO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  secciones.HERRAMIENTAS_ALMACENAMIENTO
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'Activa' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
