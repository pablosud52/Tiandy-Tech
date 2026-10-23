import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Layers,
  Search,
  ChevronRight,
  ArrowUp
} from 'lucide-react';

interface WikiTopic {
  id: string;
  title: string;
  shortDesc: string;
  badge: string;
}

const WIKI_TOPICS: WikiTopic[] = [
  {
    id: 'dori',
    title: 'DORI',
    shortDesc: 'Detección, Observación, Reconocimiento e Identificación (IEC EN62676-4)',
    badge: ''
  },
  {
    id: 'smd',
    title: 'SMD',
    shortDesc: 'Smart Motion Detection: Clasificación de humanos, vehículos y versiones 1.0 a 3.0.',
    badge: ''
  },
  {
    id: 'colormaker',
    title: 'Color Maker',
    shortDesc: 'Grabación a color real las 24 horas sin pasar nunca a blanco y negro.',
    badge: ''
  },
  {
    id: 'polar-day',
    title: 'Polar Day',
    shortDesc: 'Visión a todo color en penumbra extrema sin reflectores de luz visible.',
    badge: ''
  },
  {
    id: 'early-warning',
    title: 'Early Warning (EW)',
    shortDesc: 'Disuasión activa en tiempo real con estrobos bicolor, voz y salida de alarma.',
    badge: ''
  },
  {
    id: 'codec-s265',
    title: 'S+265 (Smart H.265)',
    shortDesc: 'Compresión inteligente por regiones de interés con hasta 75% de ahorro en almacenamiento.',
    badge: ''
  },
  {
    id: 'poe-switches',
    title: 'Alimentación PoE y Modo CCTV Extend 250m',
    shortDesc: 'Presupuestos de potencia, estándares 802.3af/at y transmisión a larga distancia.',
    badge: 'Infraestructura PoE'
  },
  {
    id: 'vca',
    title: 'VCA - Analíticas de Video (Video Content Analytics)',
    shortDesc: 'Reglas perimetrales avanzadas: Tripwire, intrusión, objeto abandonado y deambuleo.',
    badge: 'Deep Learning'
  },
  {
    id: 'grados-ip-ik',
    title: 'Grados de Protección Intemperie e Impacto (IP67 / IK10)',
    shortDesc: 'Resistencia a polvo, inmersión y protección antivandálica mecánica.',
    badge: 'Resistencia Física'
  }
];

