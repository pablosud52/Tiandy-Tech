import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Settings, 
  Calculator, 
  Cctv, 
  HardDrive, 
  Network, 
  Component, 
  Wrench, 
  ArrowLeftRight, 
  BookOpen, 
  BatteryCharging, 
  Database, 
  ChevronDown 
} from 'lucide-react';
import { TipoDispositivo } from '../../shared/types.js';

interface NavbarProps {
  busqueda: string;
  setBusqueda: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (dm: boolean) => void;
  activeView: 'catalog' | 'wiki' | 'admin' | 'compare' | 'herramientas';
  setActiveView: (view: 'catalog' | 'wiki' | 'admin' | 'compare' | 'herramientas') => void;
  activeCategory: TipoDispositivo;
  onSelectCategory: (cat: TipoDispositivo) => void;
  counts: {
    camaras: number;
    nvrs: number;
    switches: number;
    accesorios?: number;
  };
  compareCount?: number;
  onOpenCotizacion?: () => void;
  totalCotizacionItems?: number;
  seccionesVisibles?: Record<string, boolean>;
}

export const Navbar: React.FC<NavbarProps> = ({
  busqueda,
  setBusqueda,
  darkMode,
  setDarkMode,
  activeView,
  setActiveView,
  activeCategory,
  onSelectCategory,
  counts,
  compareCount = 0,
  onOpenCotizacion,
  totalCotizacionItems = 0,
  seccionesVisibles
}) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setToolsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 200);
  };

  const categoryTabs = [
    {
      id: 'CAMARA' as TipoDispositivo,
      label: 'Cámaras',
      icon: Cctv,
      count: counts.camaras,
      visible: seccionesVisibles ? seccionesVisibles.CAMARA !== false : true
    },
    {
      id: 'NVR' as TipoDispositivo,
      label: 'NVRs',
      icon: HardDrive,
      count: counts.nvrs,
      visible: seccionesVisibles ? seccionesVisibles.NVR !== false : true
    },
    {
      id: 'SWITCH' as TipoDispositivo,
      label: 'Switches',
      icon: Network,
      count: counts.switches,
      visible: seccionesVisibles ? seccionesVisibles.SWITCH !== false : true
    },
    {
      id: 'ACCESORIO' as TipoDispositivo,
      label: 'Accesorios',
      icon: Component,
      count: counts.accesorios || 0,
      visible: seccionesVisibles ? seccionesVisibles.ACCESORIO !== false : true
    }
  ].filter((tab) => tab.visible);

  return (
    <nav className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors select-none">
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* 1. Logo Oficial Tiandy Uruguay (Desplazado a la izquierda con margen reducido) */}
          <div
            className="flex items-center cursor-pointer select-none shrink-0 pl-0 sm:pl-1 group"
            onClick={() => {
              setActiveView('catalog');
            }}
            title="Ir al inicio del catálogo Tiandy Uruguay"
          >
            <img
              src="/img/logo-tiandy-uruguay.png"
              alt="Tiandy Uruguay"
              className="h-7 sm:h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-105"
            />
          </div>

          {/* 2. Botones de las distintas secciones: Cámaras | NVRs | Switches | Accesorios */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {categoryTabs.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeView === 'catalog' && activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveView('catalog');
                    onSelectCategory(cat.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-tiandy-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Barra de Búsqueda Global */}
          <div className="flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-1 sm:mx-2">
            <div className="w-full relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-tiandy-600 dark:group-focus-within:text-tiandy-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar (ej: TC-C320N, ColorMaker, F1.0, 4MP, alarma)..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  if (activeView !== 'catalog') {
                    setActiveView('catalog');
                  }
                }}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-tiandy-500/20 focus:border-tiandy-500 text-slate-900 dark:text-white placeholder-slate-400 font-mono transition-all"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 4. Herramientas Dropdown Automático (estilo en.tiandy.com) */}
          <div
            ref={toolsMenuRef}
            className="relative shrink-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                toolsDropdownOpen || activeView === 'compare' || activeView === 'wiki' || activeView === 'herramientas'
                  ? 'bg-slate-100 dark:bg-slate-800 text-tiandy-600 dark:text-tiandy-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Herramientas de ingeniería y utilitarios"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Herramientas</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Flotante adaptado al estilo oficial Tiandy */}
            {toolsDropdownOpen && (
              <div 
                className="absolute right-0 top-full pt-2 w-72 sm:w-80 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-950/10 dark:shadow-slate-950/50 p-2 space-y-1">
                  
                  {/* Item 1: Comparativa */}
                  <button
                    onClick={() => {
                      setActiveView('compare');
                      setToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      activeView === 'compare'
                        ? 'bg-tiandy-50 dark:bg-tiandy-950/50 text-tiandy-800 dark:text-tiandy-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Comparativa</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Matriz técnica DORI & PoE</div>
                      </div>
                    </div>
                    {compareCount > 0 && (
                      <span className="rounded-md bg-tiandy-100 dark:bg-tiandy-950 text-tiandy-700 dark:text-tiandy-300 font-mono text-[10px] font-bold px-1.5 py-0.5">
                        {compareCount}
                      </span>
                    )}
                  </button>

                  {/* Item 2: Cotizador */}
                  <button
                    onClick={() => {
                      if (onOpenCotizacion) onOpenCotizacion();
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Cotizador</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Presupuesto en tiempo real</div>
                      </div>
                    </div>
                    {totalCotizacionItems > 0 && (
                      <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold px-1.5 py-0.5">
                        {totalCotizacionItems}
                      </span>
                    )}
                  </button>

                  {/* Item 3: Calculadora UPS */}
                  <button
                    onClick={() => {
                      setActiveView('herramientas');
                      setToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      activeView === 'herramientas'
                        ? 'bg-tiandy-50 dark:bg-tiandy-950/50 text-tiandy-800 dark:text-tiandy-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <BatteryCharging className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Calculadora UPS</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Autonomía y consumo eléctrico</div>
                      </div>
                    </div>
                  </button>

                  {/* Item 4: Calculadora HDD */}
                  <button
                    onClick={() => {
                      setActiveView('herramientas');
                      setToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      activeView === 'herramientas'
                        ? 'bg-tiandy-50 dark:bg-tiandy-950/50 text-tiandy-800 dark:text-tiandy-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Calculadora HDD</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Almacenamiento S+265</div>
                      </div>
                    </div>
                  </button>

                  {/* Item 5: Wiki */}
                  <button
                    onClick={() => {
                      setActiveView('wiki');
                      setToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      activeView === 'wiki'
                        ? 'bg-tiandy-50 dark:bg-tiandy-950/50 text-tiandy-800 dark:text-tiandy-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Wiki</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Glosario técnico & tecnologías</div>
                      </div>
                    </div>
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* 5. Botón de Modo Oscuro y Claro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* 6. Botón de Acceso al Panel de Control (Panel NAS)
              Nota: Este botón existe en la versión Docker; para CloudFlare se omite */}
          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'catalog' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
              activeView === 'admin'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700 font-mono'
            }`}
            title="Panel de Control NAS"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel NAS</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
