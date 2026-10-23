import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Layers,
  Search,
  ChevronRight,
  ChevronDown,
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
    id: 'gamas-camaras',
    title: 'Gamas de Cámaras IP',
    shortDesc: 'Series AK (Entry), SK (SMB), LK (Pro), Tian (Wi-Fi) y Sunflower (Solar 4G).',
    badge: ''
  },
  {
    id: 'gamas-nvr',
    title: 'Gamas de Grabadores NVR',
    shortDesc: 'Series AK (Entry), SK (SMB), Light AI, LK (Pro) y AI NVR (Servidores forenses).',
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
    id: 'codec-s265',
    title: 'S+265 (Smart H.265)',
    shortDesc: 'Compresión inteligente por regiones de interés con hasta 75% de ahorro en almacenamiento.',
    badge: ''
  },
  {
    id: 'early-warning',
    title: 'Early Warning (EW)',
    shortDesc: 'Disuasión activa en tiempo real con estrobos bicolor, voz y salida de alarma.',
    badge: ''
  },
  {
    id: 'dori',
    title: 'DORI',
    shortDesc: 'Detección, Observación, Reconocimiento e Identificación (IEC EN62676-4)',
    badge: ''
  },
  {
    id: 'vca',
    title: 'VCA - Video Content Analytics (Analíticas de Video)',
    shortDesc: 'Reglas algorítmicas avanzadas: Perímetro, comportamiento, biometría, EHS, retail y analítica vehicular.',
    badge: 'Deep Learning'
  }
];

