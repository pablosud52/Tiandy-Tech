import { Producto, BadgeGlobalConfig } from './types.js';

export function getProductSpecs(prod: Producto) {
  const dt: any = prod.datos_tecnicos || {};
  const isCam = prod.tipo_dispositivo === 'CAMARA';
  const isNvr = prod.tipo_dispositivo === 'NVR';
  const isSw = prod.tipo_dispositivo === 'SWITCH';

  const cam = isCam ? (dt.camara || {}) : {};
  const nvr = isNvr ? (dt.nvr || {}) : {};
  const sw = isSw ? (dt.switch || {}) : {};

  return {
    formato: isCam 
      ? (cam.formato || dt.formato || 'Cámara IP') 
      : isNvr 
      ? 'Grabador NVR' 
      : isSw 
      ? 'Switch PoE' 
      : (dt.formato || prod.tipo_dispositivo),
    resolucion: isCam
      ? (cam.resolucion_mp || dt.resolucion_mp || '')
      : isNvr
      ? (nvr.resolucion_max_grabacion ? `Grab: ${nvr.resolucion_max_grabacion}` : '')
      : '',
    resolucion_pixels: isCam ? (cam.resolucion_max_pixels || dt.resolucion_max_pixels || '') : '',
    lente: isCam ? (cam.distancia_focal || dt.lente_focal || '') : '',
    apertura: isCam ? (cam.apertura_iris || dt.apertura_iris || '') : '',
    fov: isCam ? (cam.campo_vision_fov?.horizontal ? `${cam.campo_vision_fov.horizontal} H` : (dt.angulo_fov || '')) : '',
    dori_detectar: isCam ? (cam.dori_metros?.detectar || dt.dori_detectar_m || null) : null,
    dori_observar: isCam ? (cam.dori_metros?.observar || dt.dori_observar_m || null) : null,
    dori_reconocer: isCam ? (cam.dori_metros?.reconocer || dt.dori_reconocer_m || null) : null,
    dori_identificar: isCam ? (cam.dori_metros?.identificar || dt.dori_identificar_m || null) : null,
    distancia_ir: isCam ? (cam.alcance_ir_metros || dt.distancia_ir_m || null) : null,
    distancia_luz_calida: isCam ? (cam.alcance_luz_blanca_metros || dt.distancia_luz_calida_m || null) : null,
    microfono: isCam
      ? (cam.microfono_incorporado !== undefined ? Boolean(cam.microfono_incorporado) : true)
      : false,
    altavoz: isCam
      ? Boolean(
          cam.altavoz_incorporado !== undefined 
            ? cam.altavoz_incorporado 
            : (
              (cam.interfaces?.audio_integrado && (cam.interfaces.audio_integrado.includes('Parlante') || cam.interfaces.audio_integrado.includes('Altavoz') || cam.interfaces.audio_integrado.includes('Sirena'))) ||
              dt.altavoz_incorporado
            )
        )
      : false,
    ranura_sd: isCam ? Boolean(cam.interfaces?.ranura_sd || dt.slot_sd || cam.slot_sd) : false,
    max_sd_gb: isCam ? (cam.interfaces?.ranura_sd || (cam.slot_sd ? '512 GB' : '')) : '',
    grado_proteccion: isCam ? (cam.fisico?.grado_ip || cam.proteccion_ip || dt.grado_proteccion || '') : '',
    ambiente: isCam
      ? (
          cam.ambiente_instalacion ||
          prod.ambiente_instalacion ||
          dt.ambiente_instalacion ||
          (prod.modelo?.includes('TC-C320N') ? 'INTERIOR' : 'EXTERIOR')
        )
      : '',
    antivandalico: isCam ? (dt.antivandalico || (cam.fisico?.grado_ip?.includes('IK') || cam.proteccion_ip?.includes('IK') ? 'IK10' : '')) : '',
    alimentacion: isCam
      ? (cam.alimentacion?.tipo || cam.alimentacion_tipo || (dt.caracteristicas_principales as any)?.alimentacion || dt.alimentacion || '')
      : isNvr
      ? (nvr.alimentacion || (dt.caracteristicas_principales as any)?.alimentacion || dt.alimentacion || '')
      : isSw
      ? (sw.tipo_fuente || (dt.caracteristicas_principales as any)?.alimentacion || dt.alimentacion || '')
      : '',
    consumo_w: isCam 
      ? (cam.alimentacion?.especificacion || cam.consumo_max_w || dt.consumo_max_w || '') 
      : isSw 
      ? (sw.presupuesto_poe_watts ? `${sw.presupuesto_poe_watts}W PoE` : '') 
      : '',
    // NVR Specs
    canales: isNvr ? (nvr.canales_ip || dt.canales || 8) : null,
    canales_poe: isNvr ? (nvr.puertos_poe_integrados || nvr.canales_poe || dt.canales_poe || 0) : 0,
    ancho_banda_in: isNvr ? (nvr.ancho_banda_ingreso_mbps || dt.ancho_banda_entrada_mbps || null) : null,
    ancho_banda_out: isNvr ? (nvr.ancho_banda_egreso_mbps || dt.ancho_banda_salida_mbps || null) : null,
    bahias: isNvr ? (nvr.bahias_sata || dt.bahias_sata || 1) : null,
    capacidad_disco: isNvr ? (nvr.capacidad_max_por_disco_tb || dt.capacidad_max_tb || 10) : null,
    resolucion_grabacion_max: isNvr ? (nvr.resolucion_max_grabacion || dt.resolucion_grabacion_max || '16MP') : '',
    // Switch Specs
    puertos_poe: isSw ? (sw.puertos_poe_totales || dt.puertos_poe || 24) : null,
    puertos_uplink: isSw ? (sw.puertos_uplink_rj45 ? `${sw.puertos_uplink_rj45}x Uplink` : (dt.puertos_uplink || '')) : '',
    presupuesto_poe: isSw ? (sw.presupuesto_poe_watts || dt.presupuesto_poe_watts || 250) : null,
    poe_budget: isSw ? (sw.presupuesto_poe_watts || dt.presupuesto_poe_watts || 250) : null,
    wdr: isCam ? (cam.wdr || dt.wdr || 'Digital WDR') : '',
    modo_extendido: isSw ? (sw.modo_extend_cctv_250m !== undefined ? sw.modo_extend_cctv_250m : Boolean(dt.modo_extendido)) : false,
    analiticas_ia: isCam 
      ? (cam.analiticas_ia?.clasificacion_objetos || dt.analiticas_ia || []) 
      : isNvr 
      ? (nvr.ia_propia_nvr || dt.analiticas_ia || []) 
      : [],
    // Interfaces E/S (Cámaras y NVRs con soporte de fallbacks a características y matriz datasheet)
    entrada_alarma: Boolean(
      (isCam && (cam.interfaces?.entrada_alarma || dt.entrada_alarma || (dt.caracteristicas_principales as any)?.entradas_alarma)) ||
      (isNvr && (nvr.entradas_alarma || dt.entrada_alarma || (dt.caracteristicas_principales as any)?.entradas_alarma)) ||
      (dt.especificaciones_datasheet?.Interface?.['Alarm I/O'] && /input|in\b|TTL\s*input/i.test(dt.especificaciones_datasheet.Interface['Alarm I/O'])) ||
      (dt.especificaciones_datasheet?.Performance?.['Alarm I/O'] && /input|in\b|TTL\s*inputs?/i.test(dt.especificaciones_datasheet.Performance['Alarm I/O']))
    ),
    salida_alarma: Boolean(
      (isCam && (cam.interfaces?.salida_alarma || (cam as any).salidas_alarma || dt.salida_alarma || (dt.caracteristicas_principales as any)?.salidas_alarma)) ||
      (isNvr && (nvr.salidas_alarma || dt.salida_alarma || (dt.caracteristicas_principales as any)?.salidas_alarma)) ||
      (dt.especificaciones_datasheet?.Interface?.['Alarm I/O'] && /output|out\b|TTL\s*output|relay/i.test(dt.especificaciones_datasheet.Interface['Alarm I/O'])) ||
      (dt.especificaciones_datasheet?.Performance?.['Alarm I/O'] && /output|out\b|relay\s*outputs?/i.test(dt.especificaciones_datasheet.Performance['Alarm I/O']))
    ),
    salida_audio: Boolean(
      (isCam && (cam.interfaces?.audio_io_externo || cam.altavoz_incorporado || dt.salida_audio || dt.audio_2_vias)) ||
      (isNvr && (nvr.audio_io || dt.salida_audio || dt.audio_2_vias)) ||
      (dt.especificaciones_datasheet?.Interface?.['Audio I/O'] && dt.especificaciones_datasheet.Interface['Audio I/O'] !== '-') ||
      (dt.especificaciones_datasheet?.['Video and Audio']?.['Audio'] && dt.especificaciones_datasheet['Video and Audio']['Audio'] !== '-')
    )
  };
}

