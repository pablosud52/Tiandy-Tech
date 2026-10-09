import React from 'react';
import { Camera, HardDrive, Network, BookOpen } from 'lucide-react';
import { TipoDispositivo } from '../../shared/types.js';

interface TabsNavProps {
  activeTab: TipoDispositivo | 'WIKI';
  setActiveTab: (tab: TipoDispositivo | 'WIKI') => void;
  counts: {
    camaras: number;
    nvrs: number;
    switches: number;
  };
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, setActiveTab, counts }) => {
  const tabs = [
    {
      id: 'CAMARA' as const,
      label: 'Cámaras IP',
      icon: Camera,
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
      id: 'WIKI' as const,
      label: 'Wiki Técnica',
      icon: BookOpen,
      count: null,
      desc: 'Estándar DORI, ColorMaker, Polar Day'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2.5" aria-label="Secciones">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-tiandy-600 text-white dark:bg-tiandy-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
