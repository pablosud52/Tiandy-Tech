import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  Sun,
  ShieldAlert,
  Zap,
  HardDrive,
  Cpu,
  Calculator,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

export const WikiPage: React.FC = () => {
  // Calculadora DORI interactiva
  const [resolucionMP, setResolucionMP] = useState<number>(2); // 2, 4, 8 MP
  const [focalMm, setFocalMm] = useState<number>(2.8); // 2.8, 4.0, 6.0, 12.0 mm

  // Estimación aproximada basada en sensores típicos 1/2.8"
  // Multiplicador base por mm y por raíz de resolución
  const baseFactor = focalMm * Math.sqrt(resolucionMP / 2);
  const doriDetectar = Math.round(baseFactor * 14.5);
  const doriObservar = Math.round(doriDetectar * 0.40);
  const doriReconocer = Math.round(doriDetectar * 0.20);
  const doriIdentificar = Math.round(doriDetectar * 0.10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <BookOpen className="h-4 w-4" />
          Base de Conocimiento y Guía de Ingeniería
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          Wiki Técnica Tiandy Technologies
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Manual de referencia rápida para integradores, distribuidores e instaladores.
          Explicación de estándares internacionales, tecnologías exclusivas de Tiandy y calculadora de proyectos.
        </p>
      </div>

      {/* SECCIÓN 1: Calculadora DORI Interactiva */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Calculator className="h-4 w-4" /> Herramienta de Cálculo
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Calculadora de Distancias DORI (EN 62676-4)
            </h2>
          </div>
          <div className="text-xs text-slate-500 max-w-xs">
            Selecciona resolución y distancia focal para calcular el alcance óptico normativo en campo.
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Resolución del Sensor (Megapíxeles)
            </label>
            <div className="flex gap-2">
              {[
                { val: 2, label: '2 MP (1080p)' },
                { val: 4, label: '4 MP (2K)' },
                { val: 5, label: '5 MP' },
                { val: 8, label: '8 MP (4K)' }
              ].map((res) => (
                <button
                  key={res.val}
                  onClick={() => setResolucionMP(res.val)}
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
                    resolucionMP === res.val
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Lente Focal (Milímetros)
            </label>
            <div className="flex gap-2">
              {[
                { val: 2.8, label: '2.8 mm (Gran angular ~100°)' },
                { val: 4.0, label: '4.0 mm (~80°)' },
                { val: 6.0, label: '6.0 mm (~55°)' },
                { val: 12.0, label: '12.0 mm (Teleobjetivo)' }
              ].map((len) => (
                <button
                  key={len.val}
                  onClick={() => setFocalMm(len.val)}
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
                    focalMm === len.val
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {len.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Visual Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
              Detectar (25 px/m)
            </div>
            <div className="font-mono text-3xl font-black text-emerald-900 dark:text-emerald-200 my-1">
              {doriDetectar} m
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Permite determinar si hay un vehículo o persona en el encuadre.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
            <div className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">
              Observar (63 px/m)
            </div>
            <div className="font-mono text-3xl font-black text-blue-900 dark:text-blue-200 my-1">
              {doriObservar} m
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Permite ver detalles característicos como color de ropa y dirección.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400">
              Reconocer (125 px/m)
            </div>
            <div className="font-mono text-3xl font-black text-amber-900 dark:text-amber-200 my-1">
              {doriReconocer} m
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Permite verificar con certeza si se trata de un conocido o empleado.
            </p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
            <div className="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-400">
              Identificar (250 px/m)
            </div>
            <div className="font-mono text-3xl font-black text-rose-900 dark:text-rose-200 my-1">
              {doriIdentificar} m
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Resolución forense facial apta para pruebas judiciales y patentes.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Explicación de Tecnologías Clave Tiandy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ColorMaker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Tecnología ColorMaker (Full Color 24/7)
              </h3>
              <span className="text-xs font-semibold text-amber-600">Imágenes a color en total oscuridad</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A diferencia de las cámaras infrarrojas tradicionales que conmutan a blanco y negro de noche,
            la tecnología <strong>ColorMaker de Tiandy</strong> utiliza aperturas súper amplias de <strong>F1.0</strong>,
            sensores BSI de gran tamaño y un iluminador de luz cálida suave que no encandila.
            Esto permite capturar colores reales de vestimenta y vehículos 24/7.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Apertura F1.0 que cuadruplica la entrada de luz respecto a F2.0
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Luz cálida de 3000K respetuosa con la pupila humana
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Evita el efecto de sobreexposición blanca común en IR
            </li>
          </ul>
        </div>

        {/* Polar Day WDR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-500">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Polar Day / Super WDR (120dB ~ 140dB)
              </h3>
              <span className="text-xs font-semibold text-sky-600">Claridad en fuertes contraluces</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            El algoritmo <strong>Polar Day de Tiandy</strong> realiza una exposición multicuadro
            sincronizada a nivel de píxel. Cuando una cámara apunta hacia ventanales soleados o portones de depósitos,
            evita que los rostros queden en silueta negra manteniendo el fondo exterior perfectamente nítido y legible.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              True WDR de 120dB hasta 140dB con muestreo doble
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Ideal para bancos, ingresos vidriados y peajes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Sin parpadeo ni distorsión cromática en zonas de transición
            </li>
          </ul>
        </div>

        {/* Early Warning EW */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-3 text-rose-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Early Warning (EW) - Disuasión Activa
              </h3>
              <span className="text-xs font-semibold text-rose-600">Prevención antes de que ocurra el delito</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            La mayoría de las cámaras solo graban lo que ya sucedió. Las cámaras <strong>Early Warning (EW)</strong>
            incorporan estrobos de luz roja y azul de alta potencia junto con un altavoz que emite mensajes de voz
            personalizados ("Área restringida, retírese de inmediato") o sirena sonora apenas se viola una línea perimetral.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Luces de advertencia estroboscópicas rojas y azules
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Altavoz con audios en español pregrabados o personalizados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Vinculable con relé de alarma mecánico para reflectores o sirenas externas
            </li>
          </ul>
        </div>

        {/* Compresión S+265 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Códec S+265 (Smart H.265)
              </h3>
              <span className="text-xs font-semibold text-emerald-600">Ahorro de hasta 75% de disco y ancho de banda</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            El códec patentado <strong>S+265 de Tiandy</strong> analiza la escena dinámicamente:
            en áreas estáticas del fondo aplica una compresión extrema, mientras que en objetos en movimiento
            (personas, autos) mantiene la máxima tasa de bits y nitidez. Permite cuadruplicar los días de grabación
            en el mismo disco duro SATA.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Hasta 75% menos ancho de banda consumido en switches y enlaces
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Compatible de retroceso con NVRs y clientes H.265 estándar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Mayor fluidez en conexiones remotas por 4G o baja velocidad
            </li>
          </ul>
        </div>
      </div>

      {/* SECCIÓN 3: Guía de PoE y Modo Extendido 250m */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Guía de Alimentación PoE y Distancias en Switches Tiandy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-sm text-slate-900 dark:text-white">PoE Estándar (802.3af)</div>
            <div className="text-emerald-600 font-mono font-bold text-xs mt-0.5">Hasta 15.4 Watts</div>
            <p className="text-xs text-slate-500 mt-2">
              Suficiente para cámaras fijas Bullet y Domo estándar de 2MP a 4MP con IR convencional.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-sm text-slate-900 dark:text-white">PoE+ Alta Potencia (802.3at)</div>
            <div className="text-emerald-600 font-mono font-bold text-xs mt-0.5">Hasta 30 Watts</div>
            <p className="text-xs text-slate-500 mt-2">
              Requerido para cámaras ColorMaker con luz cálida potente, modelos PTZ con calefactor y Early Warning.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-sm text-slate-900 dark:text-white">Modo Extendido CCTV (250m)</div>
            <div className="text-amber-600 font-mono font-bold text-xs mt-0.5">10 Mbps / 250 Metros</div>
            <p className="text-xs text-slate-500 mt-2">
              Los switches Tiandy permiten activar el switch físico de 250m para alimentar cámaras a distancias
              superiores al límite Ethernet de 100m con cable UTP Cat5e/Cat6 de cobre puro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