/**
 * Formatea un precio en moneda oficial U$S con 2 decimales
 * Ejemplo: 40.1 -> "U$S 40.10"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return 'Consultar';
  }
  return `U$S ${amount.toFixed(2)}`;
}

/**
 * Separa el código de modelo base y su sub-especificación/variante técnica
 * Ejemplo 1: "TC-C321N 1CNB-28" -> { baseModel: "TC-C321N", variantSpec: "1CNB-28" }
 * Ejemplo 2: "TC-C34XN Spec:I3W/E/Y/2.8mm/V4.2" -> { baseModel: "TC-C34XN", variantSpec: "I3W/E/Y/2.8mm/V4.2" }
 * Siempre limpia y excluye la palabra "Spec:".
 */
export function parseModelAndSpec(
  modelo: string, 
  subtipo?: string | null, 
  especificacion?: string | null
): { baseModel: string; variantSpec: string } {
  if (!modelo) return { baseModel: '', variantSpec: '' };

  // Limpiar texto "Spec:" o "Spec" o "Spec.-"
  const clean = modelo.replace(/\bSpec[:.\s-]*/gi, ' ').replace(/\s+/g, ' ').trim();
  
  // Separar si contiene espacio (ej: "TC-C321N 1CNB-28" o "TC-C34XN I3W/E/Y/2.8mm/V4.2")
  const parts = clean.split(' ');
  if (parts.length > 1) {
    const baseModel = parts[0];
    const variantSpec = parts.slice(1).join(' ').trim().replace(/^Spec[:.\s-]*/i, '');
    return { baseModel, variantSpec };
  }

  // Si no tiene espacio pero especificacion_completa sí lo tiene (ej: modelo = "TC-C321N", esp = "TC-C321N 1ANB-28")
  if (especificacion && especificacion !== modelo) {
    const cleanEsp = especificacion.replace(/\bSpec[:.\s-]*/gi, ' ').replace(/\s+/g, ' ').trim();
    const espParts = cleanEsp.split(' ');
    if (espParts.length > 1 && espParts[0].toUpperCase() === clean.toUpperCase()) {
      return { baseModel: clean, variantSpec: espParts.slice(1).join(' ').trim().replace(/^Spec[:.\s-]*/i, '') };
    }
  }

  // Si el modelo es solo "TC-C321N", verificar si en el subtipo hay un código de hardware específico
  if (subtipo && /\b\d[A-Z0-9]{2,4}-\d{2}\b/i.test(subtipo)) {
    const match = subtipo.match(/\b(\d[A-Z0-9]{2,4}-\d{2})\b/i);
    if (match) {
      return { baseModel: clean, variantSpec: match[1] };
    }
  }

  return { baseModel: clean, variantSpec: '' };
}

