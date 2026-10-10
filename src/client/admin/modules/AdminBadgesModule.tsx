import React, { useState } from 'react';
import { Producto } from '../../../shared/types.js';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Eye, 
  Zap, 
  Layers, 
  Search, 
  ExternalLink 
} from 'lucide-react';

interface AdminBadgesModuleProps {
  productos: Producto[];
}

interface TechInfo {
  id: string;
  nombre: string;
  icono: any;
  color: string;
  badgeBg: string;
  descripcion: string;
  filtroMatch: (p: Producto) => boolean;
}

export const AdminBadgesModule: React.FC<AdminBadgesModuleProps> = ({ productos }) => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const technologies: TechInfo[] = [
    {
      id: 'ColorMaker',
      nombre: 'ColorMaker',
      icono: Sun,
      color: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
      descripcion: 'Tecnología exclusiva de Tiandy para captura a todo color 24/7 con apertura F1.0 / F1.6 y luz cálida.',
      filtroMatch: (p) => Boolean(p.badges_detectados?.includes('ColorMaker') || p.especificacion_completa?.toLowerCase().includes('colormaker'))
    },
    {
      id: 'PolarDay',
      nombre: 'Polar Day (Starlight)',
      icono: Moon,
      color: 'text-indigo-500',
      badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      descripcion: 'Sensibilidad extrema para visión nocturna ultra clara a color con mínimos lúmenes sin encender reflector.',
      filtroMatch: (p) => Boolean(p.badges_detectados?.includes('Polar Day') || p.especificacion_completa?.toLowerCase().includes('polar day'))
    },
    {
      id: 'EarlyWarning',
      nombre: 'Early Warning (Super EW)',
      icono: ShieldAlert,
      color: 'text-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
      descripcion: 'Disuasión activa en el borde: luz estroboscópica roja y azul combinada con sirena y mensaje de audio ante intrusión.',
      filtroMatch: (p) => Boolean(p.badges_detectados?.includes('Early Warning') || p.datos_tecnicos?.camara?.analiticas_ia?.early_warning_disuasion?.soporta)
    },
    {
      id: 'Panoramica',
      nombre: 'Panorámica 180° / Dual Lens',
      icono: Eye,
      color: 'text-teal-500',
      badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
      descripcion: 'Doble sensor con fusión algorítmica de imagen para cobertura panorámica de 180 grados sin distorsión de ojo de pez.',
      filtroMatch: (p) => Boolean(p.datos_tecnicos?.camara?.optica_tipo?.toLowerCase().includes('panorámica') || p.especificacion_completa?.toLowerCase().includes('180°'))
    },
    {
      id: 'Watchdog',
      nombre: 'PoE Watchdog & Extend 250m',
      icono: Zap,
      color: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      descripcion: 'Monitoreo automático de enlace PoE con reinicio autónomo de cámaras colgadas y transmisión hasta 250 metros en CCTV extend.',
      filtroMatch: (p) => Boolean(p.tipo_dispositivo === 'SWITCH' && (p.datos_tecnicos?.switch?.poe_watchdog || p.datos_tecnicos?.switch?.modo_extend_cctv_250m))
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <Layers className="h-4 w-4" />
          Diferenciales Tecnológicos Tiandy
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Badges y Tecnologías Patentadas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Visualiza qué modelos cuentan con las tecnologías clave de la marca (ColorMaker, Polar Day, Early Warning, etc.) para potenciar las búsquedas y fichas técnicas.
        </p>
      </div>

      {/* Grid de Tecnologías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technologies.map((tech) => {
          const matchingProducts = productos.filter(tech.filtroMatch);
          const Icon = tech.icono;
          const isSelected = selectedTech === tech.id;

          return (
            <div
              key={tech.id}
              onClick={() => setSelectedTech(isSelected ? null : tech.id)}
              className={`cursor-pointer rounded-3xl border p-6 transition-all shadow-sm ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md dark:border-emerald-500 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-2xl p-3 bg-slate-100 dark:bg-slate-800 ${tech.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${tech.badgeBg}`}>
                  {matchingProducts.length} modelos
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                {tech.nombre}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tech.descripcion}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{isSelected ? 'Ocultar modelos' : 'Ver modelos asociados'}</span>
                <span className="text-emerald-600 dark:text-emerald-400">→</span>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Modelos con {tech.nombre}:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs font-mono dark:bg-slate-800/60"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{p.modelo}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{p.serie}</span>
                      </div>
                    ))}
                    {matchingProducts.length === 0 && (
                      <div className="text-xs text-slate-400 italic">No hay modelos con este badge.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
