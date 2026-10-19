import { getConfiguracion, setConfiguracion } from '../db/index.js';
import { BadgeGlobalConfig } from '../../shared/types.js';

export const defaultGlobalBadges: BadgeGlobalConfig[] = [
  {
    id: 'NUEVO_MODELO',
    nombre: 'Nuevo Modelo',
    descripcion: 'Sello para destacar lanzamientos y novedades',
    imagen_url: '/data/badges/nuevo-modelo.png',
    posicion: 'top-left',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'COLORMAKER',
    nombre: 'Color Maker',
    descripcion: 'Tecnología Tiandy para captura a todo color 24/7 con apertura F1.0 / F1.6',
    imagen_url: '/data/badges/colormaker.png',
    posicion: 'bottom-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'POLAR_DAY',
    nombre: 'Polar day',
    descripcion: 'Sensibilidad extrema para visión nocturna ultra clara a color sin reflectores',
    imagen_url: '/data/badges/polarday.png',
    posicion: 'bottom-center',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'SMD_1',
    nombre: 'SMD 1.0',
    descripcion: 'Smart Motion Detection v1.0 para filtrado de falsas alarmas de movimiento básico',
    imagen_url: '/data/badges/smd-1.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'SMD_2',
    nombre: 'SMD 2.0',
    descripcion: 'Smart Motion Detection v2.0 con clasificación precisa de humanos y vehículos',
    imagen_url: '/data/badges/smd-2.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'SMD_3',
    nombre: 'SMD 3.0',
    descripcion: 'Smart Motion Detection v3.0 Deep Learning Pro con máxima precisión y largo alcance',
    imagen_url: '/data/badges/smd-3.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'VCA',
    nombre: 'VCA',
    descripcion: 'Video Content Analytics (Tripwire, Perímetro, Objeto Abandonado, etc.)',
    imagen_url: '/data/badges/vca.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: true
  },
  {
    id: 'DUAL_LIGHT',
    nombre: 'Dual Light',
    descripcion: 'Iluminación híbrida inteligente IR + Luz blanca cálida',
    imagen_url: '',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: false
  },
  {
    id: 'PARLANTE_INCORPORADO',
    nombre: 'Parlante incorporado',
    descripcion: 'Altavoz de alta potencia integrado para audio bidireccional y mensajes',
    imagen_url: '',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: false
  },
  {
    id: 'EARLY_WARNING',
    nombre: 'Early Warning (EW)',
    descripcion: 'Disuasión activa con estroboscópico rojo/azul y sirena ante intrusión',
    imagen_url: '',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100,
    anclaje: 'esquina',
    opacidad: 1,
    activo_global: true,
    es_sello_grafico: false
  }
];

export function getResolvedGlobalBadges(): BadgeGlobalConfig[] {
  const raw = getConfiguracion('global_badges_config', '');
  let badges = defaultGlobalBadges;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fusionar con defaults para garantizar que nuevos badges existan siempre
        const idsExistentes = new Set(parsed.map((b: any) => b.id));
        const faltantes = defaultGlobalBadges.filter(d => !idsExistentes.has(d.id));
        badges = [...parsed, ...faltantes];
      }
    } catch (_) {}
  }
  return badges;
}

export function saveGlobalBadges(badges: BadgeGlobalConfig[]): void {
  setConfiguracion('global_badges_config', JSON.stringify(badges));
}