/**
 * Normaliza un texto para búsqueda: minúsculas y eliminación de acentos/diacríticos.
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Construye el corpus de búsqueda universal (Search Corpus) de un producto.
 * Concatena e indexa:
 * - Identificadores: modelo, código de variante, serie, subtipo, tipo, códigos 1/2/interno/EAN.
 * - Especificaciones estructuradas (resolución, formato, lente, sensor, FOV, IR, luz blanca, alimentación, canales, PoE, SATA, etc.).
 * - Matriz completa del Datasheet PDF (especificaciones_datasheet: todas las secciones, claves y valores).
 * - Características principales y datos técnicos de hardware.
 * - Analíticas IA y sellos/badges (excluyendo "nuevo", "modelo" o "nuevo modelo" para evitar falsos positivos).
 */
export function buildProductSearchCorpus(
  prod: Producto,
  globalBadges?: BadgeGlobalConfig[]
): string {
  const parts: string[] = [];

  // 1. Identificadores principales y códigos comerciales
  if (prod.modelo) parts.push(prod.modelo);
  if (prod.especificacion_completa) parts.push(prod.especificacion_completa);
  if (prod.serie) parts.push(prod.serie);
  if (prod.subtipo) parts.push(prod.subtipo);
  if (prod.tipo_dispositivo) parts.push(prod.tipo_dispositivo);
  if (prod.codigo_1) parts.push(prod.codigo_1);
  if (prod.codigo_2) parts.push(prod.codigo_2);
  if (prod.codigo_interno) parts.push(prod.codigo_interno);
  if (prod.codigo_barras_ean) parts.push(prod.codigo_barras_ean);

  const { baseModel, variantSpec } = parseModelAndSpec(
    prod.modelo,
    prod.subtipo,
    prod.especificacion_completa
  );
  if (baseModel && baseModel !== prod.modelo) parts.push(baseModel);
  if (variantSpec) parts.push(variantSpec);

  // 2. Especificaciones calculadas / estructuradas
  const specs = getProductSpecs(prod);
  if (specs.formato) parts.push(specs.formato);
  if (specs.resolucion) parts.push(specs.resolucion);
  if (specs.resolucion_pixels) parts.push(specs.resolucion_pixels);
  if (specs.lente) parts.push(specs.lente);
  if (specs.apertura) parts.push(specs.apertura);
  if (specs.fov) parts.push(specs.fov);
  if (specs.wdr) parts.push(specs.wdr);
  if (specs.alimentacion) parts.push(specs.alimentacion);
  if (specs.consumo_w) parts.push(specs.consumo_w);
  if (specs.grado_proteccion) parts.push(specs.grado_proteccion);
  if (specs.antivandalico) parts.push(specs.antivandalico);

  if (prod.tipo_dispositivo === 'CAMARA') {
    if (specs.distancia_ir) parts.push(`${specs.distancia_ir}m ir`, `${specs.distancia_ir} m`);
    if (specs.distancia_luz_calida) parts.push(`${specs.distancia_luz_calida}m luz calida luz blanca`);
    if (specs.microfono) parts.push('microfono mic incorporado integrado');
    if (specs.altavoz) parts.push('altavoz parlante speaker incorporado integrado sirena');
    if (specs.ranura_sd) parts.push('ranura sd micro microsd microsd slot');
    if (specs.max_sd_gb) parts.push(specs.max_sd_gb);
    if (specs.dori_detectar) parts.push(`detectar ${specs.dori_detectar}m`);
    if (specs.dori_observar) parts.push(`observar ${specs.dori_observar}m`);
    if (specs.dori_reconocer) parts.push(`reconocer ${specs.dori_reconocer}m`);
    if (specs.dori_identificar) parts.push(`identificar ${specs.dori_identificar}m`);
  } else if (prod.tipo_dispositivo === 'NVR') {
    if (specs.canales) parts.push(`${specs.canales} canales`, `${specs.canales}ch`, `${specs.canales} ch`);
    if (specs.canales_poe) parts.push(`${specs.canales_poe} puertos poe`, `${specs.canales_poe}poe`);
    if (specs.bahias) parts.push(`${specs.bahias} bahias`, `${specs.bahias} bahia`, `${specs.bahias} hdd`, `${specs.bahias} discos`, `${specs.bahias} sata`);
    if (specs.capacidad_disco) parts.push(`${specs.capacidad_disco}tb`, `${specs.capacidad_disco} tb`);
    if (specs.ancho_banda_in) parts.push(`${specs.ancho_banda_in}mbps in`, `${specs.ancho_banda_in} mbps`);
    if (specs.ancho_banda_out) parts.push(`${specs.ancho_banda_out}mbps out`);
    if (specs.resolucion_grabacion_max) parts.push(`${specs.resolucion_grabacion_max} grabacion`);
  } else if (prod.tipo_dispositivo === 'SWITCH') {
    if (specs.puertos_poe) parts.push(`${specs.puertos_poe} puertos poe`);
    if (specs.puertos_uplink) parts.push(specs.puertos_uplink);
    if (specs.presupuesto_poe) parts.push(`${specs.presupuesto_poe}w poe`, `${specs.presupuesto_poe} watts`);
    if (specs.modo_extendido) parts.push('modo extendido 250m cctv');
  }

  // Interfaces E/S
  if (specs.entrada_alarma) parts.push('entrada alarma alarm in alarm input');
  if (specs.salida_alarma) parts.push('salida alarma alarm out alarm output');
  if (specs.salida_audio) parts.push('salida audio audio 2 vias two way audio audio io');

  // Analíticas IA
  if (Array.isArray(specs.analiticas_ia)) {
    parts.push(specs.analiticas_ia.join(' '));
  } else if (specs.analiticas_ia) {
    parts.push(String(specs.analiticas_ia));
  }

  // 3. Matriz completa de especificaciones del datasheet (PDF)
  const dt: any = prod.datos_tecnicos || {};
  if (dt.especificaciones_datasheet && typeof dt.especificaciones_datasheet === 'object') {
    for (const [sectionKey, sectionObj] of Object.entries(dt.especificaciones_datasheet)) {
      if (sectionKey) parts.push(sectionKey);
      if (sectionObj && typeof sectionObj === 'object') {
        for (const [k, v] of Object.entries(sectionObj as Record<string, any>)) {
          // Solo indexar si el valor no es nulo o vacío
          if (v !== null && v !== undefined && v !== '' && v !== '-') {
            if (k) parts.push(k);
            if (typeof v === 'string') parts.push(v);
          }
        }
      }
    }
  }

  // 4. Características principales estructuradas
  if (dt.caracteristicas_principales && typeof dt.caracteristicas_principales === 'object') {
    for (const [k, v] of Object.entries(dt.caracteristicas_principales as Record<string, any>)) {
      // Sanitización estricta: nunca indexar nombres de claves si el valor es null o false (evita falso positivo de SMD)
      if (v !== null && v !== undefined && v !== '' && v !== false) {
        if (k) parts.push(k);
        if (typeof v === 'string') parts.push(v);
        else if (Array.isArray(v)) parts.push(v.join(' '));
      }
    }
  }

  // 5. Nodos de hardware específicos
  if (dt.camara) {
    const cam = dt.camara;
    if (cam.sensor_imagen) parts.push(cam.sensor_imagen);
    if (cam.optica_tipo) parts.push(cam.optica_tipo);
    if (cam.codecs_video) parts.push(cam.codecs_video);
    if (cam.iluminacion_minima_color) parts.push(cam.iluminacion_minima_color);
    if (cam.conectividad_tipo) parts.push(cam.conectividad_tipo);
    if (cam.movimiento_tipo) parts.push(cam.movimiento_tipo);
    if (cam.analiticas_ia?.version_smd) parts.push(cam.analiticas_ia.version_smd);
    if (cam.analiticas_ia?.vca_funciones) {
      if (Array.isArray(cam.analiticas_ia.vca_funciones)) {
        parts.push(...cam.analiticas_ia.vca_funciones);
      } else {
        parts.push(String(cam.analiticas_ia.vca_funciones));
      }
    }
  }
  if (dt.nvr) {
    const nvr = dt.nvr;
    if (nvr.compresion) parts.push(nvr.compresion);
    if (nvr.salidas_video) parts.push(nvr.salidas_video);
    if (nvr.decodificacion) parts.push(nvr.decodificacion);
    if (nvr.ia_propia_nvr) {
      if (Array.isArray(nvr.ia_propia_nvr)) parts.push(...nvr.ia_propia_nvr);
      else parts.push(String(nvr.ia_propia_nvr));
    }
  }
  if (dt.switch) {
    const sw = dt.switch;
    if (sw.estandar_poe) parts.push(sw.estandar_poe);
    if (sw.velocidad_poe) parts.push(sw.velocidad_poe);
  }

  // 6. Analíticas de Video VCA detectadas
  const anas = prod.tipo_dispositivo === 'CAMARA' ? getProductAnalytics(prod) : [];
  if (anas.length > 0) {
    parts.push(...anas);
    if (anas.includes('TRIPWIRE')) parts.push('tripwire', 'cruce de linea', 'line crossing');
    if (anas.includes('PERIMETER')) parts.push('perimeter', 'intrusion perimetral', 'perimetro');
    if (anas.includes('DOUBLE_TRIPWIRE')) parts.push('double tripwire', 'doble cruce');
    if (anas.includes('LOITERING')) parts.push('loitering', 'merodeo');
    if (anas.includes('RUNNING')) parts.push('running', 'carrera');
    if (anas.includes('PARKING')) parts.push('parking', 'estacionamiento');
    if (anas.includes('CROWD')) parts.push('crowd', 'aglomeraciones');
    if (anas.includes('PEOPLE_COUNTING')) parts.push('people counting', 'conteo de personas');
    if (anas.includes('HEAT_MAP')) parts.push('heat map', 'heatmap', 'mapa de calor');
    if (anas.includes('SAFETY_HELMET')) parts.push('safety helmet', 'casco');
    if (anas.includes('FACE_DETECTION')) parts.push('face detection', 'captura facial', 'rostro');
    if (anas.includes('FACE_RECOGNITION')) parts.push('face recognition', 'reconocimiento facial');
    if (anas.includes('ANPR_LPR')) parts.push('anpr', 'lpr', 'matriculas');
  }

  // 7. Detección y Enriquecimiento de SMD (Tokens atómicos y búsqueda genérica)
  const sellosGraficos: any[] = Array.isArray(dt.sellos_graficos) ? dt.sellos_graficos : [];
  const bDet: string[] = Array.isArray(prod.badges_detectados) ? prod.badges_detectados : [];
  const cpSmd: string | null = dt.caracteristicas_principales?.smd || null;
  const camSmd: string | null = dt.camara?.analiticas_ia?.version_smd || null;

  const s1 = sellosGraficos.find((s: any) => s && s.id === 'SMD_1');
  const s2 = sellosGraficos.find((s: any) => s && s.id === 'SMD_2');
  const s3 = sellosGraficos.find((s: any) => s && s.id === 'SMD_3');

  const hasSmd1 = Boolean(s1?.activo) || bDet.some((b: string) => /SMD\s*1/i.test(b)) || (cpSmd ? /1(\.0)?/i.test(cpSmd) : false) || (camSmd ? /1(\.0)?/i.test(camSmd) : false) || anas.includes('SMD_1');
  const hasSmd2 = Boolean(s2?.activo) || bDet.some((b: string) => /SMD\s*2/i.test(b)) || (cpSmd ? /2(\.0)?/i.test(cpSmd) : false) || (camSmd ? /2(\.0)?/i.test(camSmd) : false) || anas.includes('SMD_2');
  const hasSmd3 = Boolean(s3?.activo) || bDet.some((b: string) => /SMD\s*3/i.test(b)) || (cpSmd ? /3(\.0)?/i.test(cpSmd) : false) || (camSmd ? /3(\.0)?/i.test(camSmd) : false) || anas.includes('SMD_3');

  if (hasSmd1) {
    parts.push('__smd_v1__', 'smd', 'smd 1.0', 'smd 1', 'smd1', 'smd1.0');
  }
  if (hasSmd2) {
    parts.push('__smd_v2__', 'smd', 'smd 2.0', 'smd 2', 'smd2', 'smd2.0');
  }
  if (hasSmd3) {
    parts.push('__smd_v3__', 'smd', 'smd 3.0', 'smd 3', 'smd3', 'smd3.0');
  }

  // 8. Badges detectados y sellos gráficos
  // REGLA ANTI-FALSOS POSITIVOS: Excluir explícitamente "nuevo", "modelo", "nuevo modelo"
  for (const b of bDet) {
    if (!b) continue;
    const bLow = b.toLowerCase();
    if (bLow.includes('nuevo') || bLow.includes('modelo')) continue;
    parts.push(b);
    if (/colormaker/i.test(b)) parts.push('colormaker');
    if (/polar\s*day/i.test(b)) parts.push('polarday');
    if (/early\s*warning/i.test(b)) parts.push('earlywarning');
    if (/dual\s*light/i.test(b)) parts.push('duallight');
  }

  for (const s of sellosGraficos) {
    if (!s || !s.activo) continue;
    if (s.id === 'NUEVO_MODELO') continue;
    const sNameLow = (s.nombre || '').toLowerCase();
    if (sNameLow.includes('nuevo') || sNameLow.includes('modelo')) continue;
    parts.push(s.nombre);
    parts.push(s.id);
  }

  if (Array.isArray(globalBadges) && globalBadges.length > 0) {
    for (const gb of globalBadges) {
      if (!gb || gb.activo_global === false) continue;
      if (gb.id === 'NUEVO_MODELO') continue;

      let isActivo = false;
      const fromProd = sellosGraficos.find((s: any) => s && s.id === gb.id);
      if (fromProd !== undefined) {
        isActivo = Boolean(fromProd.activo);
      } else {
        const cam = (dt.camara || {}) as any;
        const vcaF = cam?.analiticas_ia?.vca_funciones;
        if (gb.id === 'COLORMAKER' && bDet.some((b: string) => b.toUpperCase().includes('COLORMAKER'))) isActivo = true;
        if (gb.id === 'POLAR_DAY' && bDet.some((b: string) => b.toUpperCase().includes('POLAR'))) isActivo = true;
        if (gb.id === 'SMD_1' && hasSmd1) isActivo = true;
        if (gb.id === 'SMD_2' && hasSmd2) isActivo = true;
        if (gb.id === 'SMD_3' && hasSmd3) isActivo = true;
        if (gb.id === 'VCA' && (bDet.some((b: string) => /VCA/i.test(b)) || (Array.isArray(vcaF) ? vcaF.length > 0 : Boolean(vcaF)))) isActivo = true;
        if (gb.id === 'DUAL_LIGHT' && bDet.some((b: string) => /DUAL/i.test(b))) isActivo = true;
        if (gb.id === 'PARLANTE_INCORPORADO' && bDet.some((b: string) => /PARLANTE|ALTAVOZ/i.test(b))) isActivo = true;
        if (gb.id === 'EARLY_WARNING' && bDet.some((b: string) => /EARLY|EW/i.test(b))) isActivo = true;
      }

      if (isActivo) {
        parts.push(gb.nombre);
        parts.push(gb.id);
      }
    }
  }

  return parts.join(' ');
}

