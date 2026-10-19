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
      desc: 'Bullet, Turret, Domo, PTZ'
    },
    {
      id: 'NVR' as const,
      label: 'NVRs',
      icon: HardDrive,
      count: counts.nvrs,
      desc: 'Grabación y Analíticas IA'
    },
    {
      id: 'SWITCH' as const,
      label: 'Switches PoE',
      icon: Network,
      count: counts.switches,
      desc: 'Watchdog y 250m Extend'
    },
    {
      id: 'ACCESORIO' as const,
      label: 'Accesorios',
      icon: Wrench,
      count: counts.accesorios || 0,
      desc: 'Soportes y Cajas Estancas'
    }
  ];

  const categoryTabs = allCategoryTabs.filter(tab => {
    if (!seccionesVisibles) return true;
    return seccionesVisibles[tab.id] !== false;
  });

  const showComparador = seccionesVisibles ? seccionesVisibles.COMPARADOR !== false : true;
  const showHerramientas = (seccionesVisibles ? seccionesVisibles.HERRAMIENTAS !== false : true) &&
    (seccionesVisibles ? (seccionesVisibles.HERRAMIENTAS_UPS !== false || seccionesVisibles.HERRAMIENTAS_ALMACENAMIENTO !== false) : true);
  const showWiki = seccionesVisibles ? seccionesVisibles.WIKI !== false : true;

  const allRightTabs = [
    {
      id: 'HERRAMIENTAS' as const,
      label: 'Herramientas',
      icon: Calculator,
      count: null,
      desc: 'Cálculo UPS & Discos HDD',
      visible: showHerramientas
    },
    {
      id: 'COMPARE' as const,
      label: 'Comparativa',
      icon: ArrowLeftRight,
      count: compareCount > 0 ? compareCount : null,
      desc: 'Matriz Técnica DORI & PoE',
      visible: showComparador
    },
    {
      id: 'WIKI' as const,
      label: 'Wiki Técnica',
      icon: BookOpen,
      count: null,
      desc: 'Glosario & Tecnologías',
      visible: showWiki
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
        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 select-none ${
          isActive
            ? 'bg-tiandy-600 text-white shadow-md shadow-tiandy-600/20 font-bold ring-1 ring-tiandy-500/40'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
        }`}
        title={tab.desc}
      >
        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isActive ? 'text-white scale-110' : 'text-slate-400 dark:text-slate-500 group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400'}`} />
        <span>{tab.label}</span>
        {tab.count !== null && tab.count !== undefined && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-tiandy-100 dark:group-hover:bg-tiandy-950/60 group-hover:text-tiandy-700 dark:group-hover:text-tiandy-300'
            }`}
          >
            {tab.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Categorías Principales */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {categoryTabs.map(renderTabButton)}
          </div>

          {/* Vistas Técnicas Secundarias */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-4 border-l border-slate-200/80 dark:border-slate-800/80">
            {rightTabs.map(renderTabButton)}
          </div>
        </div>
      </div>
    </div>
  );
};
