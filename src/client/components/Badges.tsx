import React from 'react';

interface BadgeOverlayProps {
  badges?: string[];
  isNew?: boolean;
}

export const BadgeOverlay: React.FC<BadgeOverlayProps> = ({ badges = [], isNew = false }) => {
  if (!badges.length && !isNew) return null;

  const badgeStyles: Record<string, { bg: string; text: string; label: string }> = {
    'Polar Day': { bg: 'bg-sky-600', text: 'text-white', label: 'POLAR DAY' },
    'ColorMaker': { bg: 'bg-amber-500', text: 'text-slate-950 font-bold', label: 'COLORMAKER' },
    'Early Warning': { bg: 'bg-red-600', text: 'text-white', label: 'EARLY WARNING' },
    '180° Panorámica': { bg: 'bg-indigo-600', text: 'text-white', label: '180° DUAL' },
    '4K Ultra HD': { bg: 'bg-emerald-600', text: 'text-white', label: '4K ULTRA HD' },
    'SMD 2.0': { bg: 'bg-purple-600', text: 'text-white', label: 'SMD 2.0' },
    'Face Recognition': { bg: 'bg-fuchsia-600', text: 'text-white', label: 'FACE REC' },
    'PoE Watchdog': { bg: 'bg-blue-600', text: 'text-white', label: 'WATCHDOG 250m' },
    'Wi-Fi': { bg: 'bg-teal-600', text: 'text-white', label: 'WI-FI' },
    '4G Solar': { bg: 'bg-orange-600', text: 'text-white', label: '4G SOLAR' }
  };

  return (
    <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
      {isNew && (
        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-tiandy-600 text-white shadow-sm border border-white/20">
          NUEVO
        </span>
      )}
      {badges.map((b) => {
        const style = badgeStyles[b] || { bg: 'bg-slate-800/90', text: 'text-white', label: b.toUpperCase() };
        return (
          <span
            key={b}
            className={`px-2 py-0.5 text-[9px] font-extrabold tracking-wider rounded ${style.bg} ${style.text} shadow-sm border border-white/20 backdrop-blur-sm`}
          >
            {style.label}
          </span>
        );
      })}
    </div>
  );
};