/**
 * Evalúa si un token individual de búsqueda coincide contra el corpus normalizado,
 * considerando sinónimos y variantes técnicas de CCTV.
 */
function matchSingleToken(token: string, corpus: string): boolean {
  if (!token) return true;

  // 1. Coincidencia directa de subcadena
  if (corpus.includes(token)) return true;

  // 2. Sinónimos y equivalencias de Resolución
  if (token === '4k') {
    return corpus.includes('4k') || corpus.includes('8mp') || corpus.includes('3840x2160') || corpus.includes('3840*2160') || corpus.includes('8 mp');
  }
  if (token === '2k') {
    return corpus.includes('2k') || corpus.includes('4mp') || corpus.includes('2560x1440') || corpus.includes('2560*1440') || corpus.includes('4 mp');
  }
  if (token === '1080p') {
    return corpus.includes('1080p') || corpus.includes('2mp') || corpus.includes('1920x1080') || corpus.includes('1920*1080') || corpus.includes('2 mp');
  }

  // 3. Sinónimos de Alimentación y Red
  if (token === 'poe') {
    return corpus.includes('poe') || corpus.includes('802.3af') || corpus.includes('802.3at') || corpus.includes('802.3bt');
  }
  if (token === 'wifi' || token === 'wi-fi') {
    return corpus.includes('wifi') || corpus.includes('wi-fi');
  }

  // 4. Códecs de compresión (S+265, H.265, H.264)
  if (token === 's265' || token === 's+265' || token === 's-265') {
    return corpus.includes('s+265') || corpus.includes('s265');
  }
  if (token === 'h265' || token === 'h.265') {
    return corpus.includes('h.265') || corpus.includes('h265');
  }
  if (token === 'h264' || token === 'h.264') {
    return corpus.includes('h.264') || corpus.includes('h264');
  }

  // 5. Términos de Alarma y Audio (Español / Inglés)
  if (token === 'alarma' || token === 'alarm') {
    return corpus.includes('alarma') || corpus.includes('alarm');
  }
  if (token === 'mic' || token === 'microfono') {
    return corpus.includes('microfono') || corpus.includes('mic') || corpus.includes('microphone');
  }
  if (token === 'parlante' || token === 'altavoz' || token === 'speaker') {
    return corpus.includes('parlante') || corpus.includes('altavoz') || corpus.includes('speaker');
  }

  // 6. SMD con o sin espacios (ej: "smd1", "smd2", "smd3")
  if (token === 'smd1' || token === 'smd1.0') {
    return corpus.includes('__smd_v1__') || corpus.includes('smd 1') || corpus.includes('smd 1.0') || corpus.includes('smd1');
  }
  if (token === 'smd2' || token === 'smd2.0') {
    return corpus.includes('__smd_v2__') || corpus.includes('smd 2') || corpus.includes('smd 2.0') || corpus.includes('smd2');
  }
  if (token === 'smd3' || token === 'smd3.0') {
    return corpus.includes('__smd_v3__') || corpus.includes('smd 3') || corpus.includes('smd 3.0') || corpus.includes('smd3');
  }

  return false;
}