export const WikiPage: React.FC = () => {
  // Filtro de búsqueda del índice
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('gamas-camaras');

  // Estado de secciones desplegadas (por defecto primera abierta para previsualización inmediata)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'gamas-camaras': true,
    'gamas-nvr': false,
    'smd': false,
    'colormaker': false,
    'polar-day': false,
    'codec-s265': false,
    'early-warning': false,
    'dori': false,
    'vca': false
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allOpen = useMemo(() => {
    return WIKI_TOPICS.every((t) => openSections[t.id]);
  }, [openSections]);

  const toggleAll = () => {
    if (allOpen) {
      setOpenSections({});
    } else {
      const all: Record<string, boolean> = {};
      WIKI_TOPICS.forEach((t) => {
        all[t.id] = true;
      });
      setOpenSections(all);
    }
  };

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
    // Asegurar que la sección seleccionada desde el índice se abra automáticamente
    setOpenSections((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
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
    }, 60);
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-[11px] font-semibold text-tiandy-600 dark:text-tiandy-400 hover:text-tiandy-700 dark:hover:text-tiandy-300 transition-colors cursor-pointer select-none"
                  title={allOpen ? 'Colapsar todas las tarjetas' : 'Desplegar todas las tarjetas'}
                >
                  {allOpen ? 'Colapsar' : 'Expandir'}
                </button>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {WIKI_TOPICS.length}
                </span>
              </div>
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

          {/* TEMA 1: GAMAS DE CÁMARAS IP */}
          <section
            id="gamas-camaras"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['gamas-camaras'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('gamas-camaras')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['gamas-camaras'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                Gamas de Cámaras IP (Network Cameras)
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['gamas-camaras'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['gamas-camaras'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['gamas-camaras'] && (
              <>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Estructura de gamas de videovigilancia IP Tiandy: desde soluciones iniciales para pequeños comercios hasta infraestructura crítica de alta exigencia y sistemas solares autónomos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* AK IPC */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          AK IPC
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Entry-level / Nivel de entrada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        La gama inicial pensada para presupuestos ajustados que buscan la confiabilidad de la marca sin costos elevados.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Monitoreo estándar día/noche, compresión eficiente S+265 y configuración rápida tipo plug &amp; play.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Pequeños comercios, hogares y oficinas que requieren videovigilancia básica y efectiva.</span>
                      </div>
                    </div>
                  </div>

                  {/* SK IPC */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          SK IPC
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          SMB / Pequeñas y medianas empresas
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        La serie intermedia y versátil, orientada al sector comercial que exige mayor rendimiento y resistencia.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Mejor respuesta en baja luminosidad (compatible con Color Maker), analíticas inteligentes perimetrales (cruce de línea, intrusión) y carcasas más robustas.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Depósitos, tiendas de alta rotación, parkings y accesos principales de empresas.</span>
                      </div>
                    </div>
                  </div>

                  {/* LK IPC */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          LK IPC
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Professional / Nivel profesional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        La línea de alta exigencia técnica diseñada para infraestructura crítica y proyectos de gran escala.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Sensores de alta sensibilidad (Polar Day), rango dinámico amplio (WDR real), analíticas de video avanzadas (VCA) con clasificación de personas/vehículos y protección climática severa.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Industrias, banca, predios logísticos, perímetros extensos y proyectos corporativos o públicos.</span>
                      </div>
                    </div>
                  </div>

                  {/* Tian */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          Tian
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Wireless Camera / Cámaras inalámbricas
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Línea Wi-Fi pensada para resolver espacios donde tirar cable de red resulta costoso o invasivo.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Conectividad Wi-Fi estable, audio bidireccional integrado y control directo desde la app EasyLive Plus.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Oficinas temporales, locales comerciales pequeños y viviendas sin infraestructura de cableado UTP preinstalada.</span>
                      </div>
                    </div>
                  </div>

                  {/* Sunflower */}
                  <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          Sunflower
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Solar &amp; Battery Integrated / Solar con batería integrada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Sistema de videovigilancia autónomo que integra en un solo equipo panel solar, batería recargable y conectividad inalámbrica o 4G.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Independencia total de red eléctrica y datos cableados, con gestión de bajo consumo para operar incluso en días nublados.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Zonas rurales, campos, obras en construcción, predios abiertos o puntos remotos sin red eléctrica.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* TEMA 2: GAMAS DE GRABADORES NVR */}
          <section
            id="gamas-nvr"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['gamas-nvr'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('gamas-nvr')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['gamas-nvr'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                Gamas de Grabadores de Red (NVR)
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['gamas-nvr'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['gamas-nvr'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['gamas-nvr'] && (
              <>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ecosistema de grabación y gestión Tiandy: desde grabadores compactos residenciales hasta servidores con Inteligencia Artificial forense para seguridad de misión crítica.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* AK NVR */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          AK NVR
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Entry-level / Nivel de entrada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Grabadores compactos para proyectos de pocos canales y administración simple.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Operación silenciosa, bajo consumo eléctrico y soporte de compresión S+265 para maximizar los días de grabación en discos SATA convencionales.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Residencias y pequeños comercios con sistemas de 4 a 8 cámaras.</span>
                      </div>
                    </div>
                  </div>

                  {/* SK NVR */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          SK NVR
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          SMB / Pequeñas y medianas empresas
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Grabadores equilibrados con mayor ancho de banda y capacidad de almacenamiento.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Mayor tasa de bits de entrada/salida, soporte para múltiples discos duros y recepción fluida de eventos generados por cámaras inteligentes.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Sucursales, locales comerciales medianos y edificios corporativos con monitoreo permanente.</span>
                      </div>
                    </div>
                  </div>

                  {/* Light AI NVR */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          Light AI NVR
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Inteligencia artificial ligera integrada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Grabadores con motor de IA en el propio equipo para agregar funciones avanzadas a cámaras estándar.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Clasificación inteligente de personas y vehículos directamente desde el grabador, reduciendo falsas alarmas y agilizando la búsqueda forense sin obligar a cambiar todas las cámaras por modelos costosos.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Obras de modernización o instalaciones existentes que necesitan análisis inteligente con presupuesto controlado.</span>
                      </div>
                    </div>
                  </div>

                  {/* LK NVR */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          LK NVR
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Professional / Nivel profesional
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Equipos de alto rendimiento diseñados para cargas continuas y demandas críticas de video.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Múltiples bahías de discos (soporte de arreglos RAID en modelos avanzados), decodificación multicanal en 4K y alto ancho de banda de red.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Centros de monitoreo, plantas industriales, hospitales y centros de distribución con decenas de cámaras concurrentes.</span>
                      </div>
                    </div>
                  </div>

                  {/* AI NVR */}
                  <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          AI NVR
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Inteligencia artificial avanzada
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Servidores NVR de máxima gama dedicados al análisis masivo y estructuración de datos en tiempo real.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Prestaciones clave: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Reconocimiento facial, comparación de rostros con listas de control (listas negras/blancas), conteo de personas, lectura de matrículas (LPR) y búsqueda forense por múltiples atributos simultáneos.</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">Ideal para: </strong>
                        <span className="text-slate-600 dark:text-slate-400">Centros comerciales, terminales de transporte, estadios, campus universitarios y proyectos de seguridad urbana de alta densidad.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* TEMA 3: SMD (SMART MOTION DETECTION) */}
          <section
            id="smd"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['smd'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('smd')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['smd'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                <span className="sr-only">SMD - </span>
                <img
                  src="/data/images/smd-tight.png"
                  alt="SMD"
                  className="h-4 sm:h-5 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/smd-tight.png';
                  }}
                />
                <span>— Smart Motion Detection (Detección de Movimiento Inteligente)</span>
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['smd'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['smd'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['smd'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 4: COLOR MAKER */}
          <section
            id="colormaker"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['colormaker'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('colormaker')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['colormaker'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="flex items-center">
                <span className="sr-only">Color Maker</span>
                <img
                  src="/data/images/colormaker-tight.png"
                  alt="Color Maker"
                  className="h-7 sm:h-8 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/colormaker-tight.png';
                  }}
                />
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['colormaker'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['colormaker'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['colormaker'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 5: POLAR DAY */}
          <section
            id="polar-day"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['polar-day'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('polar-day')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['polar-day'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="flex items-center">
                <span className="sr-only">Polar Day</span>
                <img
                  src="/data/images/polarday-tight.png"
                  alt="Polar Day"
                  className="h-7 sm:h-8 w-auto object-contain drop-shadow-2xs select-none shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/data/badges/polarday-tight.png';
                  }}
                />
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['polar-day'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['polar-day'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['polar-day'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 6: COMPRESIÓN S+265 */}
          <section
            id="codec-s265"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['codec-s265'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('codec-s265')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['codec-s265'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                S+265 (Smart H.265)
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['codec-s265'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['codec-s265'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['codec-s265'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 7: EARLY WARNING (EW) */}
          <section
            id="early-warning"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['early-warning'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('early-warning')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['early-warning'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                Early Warning (EW)
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['early-warning'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['early-warning'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['early-warning'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 8: DORI */}
          <section
            id="dori"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['dori'] ? 'p-6 sm:p-7 space-y-5' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Header del Tema */}
            <div
              onClick={() => toggleSection('dori')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['dori'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                DORI - Detección Observación Reconocimiento Identificación
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['dori'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['dori'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['dori'] && (
              <>
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
              </>
            )}
          </section>

          {/* TEMA 9: VCA (VIDEO CONTENT ANALYTICS) */}
          <section
            id="vca"
            className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all scroll-mt-24 ${
              openSections['vca'] ? 'p-6 sm:p-7 space-y-6' : 'p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              onClick={() => toggleSection('vca')}
              className={`flex items-center justify-between gap-4 cursor-pointer select-none group ${
                openSections['vca'] ? 'border-b border-slate-100 dark:border-slate-800 pb-4' : ''
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiandy-600 dark:group-hover:text-tiandy-400 transition-colors">
                VCA — Video Content Analytics (Analíticas de Video)
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {openSections['vca'] ? 'Ocultar' : 'Ver detalle'}
                </span>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openSections['vca'] ? 'rotate-180 text-tiandy-500' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {openSections['vca'] && (
              <>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Conjunto de reglas algorítmicas de análisis inteligente sobre secuencias de video para la detección automática y precisa de eventos perimetrales, comportamiento humano, métricas comerciales, seguridad ocupacional y condiciones operativas.
                </p>

            {/* 1. Seguridad Perimetral y Control de Intrusión */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  01
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Seguridad Perimetral y Control de Intrusión
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Tripwire */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tripwire</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Cruce de línea</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Detecta cuando una persona o vehículo atraviesa una línea virtual dibujada en la pantalla, configurando el sentido del cruce (bidireccional, solo entrada o solo salida).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Muros perimetrales, accesos vehiculares, pasillos de sentido único y límites de propiedad donde el cruce esté prohibido.</span>
                  </div>
                </div>

                {/* Perimeter Intrusion */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Perimeter Intrusion</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Intrusión perimetral</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Monitorea un área cerrada en pantalla y dispara una alerta si una persona o vehículo entra o permanece dentro de esa zona delimitada.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Zonas de acceso restringido, patios internos, predios cerrados y depósitos de mercadería durante la noche.</span>
                  </div>
                </div>

                {/* Double Tripwire */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Double Tripwire</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Doble cruce de línea</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Activa la alarma únicamente si un objetivo cruza dos líneas virtuales consecutivas en un orden y tiempo predefinidos.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Falsos perímetros, cruces de vías férreas, vías de alta velocidad y filtros de accesos para evitar falsas alarmas provocadas por personas que solo rozan un cerco.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Comportamiento y Orden Público */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  02
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Comportamiento y Orden Público
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Loitering */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Loitering</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Merodeo</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Identifica cuando un individuo permanece o deambula dentro de un área específica durante más tiempo del límite fijado.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Zonas de cajeros automáticos, veredas bancarias, entradas a condominios residenciales y paradas de transporte en horarios de bajo movimiento.</span>
                  </div>
                </div>

                {/* Running */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Running</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Carrera (persona corriendo)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Reconoce aceleraciones bruscas en la velocidad de desplazamiento de una persona, diferenciando el paso regular de una huida o persecución.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Andenes de estaciones, pasillos escolares o universitarios, centros comerciales y perímetros industriales para detectar fugas o emergencias.</span>
                  </div>
                </div>

                {/* Crowd Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Crowd Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de aglomeraciones</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Mide la densidad y concentración de personas en una zona delimitada, disparando una alerta si se supera el umbral previsto.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Plazas, ingresos a eventos masivos, andenes de transporte público y accesos comerciales para control de aforo y prevención de incidentes.</span>
                  </div>
                </div>

                {/* Parking */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Parking</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Estacionamiento indebido</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Detecta vehículos detenidos en áreas no autorizadas cuando superan el tiempo de tolerancia establecido.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Dársenas de carga y descarga, carriles de emergencia, rampas de cocheras y accesos a hospitales.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Vigilancia de Objetos y Protección del Dispositivo */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  03
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vigilancia de Objetos y Protección del Dispositivo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Object Abandoned */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Object Abandoned</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Objeto abandonado</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Detecta si un elemento u objeto es depositado y desatendido en una zona delimitada durante un lapso de tiempo configurable.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Salas de espera, aeropuertos, terminales de buses, recepciones corporativas y salidas de emergencia para prevenir bloqueos o paquetes sospechosos.</span>
                  </div>
                </div>

                {/* Object Lost (Missing) */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Object Lost (Missing)</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Objeto removido (desaparecido)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Dispara un evento inmediato si un objeto predeterminado de la escena es retirado o desplazado de su ubicación original.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Museos, galerías de arte, salas de servidores, exhibidores comerciales y áreas de herramientas o instrumental de alto valor.</span>
                  </div>
                </div>

                {/* Video Abnormal (Scene Change) */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Video Abnormal (Scene Change)</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Alteración de video (cambio de escena)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Identifica si la cámara fue desenfocada, bloqueada con pintura o movida manualmente por actos vandálicos.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Cámaras en vía pública al alcance de personas, garajes, túneles y perímetros vulnerables a sabotaje.</span>
                  </div>
                </div>

                {/* Abnormal Audio Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Abnormal Audio Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de audio anómalo</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Monitorea el entorno acústico a través de micrófono para alertar ante picos de decibeles o ruidos inusuales (gritos, impactos, disparos o rotura de cristales).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Aulas, estacionamientos subterráneos, ventanillas de atención al público y entidades bancarias donde la escena queda fuera del ángulo visual.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Inteligencia Comercial y Métricas de Negocio */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  04
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Inteligencia Comercial y Métricas de Negocio
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* People Counting */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">People Counting</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Conteo de personas</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Registra entradas y salidas de personas a través de una línea de control, generando estadísticas de afluencia y cálculo de ocupación neta en tiempo real.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Tiendas minoristas para calcular tasas de conversión comercial, recintos públicos y centros culturales con límite de aforo estricto.</span>
                  </div>
                </div>

                {/* Heat Map */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Heat Map</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Mapa de calor</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Muestra gráficamente por colores los puntos de mayor permanencia y flujo de personas durante lapsos determinados.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Supermercados y locales comerciales para evaluar el impacto de góndolas, promociones y diseñar la circulación de pasillos.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Seguridad Ocupacional (EHS) y Supervisión Laboral */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  05
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Seguridad Ocupacional (EHS) y Supervisión Laboral
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Helmet (Hardhat) Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Helmet (Hardhat) Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de uso de casco</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Verifica que el personal porte el casco de seguridad obligatorio en la cabeza, generando una alarma inmediata ante operarios sin protección.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Obras en construcción, fábricas, minería, plantas químicas y talleres industriales para auditoría de prevención de riesgos.</span>
                  </div>
                </div>

                {/* High-Visibility Vest Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">High-Visibility Vest Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de chaleco reflectivo</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Comprueba que operarios o visitas que ingresen a un área operativa peligrosa lleven puesto el chaleco o indumentaria reflectiva exigida.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Centros de distribución logística con autoelevadores, pistas aeroportuarias, obras viales y depósitos.</span>
                  </div>
                </div>

                {/* On-Duty Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">On-Duty Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de abandono de puesto</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Monitorea una estación de trabajo crítica y dispara una alerta si el operador responsable deja su puesto o se ausenta más tiempo del tolerado.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Garitas de guardia, centros de monitoreo CCTV, cajas de cobro, recepciones y puestos de operación de maquinaria peligrosa.</span>
                  </div>
                </div>

                {/* Sleeping Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sleeping Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección de somnolencia o sueño en puesto</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Identifica patrones posturales prolongados (cabeza apoyada sobre la mesa o inclinación anormal) que indiquen que el personal se durmió en su turno.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Garitas de seguridad perimetral nocturna, puestos de vigilancia física y salas de control de alarmas.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Reconocimiento Biométrico y Estructuración de Objetos */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  06
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reconocimiento Biométrico y Estructuración de Objetos
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Face Recognition & Comparison */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Face Recognition &amp; Comparison</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Reconocimiento y comparación facial</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Extrae la biometría del rostro y la compara contra bases de datos en tiempo real (listas blancas para acceso o listas negras para alerta).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Accesos de personal sin contacto, oficinas corporativas, zonas VIP, casinos y comercios para detección de infractores recurrentes.</span>
                  </div>
                </div>

                {/* Face Capture & Attribute Extraction */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Face Capture &amp; Attribute Extraction</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Captura de rostros y atributos</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Recorta la imagen facial y detecta atributos demográficos aproximados (rango de edad, género, uso de gafas o mascarilla).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Informes demográficos de clientes en retail y soporte para búsquedas forenses posteriores.</span>
                  </div>
                </div>

                {/* Vehicle & Human Metadata */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vehicle &amp; Human Metadata</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Metadatos estructurados de objetivos</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Descompone el video en datos estructurados de personas (color de ropa superior e inferior, bolso, paraguas) y vehículos (tipo, color), permitiendo búsquedas por filtros en segundos.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Auditoría forense en NVRs AI y software Easy7 sobre grabaciones extensas sin necesidad de revisar horas de video continuo.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Tránsito y Analíticas Vehiculares (LPR / ANPR) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  07
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tránsito y Analíticas Vehiculares (LPR / ANPR)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* ANPR / LPR */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">ANPR / LPR</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Lectura automática de matrículas</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Captura, lee y almacena caracteres alfanuméricos de matrículas vehiculares en tiempo real, contrastándolos con listas de acceso.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Peajes, entradas a barrios cerrados, edificios residenciales y estacionamientos tarifados para apertura automática de barreras.</span>
                  </div>
                </div>

                {/* Vehicle Counting & Flow */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vehicle Counting &amp; Flow</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Conteo y sentido vehicular</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Cuantifica el volumen de tránsito vehicular, clasifica tipos de vehículos y determina sentidos de circulación o giros prohibidos.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Gestión de tráfico urbano, accesos a parques industriales y auditoría de capacidad en aparcamientos de varios niveles.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Detección Térmica y Protección contra Incendios */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  08
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Detección Térmica y Protección contra Incendios
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Fire & Smoke Detection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fire &amp; Smoke Detection</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Detección visual de humo y fuego</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Identifica visualmente patrones de llamas o columnas de humo mediante procesamiento de imagen antes de que el calor alcance un detector tradicional.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Naves industriales con techos altos, madereras, depósitos de reciclaje y predios abiertos donde no aplican detectores de humo estándar.</span>
                  </div>
                </div>

                {/* Thermal Early Warning */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Thermal Early Warning</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">/ Advertencia térmica temprana</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Qué hace:</strong> Monitorea por radiación infrarroja la temperatura de superficies o equipamiento eléctrico, alertando ante sobrecalentamientos antes de que se inicie fuego.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <strong className="text-slate-800 dark:text-slate-200">Implementación: </strong>
                    <span className="text-slate-600 dark:text-slate-400">Tableros de media tensión, transformadores, subestaciones eléctricas y salas de racks de baterías.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

        </main>
      </div>

    </div>
  );
};