export const WikiPage: React.FC = () => {
  // Filtro de búsqueda del índice
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('dori');

  // Filtrado de temas en el índice
  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return WIKI_TOPICS;
    return WIKI_TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        (t.badge && t.badge.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Scroll Spy con IntersectionObserver para destacar el tema activo
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible && visible.target.id) {
          setActiveSectionId(visible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    WIKI_TOPICS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTopic = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90; // compensar navbar sticky
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      
      {/* Cabecera Limpia y Editorial */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-wider mb-1.5">
          <BookOpen className="h-4 w-4 text-tiandy-600 dark:text-tiandy-400" />
          <span>Documentación Técnica & Ingeniería de Campo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Wiki Técnica Tiandy
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Guía de referencia rápida sobre estándares internacionales (DORI, PoE, IP/IK), tecnologías de captura y algoritmos de inteligencia artificial.
        </p>
      </div>

      {/* Contenedor Principal: Índice Flotante a la Izquierda + Contenido a la Derecha */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: ÍNDICE DE TEMAS FLOTANTE (STICKY)      */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-20 z-10">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm p-4 space-y-4">
            
            {/* Encabezado del Índice */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Índice de Temas
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {WIKI_TOPICS.length}
              </span>
            </div>

            {/* Buscador Rápido de Temas */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar temas..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tiandy-500 transition-all font-sans"
              />
            </div>

            {/* Lista Vertical de Temas con Enlaces Suaves */}
            <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No se encontraron temas coincidentes.
                </div>
              ) : (
                filteredTopics.map((topic, index) => {
                  const isActive = activeSectionId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => scrollToTopic(topic.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 group cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                      }`}
                    >
                      <span className={`text-[10px] font-mono mt-0.5 shrink-0 ${
                        isActive ? 'text-tiandy-400 font-bold' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {(index + 1).toString().padStart(2, '0')}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs leading-snug">
                          {topic.title}
                        </div>
                        {topic.badge ? (
                          <div className={`text-[10px] truncate mt-0.5 font-normal ${
                            isActive ? 'text-slate-300 dark:text-slate-400' : 'text-slate-400'
                          }`}>
                            {topic.badge}
                          </div>
                        ) : null}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                        isActive ? 'translate-x-0.5 text-white' : 'opacity-0 group-hover:opacity-100 text-slate-400'
                      }`} />
                    </button>
                  );
                })
              )}
            </nav>

            {/* Botón de Retorno Arriba */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-1.5 px-3 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Volver al inicio</span>
              </button>
            </div>

          </div>
        </aside>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: TARJETAS DE TEMAS A ANCHO COMPLETO       */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* TEMA 1: DORI */}
          <section
            id="dori"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            {/* Header del Tema */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                DORI - Detección Observación Reconocimiento Identificación
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Es un estándar internacional (basado en la norma <strong>IEC EN62676-4</strong>) que define las capacidades de distancia y nivel de detalle que puede ofrecer una cámara de videovigilancia CCTV según la densidad de píxeles por metro (<strong>PPM</strong>).
            </p>

            {/* Cuadrícula de Niveles DORI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {/* D - Detección */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                      D
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      25 PPM
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Detección <span className="font-normal text-slate-400 dark:text-slate-500">(Detection)</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Permite saber con total certeza si hay una persona o un objeto en la escena, aunque no se distingan sus rasgos.
                  </p>
                </div>
              </div>

              {/* O - Observación */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                      O
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      62 PPM
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Observación <span className="font-normal text-slate-400 dark:text-slate-500">(Observation)</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ofrece detalles generales, como el color de la ropa de una persona o el tipo de vehículo, y permite ver el entorno.
                  </p>
                </div>
              </div>

              {/* R - Reconocimiento */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                      R
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      125 PPM
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Reconocimiento <span className="font-normal text-slate-400 dark:text-slate-500">(Recognition)</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Permite verificar si la persona que aparece en pantalla es alguien que ya conoces o has visto antes.
                  </p>
                </div>
              </div>

              {/* I - Identificación */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                      I
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      250 PPM
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Identificación <span className="font-normal text-slate-400 dark:text-slate-500">(Identification)</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Es el nivel de mayor detalle. Permite identificar a un desconocido de forma indiscutible (por ejemplo, para reconocimiento facial o leer una matrícula).
                  </p>
                </div>
              </div>
            </div>

            {/* Recuadro Resumen */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>En resumen:</strong> Sirve para que los usuarios sepan exactamente a qué distancia una cámara es capaz de detectar, observar, reconocer o identificar un objetivo.
              </p>
            </div>
          </section>

          {/* TEMA 2: SMD (SMART MOTION DETECTION) */}
          <section
            id="smd"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/data/images/smd-tight.png"
                  alt="SMD"
                  className="h-6 sm:h-7 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/smd-tight.png';
                  }}
                />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  SMD - Smart Motion Detection (Detección de Movimiento Inteligente)
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tecnología de análisis neuronal mediante algoritmos de Deep Learning diseñada para clasificar objetivos en escena, priorizar eventos relevantes y filtrar drásticamente falsas alarmas provocadas por factores ambientales o animales.
            </p>

            {/* Evolución de Versiones SMD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* SMD 1.0 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      SMD 1.0
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      95% reducción
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Clasificación Esencial
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Clasificación básica: humanos y vehículos a motor.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span><strong>95%</strong> de reducción de falsos positivos (falsas alarmas &lt; 5%).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SMD 2.0 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      SMD 2.0
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      98% efectividad
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Precisión y Perímetro
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Mayor distancia focal y precisión mejorada en humanos y vehículos.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Añade Cruce de línea y perímetro (Tripwire / Perimeter).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span><strong>98%</strong> de efectividad (falsas alarmas &lt; 2%).</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SMD 3.0 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      SMD 3.0
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      99% efectividad
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Multi-Objetivo y Fuego
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Suma vehículos no motorizados (bicicletas/motos) y mascotas (perros/gatos).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Detección óptica temprana de fuego.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>Elimina casi la totalidad de disparos erróneos por animales.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-1">•</span>
                      <span><strong>99%</strong> de efectividad (falsas alarmas &lt; 1%).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* TEMA 3: COLOR MAKER */}
          <section
            id="colormaker"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/data/images/colormaker-tight.png"
                  alt="Color Maker"
                  className="h-6 sm:h-7 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/colormaker-tight.png';
                  }}
                />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Color Maker
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tecnología de Tiandy que graba en color real las 24 horas, sin pasar nunca a blanco y negro. Combina un lente de apertura ultra amplia, un sensor que exprime la poca luz ambiental y luz LED cálida para responder en oscuridad total.
            </p>

            {/* Ventajas */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ventajas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ventaja 1: Identificación exacta */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Identificación exacta
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Muestra el color real de autos, ropa y rasgos sin pasar a blanco y negro.
                  </p>
                </div>

                {/* Ventaja 2: Cero deslumbramientos */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Cero deslumbramientos
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Elimina el clásico destello blanco del infrarrojo que vuelve irreconocibles los rostros.
                  </p>
                </div>

                {/* Ventaja 3: Disuasión activa */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Disuasión activa
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Su iluminación tenue acompaña la escena y hace notar la presencia de la cámara.
                  </p>
                </div>
              </div>
            </div>

            {/* Recuadro de Aplicación Ideal */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Ideal para implementar en:</strong> Entradas de comercios, accesos residenciales, fachadas y estacionamientos donde la iluminación es baja y reconocer personas o vehículos con claridad es clave.
              </p>
            </div>
          </section>

          {/* TEMA 4: POLAR DAY */}
          <section
            id="polar-day"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/data/images/polarday-tight.png"
                  alt="Polar Day"
                  className="h-6 sm:h-7 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/polarday-tight.png';
                  }}
                />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Polar Day
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tecnología de Tiandy diseñada para lograr imágenes a todo color en entornos nocturnos extremadamente oscuros sin depender de reflectores de luz visible. Utiliza sensores de gran tamaño, lentes de apertura extrema y procesamiento avanzado de imagen asistido por algoritmos de IA para convertir la noche en día de forma silenciosa.
            </p>

            {/* Ventajas */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ventajas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ventaja 1: Color sin contaminación lumínica */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Color sin contaminación lumínica
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Captura video en color real sin encender luces LED visibles, evitando molestias a vecinos o encandilar a conductores.
                  </p>
                </div>

                {/* Ventaja 2: Vigilancia 100% discreta */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Vigilancia 100% discreta
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    No delata la posición exacta del equipo ni altera el entorno nocturno, ideal para monitoreo encubierto.
                  </p>
                </div>

                {/* Ventaja 3: Rendimiento ultra sensible */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Rendimiento ultra sensible
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Extrae información cromática y nitidez incluso con luz estelar mínima donde otras cámaras forzarían el modo infrarrojo.
                  </p>
                </div>
              </div>
            </div>

            {/* Recuadro de Aplicación Ideal */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Ideal para implementar en:</strong> Zonas residenciales privadas, plazas públicas, áreas rurales, perímetros extensos y cualquier espacio donde se exija visión a color pero esté prohibida o desaconsejada la luz artificial continua.
              </p>
            </div>
          </section>

          {/* TEMA 5: EARLY WARNING (EW) */}
          <section
            id="early-warning"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Early Warning (EW)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tecnología de disuasión activa de Tiandy que pasa de la vigilancia pasiva a la prevención en tiempo real. Al detectar una intrusión, el equipo interviene de forma automática combinando destellos de luz estroboscópica roja y azul, advertencias por altavoz integrado y activación de alarmas externas para frenar al intruso en el acto.
            </p>

            {/* Ventajas */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ventajas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ventaja 1: Prevención en el momento */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Prevención en el momento
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    No se limita a registrar el delito como testigo pasivo; actúa al instante para disuadir al sospechoso antes de que concrete el daño o robo.
                  </p>
                </div>

                {/* Ventaja 2: Impacto visual y sonoro inmediato */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Impacto visual y sonoro inmediato
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Los estrobos bicolor y las alertas de voz (pregrabadas o en vivo desde la app) señalan directamente al infractor que fue detectado.
                  </p>
                </div>

                {/* Ventaja 3: Integración total con sistemas existentes */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Integración total con sistemas existentes
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Su salida de relé permite disparar sirenas adicionales, encender reflectores o enlazar paneles de alarma externos ante una intrusión.
                  </p>
                </div>
              </div>
            </div>

            {/* Recuadro de Aplicación Ideal */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Ideal para implementar en:</strong> Perímetros residenciales o industriales, depósitos de mercadería, estacionamientos abiertos, obras en construcción y accesos no autorizados donde se requiera frenar el ingreso antes de que ocurra el incidente.
              </p>
            </div>
          </section>

          {/* TEMA 6: COMPRESIÓN S+265 */}
          <section
            id="codec-s265"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                S+265 (Smart H.265)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tecnología de compresión avanzada de Tiandy que optimiza el estándar H.265 mediante codificación inteligente por regiones de interés (ROI). El algoritmo analiza la escena para comprimir drásticamente las zonas estáticas de fondo y concentrar la máxima tasa de bits y nitidez en los objetos, personas o vehículos en movimiento.
            </p>

            {/* Ventajas */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ventajas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ventaja 1: Ahorro masivo de almacenamiento */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Ahorro masivo de almacenamiento
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Reduce hasta un 75% el espacio en disco frente al códec convencional, multiplicando los días de grabación sin cambiar de disco duro.
                  </p>
                </div>

                {/* Ventaja 2: Bajo consumo de ancho de banda */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Bajo consumo de ancho de banda
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Alivia notablemente el tráfico en la red local y permite una visualización remota fluida incluso en conexiones móviles o enlaces limitados.
                  </p>
                </div>

                {/* Ventaja 3: Calidad donde importa */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Calidad donde importa
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mantiene intacta la definición en rostros, matrículas y movimientos clave sin desperdiciar recursos en fondos fijos.
                  </p>
                </div>
              </div>
            </div>

            {/* Recuadro de Aplicación Ideal */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Ideal para implementar en:</strong> Proyectos de videovigilancia continua que requieran largos periodos de grabación, instalaciones con múltiples cámaras de alta resolución o sistemas con enlaces de red y capacidad de almacenamiento limitados.
              </p>
            </div>
          </section>

          {/* TEMA 7: ALIMENTACIÓN POE Y MODO EXTENDIDO 250M */}
          <section
            id="poe-switches"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Alimentación PoE y Modo CCTV Extend 250m
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Guía técnica sobre estándares de alimentación Power over Ethernet y el conmutador de larga distancia en switches Tiandy:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">PoE Estándar (802.3af)</span>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">Hasta 15.4 Watts</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Recomendado para cámaras fijas convencionales (Bullet y Domo de 2MP a 4MP con iluminación IR estándar).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">PoE+ Alta Potencia (802.3at)</span>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">Hasta 30 Watts</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Necesario para cámaras ColorMaker de luz blanca, modelos PTZ móviles, cámaras panorámicas duales y Early Warning.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Modo CCTV Extend (250m)</span>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">10 Mbps / 250 Metros</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  Supera el límite Ethernet de 100 metros utilizando cable UTP 100% cobre Cat5e/Cat6 con PoE Watchdog automático.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 8: VCA (VIDEO CONTENT ANALYTICS) */}
          <section
            id="vca"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                VCA - Analíticas de Video (Video Content Analytics)
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Conjunto de reglas algorítmicas de análisis inteligente sobre secuencias de video para la detección automática y precisa de comportamientos perimetrales sospechosos.
            </p>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Reglas Perimetrales Configurables</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Incluye <strong>Cruce de línea (Tripwire)</strong> unidireccional o bidireccional, <strong>Doble cruce de línea</strong>, <strong>Intrusión en perímetro</strong>, <strong>Objeto abandonado / retirado</strong> y <strong>Deambuleo (Loitering)</strong>.
              </p>
            </div>
          </section>

          {/* TEMA 9: GRADOS IP & IK */}
          <section
            id="grados-ip-ik"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Grados de Protección Intemperie e Impacto (IP67 / IK10)
              </h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Normas internacionales que certifican la resistencia mecánica y climática del encapsulado para garantizar operación ininterrumpida a la intemperie:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Estándar IP (IEC 60529)</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">IP67</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>6 (Primer dígito):</strong> Hermético al polvo. Totalmente protegido contra ingreso de partículas sólidas.<br/>
                  <strong>7 (Segundo dígito):</strong> Resistente a inmersión temporal en agua hasta 1 metro de profundidad durante 30 minutos sin filtraciones. Apto para tormentas severas.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Estándar IK (IEC 62262)</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">IK10</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protección antivandálica con carcasa metálica y domo de policarbonato reforzado.<br/>
                  Resiste impactos mecánicos directos de hasta <strong>20 Joules</strong> (equivalente a la caída de una masa de 5 kg desde 40 cm de altura).
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>

    </div>
  );
};