/**
 * Función principal de evaluación de búsqueda universal.
 * Aplica operador AND sobre todos los términos de la consulta.
 */
export function matchesSearchQuery(
  prod: Producto,
  busqueda: string | null | undefined,
  globalBadges?: BadgeGlobalConfig[]
): boolean {
  if (!busqueda) return true;
  const rawQuery = busqueda.trim();
  if (!rawQuery) return true;

  let normalizedQuery = normalizeSearchText(rawQuery);

  // Preprocesar frases técnicas compuestas como tokens atómicos unificados
  normalizedQuery = normalizedQuery
    .replace(/\bsmd\s*1(\.0)?\b/gi, ' __smd_v1__ ')
    .replace(/\bsmd\s*2(\.0)?\b/gi, ' __smd_v2__ ')
    .replace(/\bsmd\s*3(\.0)?\b/gi, ' __smd_v3__ ')
    .replace(/\bcolor\s+maker\b/gi, ' colormaker ')
    .replace(/\bpolar\s+day\b/gi, ' polarday ')
    .replace(/\bearly\s+warning\b/gi, ' earlywarning ')
    .replace(/\bdual\s+light\b/gi, ' duallight ')
    .replace(/\bcruce\s+de\s+linea\b/gi, ' tripwire ')
    .replace(/\bline\s+crossing\b/gi, ' tripwire ')
    .replace(/\bintrusion\s+perimetral\b/gi, ' perimeter ')
    .replace(/\bdoble\s+cruce\b/gi, ' double_tripwire ')
    .replace(/\bconteo\s+de\s+personas\b/gi, ' people_counting ')
    .replace(/\bmapa\s+de\s+calor\b/gi, ' heat_map ');

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const corpus = normalizeSearchText(buildProductSearchCorpus(prod, globalBadges));

  return tokens.every((token) => matchSingleToken(token, corpus));
}

