import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Calculator,
  Sun,
  Eye,
  ShieldAlert,
  HardDrive,
  Zap,
  Cpu,
  ShieldCheck,
  Check,
  Layers,
  Search,
  ChevronRight,
  Hash,
  ArrowUp,
  Info
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
    title: 'Calculadora y Estándar DORI (EN 62676-4)',
    shortDesc: 'Cálculo de alcances ópticos normativos para detección, reconocimiento e identificación.',
    badge: 'Norma EN 62676-4'
  },
  {
    id: 'colormaker',
    title: 'Tecnología ColorMaker (Visión a Color 24/7)',
    shortDesc: 'Apertura F1.0, sensores BSI de alta sensibilidad y luz cálida de apoyo.',
    badge: 'Hardware Óptico'
  },
  {
    id: 'polar-day',
    title: 'Polar Day y Super WDR (120dB a 140dB)',
    shortDesc: 'Compensación de contraluces severos y muestreo multicuadro sincronizado.',
    badge: 'Procesamiento ISP'
  },
  {
    id: 'early-warning',
    title: 'Early Warning (EW) - Disuasión Activa',
    shortDesc: 'Estrobos de luz roja y azul, altavoz disuasorio y alertas acústicas en tiempo real.',
    badge: 'Disuasión Activa'
  },
  {
    id: 'codec-s265',
    title: 'Compresión y Códec S+265 (Smart H.265)',
    shortDesc: 'Ahorro de hasta 75% en almacenamiento y consumo de ancho de banda de red.',
    badge: 'Compresión de Video'
  },
  {
    id: 'poe-switches',
    title: 'Alimentación PoE y Modo CCTV Extend 250m',
    shortDesc: 'Presupuestos de potencia, estándares 802.3af/at y transmisión a larga distancia.',
    badge: 'Infraestructura PoE'
  },
  {
    id: 'ia-smd-vca',
    title: 'Inteligencia Artificial: SMD y Analíticas VCA',
    shortDesc: 'Filtrado de falsas alarmas de humanos y vehículos, Tripwire y protección perimetral.',
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
  // Calculadora DORI interactiva
  const [resolucionMP, setResolucionMP] = useState<number>(2); // 2, 4, 5, 8 MP
  const [focalMm, setFocalMm] = useState<number>(2.8); // 2.8, 4.0, 6.0, 12.0 mm

  // Filtro de búsqueda del índice
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string>('dori');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estimación DORI basada en sensor 1/2.8"
  const baseFactor = focalMm * Math.sqrt(resolucionMP / 2);
  const doriDetectar = Math.round(baseFactor * 14.5);
  const doriObservar = Math.round(doriDetectar * 0.40);
  const doriReconocer = Math.round(doriDetectar * 0.20);
  const doriIdentificar = Math.round(doriDetectar * 0.10);

  // Filtrado de temas en el índice
  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return WIKI_TOPICS;
    return WIKI_TOPICS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q) || t.badge.toLowerCase().includes(q)
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

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
                        <div className={`text-[10px] truncate mt-0.5 font-normal ${
                          isActive ? 'text-slate-300 dark:text-slate-400' : 'text-slate-400'
                        }`}>
                          {topic.badge}
                        </div>
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

          {/* TEMA 1: CALCULADORA Y ESTÁNDAR DORI */}
          <section
            id="dori"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-5 scroll-mt-24"
          >
            {/* Header del Tema */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Norma EN 62676-4
                  </span>
                  <span className="text-xs text-slate-400">• Sección 01</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Calculadora y Estándar DORI (EN 62676-4)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('dori')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
                title="Copiar enlace a este tema"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'dori' ? 'Copiado' : '#dori'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El estándar europeo <strong>EN 62676-4</strong> define los niveles de densidad de píxeles necesarios según el objetivo de seguridad en escena: Detectar (25 px/m), Observar (63 px/m), Reconocer (125 px/m) e Identificar (250 px/m).
            </p>

            {/* Selector de Parámetros de Cálculo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Resolución del Sensor (Megapíxeles)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 2, label: '2 MP' },
                    { val: 4, label: '4 MP' },
                    { val: 5, label: '5 MP' },
                    { val: 8, label: '8 MP (4K)' }
                  ].map((res) => (
                    <button
                      key={res.val}
                      onClick={() => setResolucionMP(res.val)}
                      className={`rounded-lg py-1.5 px-2 text-xs font-mono font-bold transition-all ${
                        resolucionMP === res.val
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Distancia Focal del Lente
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 2.8, label: '2.8 mm' },
                    { val: 4.0, label: '4.0 mm' },
                    { val: 6.0, label: '6.0 mm' },
                    { val: 12.0, label: '12.0 mm' }
                  ].map((len) => (
                    <button
                      key={len.val}
                      onClick={() => setFocalMm(len.val)}
                      className={`rounded-lg py-1.5 px-2 text-xs font-mono font-bold transition-all ${
                        focalMm === len.val
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultados DORI con Tarjetas Sobrias */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                  Detectar (25 px/m)
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  {doriDetectar} m
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Determina presencia humana o vehicular en el encuadre.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                  Observar (63 px/m)
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  {doriObservar} m
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Permite distinguir color de vestimenta y sentido de movimiento.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                  Reconocer (125 px/m)
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  {doriReconocer} m
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Permite verificar con certeza si se trata de un conocido o empleado.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                  Identificar (250 px/m)
                </div>
                <div className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  {doriIdentificar} m
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Resolución forense facial apta para evidencia judicial y patentes.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 2: COLORMAKER */}
          <section
            id="colormaker"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Hardware Óptico
                  </span>
                  <span className="text-xs text-slate-400">• Sección 02</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sun className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Tecnología ColorMaker (Visión a Color 24/7)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('colormaker')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'colormaker' ? 'Copiado' : '#colormaker'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              A diferencia de las cámaras infrarrojas convencionales que conmutan a blanco y negro durante la noche perdiendo información cromática crítica, la tecnología <strong>ColorMaker de Tiandy</strong> mantiene imágenes en color nítidas las 24 horas del día.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Apertura Súper Amplia F1.0</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permite hasta 4 veces más entrada de flujo lumínico al sensor en comparación con lentes tradicionales de apertura F2.0.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Sensor BSI de Gran Tamaño</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sensores retroiluminados con mayor área por fotodiodo, reduciendo drásticamente el ruido térmico en penumbra.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Luz Cálida Antideslumbrante 3000K</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Iluminación suave que evita el encandilamiento ocular y no genera sobreexposición blanca sobre patentes o rostros.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 3: POLAR DAY & SUPER WDR */}
          <section
            id="polar-day"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Procesamiento ISP
                  </span>
                  <span className="text-xs text-slate-400">• Sección 03</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Polar Day y Super WDR (120dB a 140dB)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('polar-day')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'polar-day' ? 'Copiado' : '#polar-day'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El algoritmo <strong>Polar Day / Super WDR</strong> compensa escenas con diferencias extremas de iluminación mediante doble exposición sincronizada a nivel de píxel en el procesador ISP.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">True WDR Físico (120dB ~ 140dB)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fusiona en un solo cuadro una toma con tiempo de obturación ultrarrápido (para zonas muy iluminadas) y otra prolongada (para zonas oscuras), evitando siluetas negras en accesos vidriados.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Casos de Uso Recomendados</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ingresos principales de bancos y oficinas con ventanales hacia la calle, portones de depósitos logísticos, peajes y accesos vehiculares a contraluz del sol.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 4: EARLY WARNING (EW) */}
          <section
            id="early-warning"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Disuasión Activa
                  </span>
                  <span className="text-xs text-slate-400">• Sección 04</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Early Warning (EW) - Disuasión Activa
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('early-warning')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'early-warning' ? 'Copiado' : '#early-warning'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mientras que los sistemas convencionales de videovigilancia solo registran lo ocurrido pasivamente, las cámaras con tecnología <strong>Early Warning (EW) de Tiandy</strong> intervienen activamente en el momento en que se produce una intrusión perimetral para disuadir al infractor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Estrobos Rojo y Azul</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Luces intermitentes de alta intensidad que señalan al objetivo que ha sido detectado y enfocado por el sistema.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Altavoz con Mensajes de Voz</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Emisión inmediata de advertencias pregrabadas en español o mensajes personalizados desde la app móvil EasyLive Plus.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Salida de Alarma de Relé</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Contacto seco para vincular sirenas cableadas externas, reflectores perimetrales o paneles de intrusión existentes.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 5: COMPRESIÓN S+265 */}
          <section
            id="codec-s265"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Compresión de Video
                  </span>
                  <span className="text-xs text-slate-400">• Sección 05</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Compresión y Códec S+265 (Smart H.265)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('codec-s265')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'codec-s265' ? 'Copiado' : '#codec-s265'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El algoritmo propietario <strong>S+265</strong> optimiza el estándar H.265 mediante codificación adaptativa por regiones de interés (ROI): comprime drásticamente las zonas estáticas de fondo y reserva la máxima tasa de bits y nitidez para los objetos en movimiento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-0.5">Ahorro en Disco</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">Hasta -75%</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cuadruplica los días de retención en el mismo disco duro SATA.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-0.5">Ancho de Banda</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">Bajo Bitrate</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Menor carga en enlaces de red, switches PoE y conexiones móviles 4G.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-0.5">Compatibilidad</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">ONVIF Profile S/T</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Compatible de retroceso con NVRs y software VMS multimarca.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 6: ALIMENTACIÓN POE Y MODO EXTENDIDO 250M */}
          <section
            id="poe-switches"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Infraestructura PoE
                  </span>
                  <span className="text-xs text-slate-400">• Sección 06</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Alimentación PoE y Modo CCTV Extend 250m
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('poe-switches')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'poe-switches' ? 'Copiado' : '#poe-switches'}</span>
              </button>
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

          {/* TEMA 7: INTELIGENCIA ARTIFICIAL SMD & VCA */}
          <section
            id="ia-smd-vca"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Deep Learning
                  </span>
                  <span className="text-xs text-slate-400">• Sección 07</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Inteligencia Artificial: SMD y Analíticas VCA
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('ia-smd-vca')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'ia-smd-vca' ? 'Copiado' : '#ia-smd-vca'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Las cámaras y NVRs Tiandy integran coprocesadores NPU dedicados al análisis de video mediante redes neuronales profundas (Deep Learning) para eliminar hasta el 98% de las falsas alarmas provocadas por lluvia, animales pequeños, ramas o sombras.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">SMD (Smart Motion Detection)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clasifica en tiempo real los objetivos en <strong>Humanos</strong> y <strong>Vehículos</strong>. Al filtrar eventos en grabaciones, permite encontrar incidentes en segundos sin revisar horas de metraje.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Versiones: SMD 1.0 (Básico) • SMD 2.0 (Clasificación dual) • SMD 3.0 (Largo alcance y multi-objetivo)
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">VCA (Video Content Analytics)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reglas perimetrales avanzadas configurables: <strong>Cruce de línea (Tripwire)</strong> unidireccional o bidireccional, <strong>Doble cruce de línea</strong>, <strong>Intrusión en perímetro</strong>, <strong>Objeto abandonado / retirado</strong> y <strong>Deambuleo (Loitering)</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* TEMA 8: GRADOS IP & IK */}
          <section
            id="grados-ip-ik"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-6 sm:p-7 space-y-4 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Resistencia Física
                  </span>
                  <span className="text-xs text-slate-400">• Sección 08</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  Grados de Protección Intemperie e Impacto (IP67 / IK10)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink('grados-ip-ik')}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 self-start"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{copiedId === 'grados-ip-ik' ? 'Copiado' : '#grados-ip-ik'}</span>
              </button>
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
