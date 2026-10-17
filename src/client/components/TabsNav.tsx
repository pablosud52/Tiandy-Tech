import React from 'react';
import { Cctv, HardDrive, Network, BookOpen, ArrowLeftRight, Wrench, Calculator } from 'lucide-react';
import { TipoDispositivo } from '../../shared/types.js';

interface TabsNavProps {
  activeTab: TipoDispositivo | 'WIKI' | 'COMPARE' | 'HERRAMIENTAS';
  setActiveTab: (tab: TipoDispositivo | 'WIKI' | 'COMPARE' | 'HERRAMIENTAS') => void;
  counts: {
    camaras: number;
    nvrs: number;
    switches: number;
    accesorios?: number;
  };
  compareCount?: number;
  seccionesVisibles?: Record<string, boolean>;
}

export const TabsNav: React.FC<TabsNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  counts, 
  compareCount = 0,
  seccionesVisibles 
}) => {
  const allCategoryTabs = [
    {
      id: 'CAMARA' as const,
      label: 'Cámaras IP',
      icon: Cctv,
      count: counts.camaras,
      desc: 'Bullet, Turret, Domo, PTZ y Panorámicas'
    },
    {
      id: 'NVR' as const,
      label: 'NVRs / Grabadores',
      icon: HardDrive,
      count: counts.nvrs,
      desc: '4ch a 80ch con analíticas IA nativas'
    },
    {
      id: 'SWITCH' as const,
      label: 'Switches PoE',
      icon: Network,
      count: counts.switches,
      desc: 'CCTV Extend 250m y PoE Watchdog'
    },
    {
      id: 'ACCESORIO' as const,
      label: 'Accesorios',
      icon: Wrench,
      count: counts.accesorios || 0,
      desc: 'Anclajes, cajas estancas y soportes'
    }
  ];

  const categoryTabs = allCategoryTabs.filter(tab => {
    if (!seccionesVisibles) return true;
    return seccionesVisibles[tab.id] !== false;
  });

  const allRightTabs = [
    {
      id: 'HERRAMIENTAS' as const,
      label: 'Herramientas',
      icon: Calculator,
      count: null,
      desc: 'Calculadora UPS y Almacenamiento HDD',
      visible: seccionesVisibles ? seccionesVisibles.HERRAMIENTAS !== false : true
    },
    {
      id: 'COMPARE' as const,
      label: 'Comparativa',
      icon: ArrowLeftRight,
      count: compareCount > 0 ? compareCount : null,
      desc: 'Matriz comparativa parámetro a parámetro',
      visible: true
    },
    {
      id: 'WIKI' as const,
      label: 'Wiki Técnica',
      icon: BookOpen,
      count: null,
      desc: 'Estándar DORI, ColorMaker, Polar Day',
      visible: seccionesVisibles ? seccionesVisibles.WIKI !== false : true
    }
  ];

  const rightTabs = allRightTabs.filter(tab => tab.visible);

  const renderTabButton = (tab: typeof categoryTabs[0] | typeof rightTabs[0]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id as any)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
          isActive
            ? 'bg-tiandy-50 dark:bg-tiandy-950/60 text-tiandy-700 dark:text-tiandy-300 font-semibold shadow-sm border border-tiandy-200 dark:border-tiandy-800'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        <Icon className={`w-4 h-4 transition-colors ${
          isActive ? 'text-tiandy-700 dark:text-tiandy-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
        }`} />
        <span>{tab.label}</span>
        {tab.count !== null && (
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
            isActive
              ? 'bg-tiandy-700 text-white dark:bg-tiandy-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800/80 transition-colors">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-4 py-2 overflow-x-auto">
          {/* Categorías a la izquierda (Cámaras IP, NVRs, Switches) */}
          <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0" aria-label="Categorías de Productos">
            {categoryTabs.map(renderTabButton)}
          </nav>

          {/* Comparativa y Wiki Técnica a la derecha */}
          <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto" aria-label="Herramientas">
            {rightTabs.map(renderTabButton)}
          </nav>
        </div>
      </div>
    </div>
  );
};