export interface AnaliticaItemConfig {
  id: string;
  categoria: 'SMD' | 'PERIMETRO' | 'COMPORTAMIENTO' | 'OBJETOS' | 'METRICAS' | 'EHS' | 'BIOMETRIA_TRAFICO';
  categoriaLabel: string;
  nombreEn: string;
  nombreEs: string;
}

export const CATALOGO_ANALITICAS_VCA: AnaliticaItemConfig[] = [
  // 1. Seguridad Perimetral y Control de Intrusión y Control de Intrusión
  { id: 'TRIPWIRE', categoria: 'PERIMETRO', categoriaLabel: 'Seguridad Perimetral', nombreEn: 'Tripwire', nombreEs: 'Cruce de línea' },
  { id: 'PERIMETER', categoria: 'PERIMETRO', categoriaLabel: 'Seguridad Perimetral', nombreEn: 'Perimeter Intrusion', nombreEs: 'Intrusión perimetral' },
  { id: 'DOUBLE_TRIPWIRE', categoria: 'PERIMETRO', categoriaLabel: 'Seguridad Perimetral', nombreEn: 'Double Tripwire', nombreEs: 'Doble cruce de línea' },

  // 3. Comportamiento y Orden Público
  { id: 'LOITERING', categoria: 'COMPORTAMIENTO', categoriaLabel: 'Comportamiento y Orden', nombreEn: 'Loitering', nombreEs: 'Merodeo' },
  { id: 'RUNNING', categoria: 'COMPORTAMIENTO', categoriaLabel: 'Comportamiento y Orden', nombreEn: 'Running', nombreEs: 'Carrera (persona corriendo)' },
  { id: 'PARKING', categoria: 'COMPORTAMIENTO', categoriaLabel: 'Comportamiento y Orden', nombreEn: 'Parking', nombreEs: 'Estacionamiento indebido' },
  { id: 'CROWD', categoria: 'COMPORTAMIENTO', categoriaLabel: 'Comportamiento y Orden', nombreEn: 'Crowd Detection', nombreEs: 'Detección de aglomeraciones' },

  // 4. Vigilancia de Objetos y Protección del Dispositivo
  { id: 'OBJECT_ABANDONED', categoria: 'OBJETOS', categoriaLabel: 'Objetos y Dispositivo', nombreEn: 'Object Abandoned', nombreEs: 'Objeto abandonado' },
  { id: 'OBJECT_LOST', categoria: 'OBJETOS', categoriaLabel: 'Objetos y Dispositivo', nombreEn: 'Object Lost (Missing)', nombreEs: 'Objeto removido (desaparecido)' },
  { id: 'VIDEO_ABNORMAL', categoria: 'OBJETOS', categoriaLabel: 'Objetos y Dispositivo', nombreEn: 'Video Abnormal', nombreEs: 'Alteración de video (cambio de escena)' },
  { id: 'AUDIO_ABNORMAL', categoria: 'OBJETOS', categoriaLabel: 'Objetos y Dispositivo', nombreEn: 'Abnormal Audio Detection', nombreEs: 'Detección de audio anómalo' },

  // 5. Inteligencia Comercial y Métricas de Negocio
  { id: 'PEOPLE_COUNTING', categoria: 'METRICAS', categoriaLabel: 'Inteligencia Comercial', nombreEn: 'People Counting', nombreEs: 'Conteo de personas' },
  { id: 'HEAT_MAP', categoria: 'METRICAS', categoriaLabel: 'Inteligencia Comercial', nombreEn: 'Heat Map', nombreEs: 'Mapa de calor' },

  // 6. Seguridad Ocupacional (EHS) y Supervisión Laboral
  { id: 'SAFETY_HELMET', categoria: 'EHS', categoriaLabel: 'Seguridad Laboral (EHS)', nombreEn: 'Helmet (Hardhat) Detection', nombreEs: 'Detección de uso de casco' },
  { id: 'SAFETY_VEST', categoria: 'EHS', categoriaLabel: 'Seguridad Laboral (EHS)', nombreEn: 'High-Visibility Vest', nombreEs: 'Detección de chaleco reflectivo' },
  { id: 'ON_DUTY', categoria: 'EHS', categoriaLabel: 'Seguridad Laboral (EHS)', nombreEn: 'On-Duty Detection', nombreEs: 'Detección de abandono de puesto' },
  { id: 'SLEEPING', categoria: 'EHS', categoriaLabel: 'Seguridad Laboral (EHS)', nombreEn: 'Sleeping Detection', nombreEs: 'Detección de somnolencia' },

  // 7. Biometría y Tránsito
  { id: 'FACE_DETECTION', categoria: 'BIOMETRIA_TRAFICO', categoriaLabel: 'Biometría y Tránsito', nombreEn: 'Face Detection / Capture', nombreEs: 'Captura y atributos faciales' },
  { id: 'FACE_RECOGNITION', categoria: 'BIOMETRIA_TRAFICO', categoriaLabel: 'Biometría y Tránsito', nombreEn: 'Face Recognition', nombreEs: 'Reconocimiento y comparación facial' },
  { id: 'ANPR_LPR', categoria: 'BIOMETRIA_TRAFICO', categoriaLabel: 'Biometría y Tránsito', nombreEn: 'ANPR / LPR', nombreEs: 'Lectura de matrículas' }
];

