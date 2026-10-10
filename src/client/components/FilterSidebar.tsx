import React, { useState } from 'react';
import { TipoDispositivo, FiltrosBusqueda } from '../../shared/types.js';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw, ShieldCheck, Video, Cpu, Server, Layers } from 'lucide-react';

interface FilterSidebarProps {
  tipo: TipoDispositivo;
  filtros: FiltrosBusqueda;
  onChange: (nuevosFiltros: FiltrosBusqueda) => void;
  onReset: () => void;
  conteoResultados: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  tipo,
  filtros,
  onChange,
  onReset,
  conteoResultados,
  isOpenMobile,
  onCloseMobile
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    serie: true,
    stock: true,
    formato: true,
    resolucion: true,
    canales: true,
    puertos: true,
    tecnologia: true,
    audio: true,
    especial: true
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCheckboxToggle = <K extends keyof FiltrosBusqueda>(key: K, value: string) => {
    const list = (filtros[key] as string[]) || [];
    const exists = list.includes(value);
    const updated = exists ? list.filter((item) => item !== value) : [...list, value];
    onChange({ ...filtros, [key]: updated });
  };

  const handleBooleanToggle = (key: keyof FiltrosBusqueda) => {
    onChange({ ...filtros, [key]: !filtros[key] });
  };

  const renderSectionHeader = (title: string, sectionKey: string) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
    >
      <span>{title}</span>
      {openSections[sectionKey] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 lg:static lg:z-0 lg:w-64 lg:transform-none lg:shadow-none lg:border-r lg:border-slate-200 lg:dark:border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Filtros
            </h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {conteoResultados}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
              title="Restablecer filtros"
            >
              <RotateCcw className="h-3 w-3" />
              Limpiar
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Series Tiandy */}
          <div>
            {renderSectionHeader('Serie Tiandy', 'serie')}
            {openSections.serie && (
              <div className="mt-2 space-y-1.5">
                {[
                  { id: 'AK', label: 'AK Series (Entry Level)' },
                  { id: 'Spark', label: 'Spark Lite' },
                  { id: 'Lite', label: 'Lite Series' },
                  { id: 'Pro', label: 'Pro Series' },
                  { id: 'Ultra', label: 'Ultra Series' },
                  { id: 'Panoramic', label: 'Panoramic Series' },
                  { id: 'Expert', label: 'Expert Series' }
                ].map((s) => {
                  const checked = filtros.serie?.includes(s.id) || false;
                  return (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxToggle('serie', s.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* FILTROS ESPECÍFICOS: CÁMARAS */}
          {tipo === 'CAMARA' && (
            <>
              {/* Formato */}
              <div className="pt-3">
                {renderSectionHeader('Formato', 'formato')}
                {openSections.formato && (
                  <div className="mt-2 space-y-1.5">
                    {['Bullet', 'Turret', 'Domo', 'PTZ', 'Fisheye'].map((fmt) => {
                      const checked = filtros.formato?.includes(fmt) || false;
                      return (
                        <label
                          key={fmt}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle('formato', fmt)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span>{fmt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resolución */}
              <div className="pt-3">
                {renderSectionHeader('Resolución', 'resolucion')}
                {openSections.resolucion && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { id: '2MP', label: '2 MP (1080p FHD)' },
                      { id: '3MP', label: '3 MP' },
                      { id: '4MP', label: '4 MP (2K QHD)' },
                      { id: '5MP', label: '5 MP' },
                      { id: '8MP', label: '8 MP (4K UHD)' }
                    ].map((res) => {
                      const checked = filtros.resolucion_mp?.includes(res.id) || false;
                      return (
                        <label
                          key={res.id}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle('resolucion_mp', res.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span>{res.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tecnología Nocturna */}
              <div className="pt-3">
                {renderSectionHeader('Visión Nocturna', 'tecnologia')}
                {openSections.tecnologia && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { id: 'COLORMAKER', label: 'ColorMaker (Color 24/7)' },
                      { id: 'DUAL_LIGHT', label: 'Dual Light (IR + Cálida)' },
                      { id: 'POLAR_DAY', label: 'Polar Day (WDR Dinámico)' },
                      { id: 'EARLY_WARNING', label: 'Early Warning (Alerta Activa)' }
                    ].map((badge) => {
                      const checked = filtros.badges?.includes(badge.id) || false;
                      return (
                        <label
                          key={badge.id}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle('badges', badge.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span>{badge.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hardware & Audio */}
              <div className="pt-3">
                {renderSectionHeader('Audio e Interfaces', 'audio')}
                {openSections.audio && (
                  <div className="mt-2 space-y-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.microfono_incorporado || false}
                        onChange={() => handleBooleanToggle('microfono_incorporado')}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>Micrófono Incorporado</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.altavoz_incorporado || false}
                        onChange={() => handleBooleanToggle('altavoz_incorporado')}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>Altavoz / Audio 2 Vías</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.slot_sd || false}
                        onChange={() => handleBooleanToggle('slot_sd')}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>Ranura MicroSD</span>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FILTROS ESPECÍFICOS: NVRS */}
          {tipo === 'NVR' && (
            <>
              {/* Canales */}
              <div className="pt-3">
                {renderSectionHeader('Canales IP', 'canales')}
                {openSections.canales && (
                  <div className="mt-2 space-y-1.5">
                    {['5ch', '10ch', '20ch', '40ch', '80ch', '160ch'].map((ch) => {
                      const checked = filtros.canales?.includes(ch) || false;
                      return (
                        <label
                          key={ch}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle('canales', ch)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span>{ch}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bahías SATA */}
              <div className="pt-3">
                {renderSectionHeader('Bahías HDD SATA', 'especial')}
                {openSections.especial && (
                  <div className="mt-2 space-y-1.5">
                    {['1 HDD', '2 HDDs', '4 HDDs', '8 HDDs'].map((b) => {
                      const checked = filtros.bahias?.includes(b) || false;
                      return (
                        <label
                          key={b}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle('bahias', b)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span>{b}</span>
                        </label>
                      );
                    })}
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={filtros.poe_integrado || false}
                        onChange={() => handleBooleanToggle('poe_integrado')}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>Con Puertos PoE Integrados</span>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FILTROS ESPECÍFICOS: SWITCHES */}
          {tipo === 'SWITCH' && (
            <div className="pt-3">
              {renderSectionHeader('Puertos y PoE', 'puertos')}
              {openSections.puertos && (
                <div className="mt-2 space-y-1.5">
                  {[
                    '4 Puertos PoE',
                    '8 Puertos PoE',
                    '16 Puertos PoE',
                    '24 Puertos PoE'
                  ].map((p) => {
                    const checked = filtros.puertos_poe?.includes(p) || false;
                    return (
                      <label
                        key={p}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxToggle('puertos_poe', p)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                        <span>{p}</span>
                      </label>
                    );
                  })}
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={filtros.modo_extendido || false}
                      onChange={() => handleBooleanToggle('modo_extendido')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span>Modo Extendido 250m CCTV</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
