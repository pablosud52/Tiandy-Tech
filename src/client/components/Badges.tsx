import React from 'react';
import { Producto, SelloGraficoConfig, PosicionSello, CapaSello, BadgeGlobalConfig, AnclajeSello } from '../../shared/types.js';

export const DEFAULT_BADGE_SVGS: Record<string, string> = {
  NUEVO_MODELO: '/data/badges/nuevo-modelo.svg',
  COLORMAKER: '/data/badges/colormaker.svg',
  POLAR_DAY: '/data/badges/polarday.svg',
  SMD_1: '/data/badges/smd-1.svg',
  SMD_2: '/data/badges/smd-2.svg',
  SMD_3: '/data/badges/smd-3.svg',
  VCA: '/data/badges/vca.svg',
};

export function getProductSellos(
  producto: Partial<Producto>,
  globalBadges?: BadgeGlobalConfig[]
): SelloGraficoConfig[] {
  const existingSellos = (producto.datos_tecnicos as any)?.sellos_graficos || [];
  const badgesDet = producto.badges_detectados || [];
  const camAnaliticas = (producto.datos_tecnicos as any)?.camara?.analiticas_ia;
  const versionSmd = camAnaliticas?.version_smd || '';
  const vcaFunciones = camAnaliticas?.vca_funciones;

  // Si se provee la configuración global centralizada, es la FUENTE DE VERDAD para imagen, posición, capa, anclaje y escala
  if (globalBadges && Array.isArray(globalBadges) && globalBadges.length > 0) {
    return globalBadges
      .filter((gb) => gb.activo_global !== false)
      .map((gb) => {
        let isActivo = false;
        const fromProduct = existingSellos.find((s: any) => s && s.id === gb.id);
        // Jerarquía de control manual: la configuración guardada en el panel prima sobre cualquier inferencia
        if (fromProduct !== undefined) {
          isActivo = Boolean(fromProduct.activo);
        } else {
          // Inferencia retrospectiva si el producto aún no fue configurado manualmente
          if (gb.id === 'NUEVO_MODELO' && producto.badge_nuevo) isActivo = true;
          if (gb.id === 'COLORMAKER' && badgesDet.some((b: string) => b.toUpperCase().includes('COLORMAKER'))) isActivo = true;
          if (gb.id === 'POLAR_DAY' && badgesDet.some((b: string) => b.toUpperCase().includes('POLAR'))) isActivo = true;
          if (gb.id === 'SMD_1' && (badgesDet.some((b: string) => /SMD\s*1/i.test(b)) || /1(\.0)?/i.test(versionSmd))) isActivo = true;
          if (gb.id === 'SMD_2' && (badgesDet.some((b: string) => /SMD\s*2/i.test(b)) || /2(\.0)?/i.test(versionSmd))) isActivo = true;
          if (gb.id === 'SMD_3' && (badgesDet.some((b: string) => /SMD\s*3/i.test(b)) || /3(\.0)?/i.test(versionSmd))) isActivo = true;
          if (gb.id === 'VCA' && (badgesDet.some((b: string) => /VCA/i.test(b)) || (Array.isArray(vcaFunciones) ? vcaFunciones.length > 0 : Boolean(vcaFunciones)))) isActivo = true;
          if (gb.id === 'DUAL_LIGHT' && badgesDet.some((b: string) => /DUAL/i.test(b))) isActivo = true;
          if (gb.id === 'PARLANTE_INCORPORADO' && badgesDet.some((b: string) => /PARLANTE|ALTAVOZ/i.test(b))) isActivo = true;
          if (gb.id === 'EARLY_WARNING' && badgesDet.some((b: string) => /EARLY|EW/i.test(b))) isActivo = true;
        }

        // Si gb.imagen_url está vacía, usar el fallback svg oficial predeterminado (ej: smd-1.svg, vca.svg)
        const defaultImg = DEFAULT_BADGE_SVGS[gb.id] || '';
        const finalImg = (gb.imagen_url && gb.imagen_url.trim() !== '') ? gb.imagen_url : defaultImg;

        return {
          id: gb.id,
          nombre: gb.nombre,
          activo: isActivo,
          imagen_url: finalImg || undefined,
          posicion: gb.posicion,
          capa: gb.capa,
          tamano: gb.tamano,
          anclaje: gb.anclaje || 'esquina',
          opacidad: gb.opacidad !== undefined ? gb.opacidad : 1
        };
      })
      .filter((s) => s.activo && s.imagen_url && s.imagen_url.trim() !== '');
  }

  // Si la configuración global aún no se cargó, usar sellos guardados en el producto asegurando imagen_url
  if (existingSellos && Array.isArray(existingSellos) && existingSellos.length > 0) {
    return existingSellos
      .map((s: any) => {
        if (!s) return null;
        const img = (s.imagen_url && s.imagen_url.trim() !== '') ? s.imagen_url : (DEFAULT_BADGE_SVGS[s.id] || '');
        return { ...s, imagen_url: img || undefined };
      })
      .filter((s): s is SelloGraficoConfig => Boolean(s && s.activo && s.imagen_url && s.imagen_url.trim() !== ''));
  }

  return [];
}