export const CATALOGO_ANALITICAS_SMD_VCA = CATALOGO_ANALITICAS_VCA;

/**
 * Detecta y retorna el conjunto de identificadores de analíticas soportadas por una cámara.
 * Examina tanto configuraciones manuales como características técnicas y datasheet parseado.
 */
export function getProductAnalytics(prod: Producto): string[] {
  if (prod.tipo_dispositivo !== 'CAMARA') return [];
  const dt: any = prod.datos_tecnicos || {};
  const cp: any = dt.caracteristicas_principales || {};
  const cam: any = dt.camara || {};
  const badges: string[] = prod.badges_detectados || [];

  // Configuración manual explícita desde el panel de control
  if (Array.isArray(cam.analiticas_config) && cam.analiticas_config.length > 0) {
    return cam.analiticas_config;
  }

  const textCorpus = (
    JSON.stringify(dt.especificaciones_datasheet || {}) + ' ' +
    (cp.vca || '') + ' ' +
    (cp.smd || '') + ' ' +
    (cam.analiticas_ia?.vca_funciones?.join(' ') || '') + ' ' +
    badges.join(' ') + ' ' +
    (prod.especificacion_completa || '') + ' ' +
    (prod.subtipo || '')
  ).toLowerCase();

  const detected = new Set<string>();

  // 1. SMD
  const smdVal = cp.smd || cam.analiticas_ia?.version_smd || badges.find((b: string) => /SMD/i.test(b));
  if (smdVal && /1\.0/i.test(smdVal)) {
    detected.add('SMD_1');
  } else if (textCorpus.includes('smart alarm(human and vehicle detection)')) {
    detected.add('SMD_1');
  }

  if (smdVal && /2\.0/i.test(smdVal)) {
    detected.add('SMD_2');
  } else if (textCorpus.includes('smd 2.0') || textCorpus.includes('smd2.0')) {
    detected.add('SMD_2');
  }

  if (smdVal && /3\.0/i.test(smdVal)) {
    detected.add('SMD_3');
  } else if (textCorpus.includes('smd 3.0') || textCorpus.includes('smd3.0')) {
    detected.add('SMD_3');
  }

  // 2. VCA Perimetral
  if (textCorpus.includes('tripwire')) detected.add('TRIPWIRE');
  if (textCorpus.includes('perimeter')) detected.add('PERIMETER');
  if (textCorpus.includes('double tripwire')) detected.add('DOUBLE_TRIPWIRE');

  // 3. Comportamiento
  if (textCorpus.includes('loitering')) detected.add('LOITERING');
  if (textCorpus.includes('running')) detected.add('RUNNING');
  if (textCorpus.includes('parking')) detected.add('PARKING');
  if (textCorpus.includes('crowd') || textCorpus.includes('crowed')) detected.add('CROWD');

  // 4. Objetos y Dispositivo
  if (textCorpus.includes('abandon') || textCorpus.includes('abandoned')) detected.add('OBJECT_ABANDONED');
  if (textCorpus.includes('lost') || textCorpus.includes('missing')) detected.add('OBJECT_LOST');
  if (textCorpus.includes('video abnormal') || textCorpus.includes('scene change')) detected.add('VIDEO_ABNORMAL');
  if (textCorpus.includes('audio abnormal')) detected.add('AUDIO_ABNORMAL');

  // 5. Métricas Comerciales
  if (textCorpus.includes('people counting') || textCorpus.includes('conteo de personas')) detected.add('PEOPLE_COUNTING');
  if (textCorpus.includes('heatmap') || textCorpus.includes('heat map')) detected.add('HEAT_MAP');

  // 6. Seguridad Laboral (EHS)
  if (textCorpus.includes('helmet') || textCorpus.includes('hardhat')) detected.add('SAFETY_HELMET');
  if (textCorpus.includes('vest') || textCorpus.includes('chaleco')) detected.add('SAFETY_VEST');
  if (textCorpus.includes('on duty') || textCorpus.includes('on-duty')) detected.add('ON_DUTY');
  if (textCorpus.includes('sleeping') || textCorpus.includes('somnolencia')) detected.add('SLEEPING');

  // 7. Biometría y Tránsito
  if (/\b(face\s*detection|face\s*capture|captura\s*facial)\b/i.test(textCorpus)) detected.add('FACE_DETECTION');
  if (textCorpus.includes('face recognition') || textCorpus.includes('comparación facial')) detected.add('FACE_RECOGNITION');
  if (textCorpus.includes('anpr') || textCorpus.includes('lpr')) detected.add('ANPR_LPR');

  return Array.from(detected);
}


