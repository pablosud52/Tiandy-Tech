import React from 'react';
import { Producto, SelloGraficoConfig, PosicionSello, CapaSello, BadgeGlobalConfig, AnclajeSello } from '../../shared/types.js';

export function getProductSellos(
  producto: Partial<Producto>,
  globalBadges?: BadgeGlobalConfig[]
): SelloGraficoConfig[] {
  // Si se provee la configuración global centralizada, es la FUENTE DE VERDAD para imagen, posición, capa, anclaje y escala
  if (globalBadges && Array.isArray(globalBadges) && globalBadges.length > 0) {
    const existingSellos = (producto.datos_tecnicos as any)?.sellos_graficos || [];
    const badgesDet = producto.badges_detectados || [];

    return globalBadges
      .filter((gb) => gb.activo_global !== false)
      .map((gb) => {
        let isActivo = false;
        const fromProduct = existingSellos.find((s: any) => s && s.id === gb.id);
        if (fromProduct !== undefined) {
          isActivo = Boolean(fromProduct.activo);
        } else {
          // Inferencia retrospectiva para productos previos
          if (gb.id === 'NUEVO_MODELO' && producto.badge_nuevo) isActivo = true;
          if (gb.id === 'COLORMAKER' && badgesDet.some((b: string) => b.toUpperCase().includes('COLORMAKER'))) isActivo = true;
          if (gb.id === 'POLAR_DAY' && badgesDet.some((b: string) => b.toUpperCase().includes('POLAR'))) isActivo = true;
          if (gb.id === 'SMD_1' && badgesDet.some((b: string) => /SMD\s*1/i.test(b))) isActivo = true;
          if (gb.id === 'SMD_2' && badgesDet.some((b: string) => /SMD\s*2/i.test(b))) isActivo = true;
          if (gb.id === 'SMD_3' && badgesDet.some((b: string) => /SMD\s*3/i.test(b))) isActivo = true;
          if (gb.id === 'VCA' && badgesDet.some((b: string) => /VCA/i.test(b))) isActivo = true;
          if (gb.id === 'DUAL_LIGHT' && badgesDet.some((b: string) => /DUAL/i.test(b))) isActivo = true;
          if (gb.id === 'PARLANTE_INCORPORADO' && badgesDet.some((b: string) => /PARLANTE|ALTAVOZ/i.test(b))) isActivo = true;
          if (gb.id === 'EARLY_WARNING' && badgesDet.some((b: string) => /EARLY|EW/i.test(b))) isActivo = true;
        }

        return {
          id: gb.id,
          nombre: gb.nombre,
          activo: isActivo,
          imagen_url: gb.imagen_url || undefined,
          posicion: gb.posicion,
          capa: gb.capa,
          tamano: gb.tamano,
          anclaje: gb.anclaje || 'esquina',
          opacidad: gb.opacidad !== undefined ? gb.opacidad : 1
        };
      })
      .filter((s) => s.activo && s.imagen_url && s.imagen_url.trim() !== '');
  }

  // Si la configuración global aún no se cargó, usar sellos guardados en el producto (si existen)
  const existing = producto.datos_tecnicos?.sellos_graficos;
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing.filter(s => s && s.activo && s.imagen_url && s.imagen_url.trim() !== '');
  }

  // No inyectar imágenes obsoletas si no hay configuración cargada
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
  const activos = (sellos || []).filter((s) => s && s.activo && s.imagen_url && s.imagen_url.trim() !== '' && (!capaFiltro || (s.capa || 'front') === capaFiltro));
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
              src={sello.imagen_url || `/data/badges/${sello.id.toLowerCase().replace('_', '-')}.svg`}
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
}

export const BadgeOverlay: React.FC<BadgeOverlayProps> = ({ 
  badges = [], 
  hasTopRightSello = false 
}) => {
  // Las etiquetas que tienen imagen activa se muestran en SellosGraficosOverlay.
  // Las que no tienen imagen (o badges funcionales como Dual Light, Parlante, EW) se muestran aquí como pastillas elegantes de texto.
  const functionalBadges = badges.filter(
    (b) => !['Polar Day', 'POLAR_DAY', 'ColorMaker', 'COLORMAKER', 'Nuevo Modelo', 'NUEVO_MODELO', 'SMD 1.0', 'SMD 2.0', 'SMD 3.0', 'SMD', 'VCA'].some(
      s => b.toUpperCase().includes(s.toUpperCase())
    )
  );

  if (!functionalBadges.length) return null;

  const cleanLabel = (b: string) => {
    if (b === 'Early Warning' || b === 'EARLY_WARNING') return 'EARLY WARNING';
    if (b === 'Dual Light' || b === 'DUAL_LIGHT') return 'DUAL LIGHT';
    if (b === 'Parlante Incorporado' || b === 'PARLANTE_INCORPORADO') return 'ALTAVOZ';
    return b.toUpperCase();
  };

  // Si existe un sello gráfico en top-right, desplazamos los badges funcionales hacia abajo para evitar colisión visual
  const topClass = hasTopRightSello ? 'top-8 sm:top-9' : 'top-2 sm:top-2.5';

  return (
    <div className={`absolute ${topClass} right-2 sm:right-2.5 flex flex-wrap justify-end gap-1.5 z-20 pointer-events-none transition-all`}>
      {functionalBadges.map((b) => (
        <span
          key={b}
          className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold tracking-wider rounded bg-slate-800 text-white shadow-sm border border-white/20 backdrop-blur-sm"
        >
          {cleanLabel(b)}
        </span>
      ))}
    </div>
  );
};