interface SellosGraficosOverlayProps {
  sellos?: SelloGraficoConfig[];
  capaFiltro?: CapaSello;
  tamano?: 'compact' | 'normal' | 'large';
}

export const SellosGraficosOverlay: React.FC<SellosGraficosOverlayProps> = ({
  sellos = [],
  capaFiltro,
  tamano = 'normal'
}) => {
  const getSelloImage = (s: SelloGraficoConfig): string => {
    if (s.imagen_url && s.imagen_url.trim() !== '') return s.imagen_url;
    return DEFAULT_BADGE_SVGS[s.id] || '';
  };

  const activos = (sellos || []).filter((s) => s && s.activo && Boolean(getSelloImage(s)) && (!capaFiltro || (s.capa || 'front') === capaFiltro));
  if (!activos.length) return null;

  const isCompact = tamano === 'compact';
  const isLarge = tamano === 'large';

  const getPositionClass = (pos?: PosicionSello) => {
    switch (pos) {
      case 'top-left':
        return isCompact ? 'top-0.5 left-0.5' : 'top-1 left-1 sm:top-1.5 sm:left-1.5';
      case 'top-right':
        return isCompact ? 'top-0.5 right-0.5' : 'top-1 right-1 sm:top-1.5 sm:right-1.5';
      case 'bottom-left':
        // En compact (tabla) se ancla al borde inferior
        return isCompact ? 'bottom-0.5 left-0.5' : 'bottom-8 left-1 sm:bottom-8 sm:left-1.5';
      case 'bottom-right':
        return isCompact ? 'bottom-0.5 right-0.5' : 'bottom-1 right-1 sm:bottom-1.5 sm:right-1.5';
      case 'bottom-center':
        return isCompact ? 'bottom-0.5 left-1/2 -translate-x-1/2' : 'bottom-1 left-1/2 -translate-x-1/2 sm:bottom-1.5';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return isCompact ? 'top-0.5 left-0.5' : 'top-1 left-1';
    }
  };

  const getTransformOrigin = (pos?: PosicionSello, anclaje?: AnclajeSello) => {
    if (anclaje === 'centro') return 'center';
    switch (pos) {
      case 'top-left':
        return 'top left';
      case 'top-right':
        return 'top right';
      case 'bottom-left':
        return 'bottom left';
      case 'bottom-right':
        return 'bottom right';
      case 'bottom-center':
        return 'bottom center';
      case 'center':
        return 'center';
      default:
        return 'top left';
    }
  };

  const getSizeClass = (id: string) => {
    if (isCompact) {
      if (id === 'NUEVO_MODELO') return 'w-7 h-7 sm:w-8 sm:h-8';
      if (id === 'COLORMAKER') return 'w-8.5 h-auto max-h-5 sm:w-10 sm:max-h-5.5';
      if (id === 'POLAR_DAY') return 'w-10 h-auto max-h-4 sm:w-12 sm:max-h-5';
      if (id.startsWith('SMD_') || id === 'VCA') return 'w-7.5 h-auto max-h-4 sm:w-8.5 sm:max-h-4.5';
      return 'w-7 h-auto';
    }

    if (id === 'NUEVO_MODELO') {
      return isLarge ? 'w-16 h-16 sm:w-18 sm:h-18' : 'w-13 h-13 sm:w-16 sm:h-16';
    }
    if (id === 'COLORMAKER') {
      return isLarge ? 'w-20 h-auto max-h-10 sm:w-24 sm:max-h-12' : 'w-16 h-auto max-h-9 sm:w-20 sm:max-h-11';
    }
    if (id === 'POLAR_DAY') {
      return isLarge ? 'w-24 h-auto max-h-9 sm:w-28 sm:max-h-11' : 'w-20 h-auto max-h-8 sm:w-26 sm:max-h-10';
    }
    if (id.startsWith('SMD_') || id === 'VCA') {
      return isLarge ? 'w-20 h-auto max-h-8 sm:w-24 sm:max-h-10' : 'w-16 h-auto max-h-7 sm:w-20 sm:max-h-8';
    }
    return isLarge ? 'w-18 h-auto' : 'w-14 h-auto';
  };

  return (
    <>
      {activos.map((sello) => {
        const scaleVal = sello.tamano && sello.tamano !== 100 ? sello.tamano / 100 : 1;
        const transformOrigin = getTransformOrigin(sello.posicion, sello.anclaje);
        // La opacidad nunca puede ser menor a 0.5 (tope máximo de 50% de transparencia)
        const opacityVal = sello.opacidad !== undefined
          ? Math.max(0.5, Math.min(1, sello.opacidad))
          : (sello.capa === 'back' ? 0.85 : 1);

        const scaleStyle: React.CSSProperties = {
          transform: scaleVal !== 1 ? `scale(${scaleVal})` : undefined,
          transformOrigin,
          opacity: opacityVal
        };

        return (
          <div
            key={sello.id}
            style={scaleStyle}
            className={`absolute ${getPositionClass(sello.posicion)} ${
              sello.capa === 'back' ? 'z-0 pointer-events-none' : 'z-20 pointer-events-none'
            } select-none transition-all duration-200`}
          >
            <img
              src={getSelloImage(sello)}
              alt={sello.nombre}
              className={`${getSizeClass(sello.id)} object-contain drop-shadow-sm`}
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </>
  );
};

interface BadgeOverlayProps {
  badges?: string[];
  isNew?: boolean;
  hasTopRightSello?: boolean;
  activeSellos?: SelloGraficoConfig[];
}

export const BadgeOverlay: React.FC<BadgeOverlayProps> = ({ 
  badges = [], 
  hasTopRightSello = false,
  activeSellos = []
}) => {
  // Las etiquetas que ya tienen un sello gráfico con imagen activa visible se omiten de este overlay para evitar duplicados.
  // Cualquier otra etiqueta funcional o tecnológica (o SMD/VCA/EW/Dual Light cuando no son sello gráfico activo) se muestra como pastilla elegante.
  const activeGraphicIds = new Set(
    (activeSellos || [])
      .filter((s) => s && s.activo && Boolean(s.imagen_url || DEFAULT_BADGE_SVGS[s.id]))
      .map((s) => s.id.toUpperCase())
  );

  const functionalBadges = badges.filter((b) => {
    const upper = b.toUpperCase().trim();
    if (activeGraphicIds.has('COLORMAKER') && upper.includes('COLORMAKER')) return false;
    if (activeGraphicIds.has('POLAR_DAY') && (upper.includes('POLAR') || upper === 'POLAR DAY')) return false;
    if (activeGraphicIds.has('NUEVO_MODELO') && (upper.includes('NUEVO') || upper.includes('NEW'))) return false;
    if (activeGraphicIds.has('SMD_1') && /SMD\s*1(\.0)?/i.test(upper)) return false;
    if (activeGraphicIds.has('SMD_2') && /SMD\s*2(\.0)?/i.test(upper)) return false;
    if (activeGraphicIds.has('SMD_3') && /SMD\s*3(\.0)?/i.test(upper)) return false;
    if (activeGraphicIds.has('VCA') && upper === 'VCA') return false;

    // Si no se proveyó activeSellos, excluir por defecto solo los sellos gráficos que tienen imagen dedicada
    if (!activeSellos || activeSellos.length === 0) {
      if (['Polar Day', 'POLAR_DAY', 'ColorMaker', 'COLORMAKER', 'Nuevo Modelo', 'NUEVO_MODELO'].some(s => upper.includes(s.toUpperCase()))) {
        return false;
      }
    }
    return true;
  });

  if (!functionalBadges.length) return null;

  const cleanLabel = (b: string) => {
    const upper = b.toUpperCase().trim();
    if (upper === 'EARLY WARNING' || upper === 'EARLY_WARNING' || upper === 'EW') return 'EARLY WARNING';
    if (upper === 'DUAL LIGHT' || upper === 'DUAL_LIGHT') return 'DUAL LIGHT';
    if (upper === 'PARLANTE INCORPORADO' || upper === 'PARLANTE_INCORPORADO' || upper === 'ALTAVOZ' || upper === 'PARLANTE') return 'ALTAVOZ';
    if (upper === 'POE WATCHDOG' || upper === 'POE_WATCHDOG' || upper === 'WATCHDOG') return 'POE WATCHDOG';
    if (upper === '4K ULTRA HD' || upper === '4K_ULTRA_HD' || upper === '4K' || upper === '8MP') return '4K ULTRA HD';
    if (upper === 'FACE RECOGNITION' || upper === 'FACE_RECOGNITION') return 'FACE RECOGNITION';
    if (upper === '180° PANORÁMICA' || upper === '180 PANORAMICA' || upper === 'PANORAMICA_180' || upper === '180°') return '180° PANORÁMICA';
    if (upper === '4G SOLAR' || upper === 'SOLAR_4G' || upper === '4G') return '4G SOLAR';
    if (upper === 'WI-FI' || upper === 'WIFI') return 'WI-FI';
    if (/^SMD\s*1(\.0)?$/i.test(upper) || upper === 'SMD_1') return 'SMD 1.0';
    if (/^SMD\s*2(\.0)?$/i.test(upper) || upper === 'SMD_2') return 'SMD 2.0';
    if (/^SMD\s*3(\.0)?$/i.test(upper) || upper === 'SMD_3') return 'SMD 3.0';
    if (upper === 'VCA') return 'VCA';
    return upper;
  };

  // Desduplicar etiquetas funcionales según su etiqueta limpia resultante
  const seen = new Set<string>();
  const uniqueFunctionalBadges: { raw: string; label: string }[] = [];
  functionalBadges.forEach((b) => {
    const lbl = cleanLabel(b);
    if (!seen.has(lbl)) {
      seen.add(lbl);
      uniqueFunctionalBadges.push({ raw: b, label: lbl });
    }
  });

  if (!uniqueFunctionalBadges.length) return null;

  // Si existe un sello gráfico en top-right, desplazamos los badges funcionales hacia abajo para evitar colisión visual
  const topClass = hasTopRightSello ? 'top-8 sm:top-9' : 'top-2 sm:top-2.5';

  return (
    <div className={`absolute ${topClass} right-2 sm:right-2.5 flex flex-wrap justify-end gap-1.5 z-20 pointer-events-none transition-all`}>
      {uniqueFunctionalBadges.map(({ raw, label }) => (
        <span
          key={raw}
          className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold tracking-wider rounded bg-slate-800 text-white shadow-sm border border-white/20 backdrop-blur-sm"
        >
          {label}
        </span>
      ))}
    </div>
  );
};
