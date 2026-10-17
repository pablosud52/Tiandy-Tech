import { Producto } from './types.js';

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
