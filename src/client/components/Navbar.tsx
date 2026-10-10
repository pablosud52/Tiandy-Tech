import React from 'react';
import { Search, LayoutGrid, Table, Moon, Sun, Settings, ShieldCheck, ChevronRight, ShoppingCart, Barcode } from 'lucide-react';

interface NavbarProps {
  busqueda: string;
  setBusqueda: (q: string) => void;
  busquedaCodigo?: string;
  setBusquedaCodigo?: (q: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  darkMode: boolean;
  setDarkMode: (dm: boolean) => void;
  activeView: 'catalog' | 'wiki' | 'admin';
  setActiveView: (view: 'catalog' | 'wiki' | 'admin') => void;
  totalProductos: number;
  onOpenCotizacion?: () => void;
  totalCotizacionItems?: number;
  totalCotizacionMonto?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  busqueda,
  setBusqueda,
  busquedaCodigo = '',
  setBusquedaCodigo,
  viewMode,
  setViewMode,
  darkMode,
  setDarkMode,
  activeView,
  setActiveView,
  totalProductos,
  onOpenCotizacion,
  totalCotizacionItems = 0,
  totalCotizacionMonto = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo y Marca Blanca */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveView('catalog')}>
            <div className="w-9 h-9 rounded-lg bg-tiandy-700 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  TIANDY
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-tiandy-50 text-tiandy-700 dark:bg-tiandy-950 dark:text-tiandy-300 border border-tiandy-200 dark:border-tiandy-800">
                  TECH
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Catálogo Técnico Oficial
              </p>
            </div>
          </div>

          {/* Buscadores Globales (visibles en Catálogo) */}
          {activeView === 'catalog' && (
            <div className="flex-1 max-w-2xl flex items-center gap-2 sm:gap-3">
              {/* Buscador General por Modelo y Características */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar modelo (ej: TC-C320N), specs..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-7 sm:pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiandy-600 dark:focus:ring-tiandy-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition"
                />
                {busqueda && (
                  <button 
                    onClick={() => setBusqueda('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Limpiar búsqueda general"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Buscador Exclusivo por Códigos (Código 1 y Código 2) */}
              {setBusquedaCodigo && (
                <div className="w-44 sm:w-56 lg:w-60 relative shrink-0">
                  <Barcode className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    placeholder="Buscar por código..."
                    value={busquedaCodigo}
                    onChange={(e) => setBusquedaCodigo(e.target.value)}
                    title="Búsqueda exclusiva por Código 1 y Código 2 de producto (ERP / Stock)"
                    className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-2 text-xs sm:text-sm bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-amber-700/60 dark:placeholder-amber-400/60 font-mono transition"
                  />
                  {busquedaCodigo && (
                    <button 
                      onClick={() => setBusquedaCodigo('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                      title="Limpiar búsqueda por código"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Acciones y Controles de Vista */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {activeView === 'catalog' && (
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Modo Cuadrícula (Fichas Visuales)"
                  className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-tiandy-700 dark:text-tiandy-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Fichas</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Modo Tabla Técnica (Spreadsheet)"
                  className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-tiandy-700 dark:text-tiandy-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>
            )}

            {/* Toggle Wiki Técnica */}
            <button
              onClick={() => setActiveView(activeView === 'wiki' ? 'catalog' : 'wiki')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                activeView === 'wiki'
                  ? 'bg-tiandy-700 text-white border-tiandy-700 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-tiandy-500'
              }`}
            >
              Wiki Técnica
            </button>

            {/* Botón Cotizador / Presupuesto */}
            {onOpenCotizacion && (
              <button
                onClick={onOpenCotizacion}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  totalCotizacionItems > 0
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
                title="Abrir cotizador y lista de componentes"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cotizador</span>
                {totalCotizacionItems > 0 && (
                  <span className="ml-0.5 rounded-full bg-white/25 px-1.5 py-0.2 text-[10px] font-black">
                    {totalCotizacionItems}
                  </span>
                )}
              </button>
            )}

            {/* Toggle Modo Oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Botón Panel de Control / Volver al Catálogo */}
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'catalog' : 'admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeView === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{activeView === 'admin' ? 'Volver a Web' : 'Panel NAS'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
