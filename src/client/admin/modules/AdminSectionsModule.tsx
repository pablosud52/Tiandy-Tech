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
  Database 
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
          WIKI: 'Botón Wiki Técnica',
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

      {/* 2. Sección Wiki y Herramientas Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Botón Wiki Técnica */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${secciones.WIKI ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-slate-100 text-slate-400'}`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Botón Wiki Técnica</h3>
                <p className="text-[11px] text-slate-500">Pestaña en barra de navegación pública</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('WIKI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                secciones.WIKI
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {secciones.WIKI ? 'Visible' : 'Ocultar'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Habilita el acceso directo al manual de conceptos Tiandy (explicación de ColorMaker, Polar Day, Early Warning y tabla DORI).
          </p>
        </div>

        {/* Sección Nueva: Herramientas Técnicas */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${secciones.HERRAMIENTAS ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-slate-100 text-slate-400'}`}>
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sección Herramientas Técnicas</h3>
                <p className="text-[11px] text-slate-500">Utilidades de cálculo para instaladores</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('HERRAMIENTAS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                secciones.HERRAMIENTAS
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {secciones.HERRAMIENTAS ? 'Visible' : 'Ocultar'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Muestra una sección dedicada a calculadoras de ingeniería para presupuestos de instalación.
          </p>

          {/* Sub-herramientas */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400">Módulos de la sección Herramientas:</div>
            
            {/* Calculadora UPS */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BatteryCharging className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Calculadora de Autonomía UPS</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('HERRAMIENTAS_UPS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  secciones.HERRAMIENTAS_UPS ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                }`}
              >
                {secciones.HERRAMIENTAS_UPS ? 'Habilitada' : 'Deshabilitada'}
              </button>
            </div>

            {/* Calculadora Almacenamiento */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Calculadora de Almacenamiento HDD</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('HERRAMIENTAS_ALMACENAMIENTO')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                }`}
              >
                {secciones.HERRAMIENTAS_ALMACENAMIENTO ? 'Habilitada' : 'Deshabilitada'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
