import { Producto } from './types.js';

export function getProductSpecs(prod: Producto) {
  const dt: any = prod.datos_tecnicos || {};
  const cam = dt.camara || {};
  const nvr = dt.nvr || {};
  const sw = dt.switch || {};

  return {
    formato: cam.formato || dt.formato || (prod.tipo_dispositivo === 'CAMARA' ? 'Cámara IP' : prod.tipo_dispositivo),
    resolucion: cam.resolucion_mp || dt.resolucion_mp || (nvr.resolucion_max_grabacion ? `Grab: ${nvr.resolucion_max_grabacion}` : ''),
    resolucion_pixels: cam.resolucion_max_pixels || dt.resolucion_max_pixels || '',
    lente: cam.distancia_focal || dt.lente_focal || '',
    apertura: cam.apertura_iris || dt.apertura_iris || '',
    fov: cam.campo_vision_fov?.horizontal ? `${cam.campo_vision_fov.horizontal} H` : (dt.angulo_fov || ''),
    dori_detectar: cam.dori_metros?.detectar || dt.dori_detectar_m || null,
    dori_observar: cam.dori_metros?.observar || dt.dori_observar_m || null,
    dori_reconocer: cam.dori_metros?.reconocer || dt.dori_reconocer_m || null,
    dori_identificar: cam.dori_metros?.identificar || dt.dori_identificar_m || null,
    distancia_ir: cam.alcance_ir_metros || dt.distancia_ir_m || null,
    distancia_luz_calida: cam.alcance_luz_blanca_metros || dt.distancia_luz_calida_m || null,
    microfono: Boolean(
      (cam.interfaces?.audio_integrado && cam.interfaces.audio_integrado.includes('Micrófono')) ||
      dt.microfono_incorporado
    ),
    altavoz: Boolean(
      (cam.interfaces?.audio_integrado && (cam.interfaces.audio_integrado.includes('Parlante') || cam.interfaces.audio_integrado.includes('Altavoz'))) ||
      dt.altavoz_incorporado
    ),
    ranura_sd: Boolean(cam.interfaces?.ranura_sd || dt.slot_sd),
    max_sd_gb: cam.interfaces?.ranura_sd || '512 GB',
    grado_proteccion: cam.fisico?.grado_ip || dt.grado_proteccion || '',
    antivandalico: dt.antivandalico || (cam.fisico?.grado_ip?.includes('IK') ? 'IK10' : ''),
    alimentacion: cam.alimentacion?.tipo || dt.alimentacion || (prod.tipo_dispositivo === 'CAMARA' ? 'PoE (802.3af) / 12VDC' : ''),
    consumo_w: dt.consumo_max_w || (cam.alimentacion?.especificacion?.includes('W') ? cam.alimentacion.especificacion : '6W Max'),
    // NVR Specs
    canales: nvr.canales_ip || dt.canales || (prod.tipo_dispositivo === 'NVR' ? 10 : null),
    canales_poe: nvr.puertos_poe_integrados || dt.canales_poe || 0,
    ancho_banda_in: nvr.ancho_banda_ingreso_mbps || dt.ancho_banda_entrada_mbps || null,
    ancho_banda_out: nvr.ancho_banda_egreso_mbps || dt.ancho_banda_salida_mbps || null,
    bahias: nvr.bahias_sata || dt.bahias_sata || (prod.tipo_dispositivo === 'NVR' ? 1 : null),
    capacidad_disco: nvr.capacidad_max_por_disco_tb || dt.capacidad_max_tb || 10,
    resolucion_grabacion_max: nvr.resolucion_max_grabacion || dt.resolucion_grabacion_max || '16MP',
    // Switch Specs
    puertos_poe: sw.puertos_poe_totales || dt.puertos_poe || (prod.tipo_dispositivo === 'SWITCH' ? 24 : null),
    puertos_uplink: sw.puertos_uplink_rj45 ? `${sw.puertos_uplink_rj45}x Uplink` : (dt.puertos_uplink || ''),
    presupuesto_poe: sw.presupuesto_poe_watts || dt.presupuesto_poe_watts || (prod.tipo_dispositivo === 'SWITCH' ? 250 : null),
    poe_budget: sw.presupuesto_poe_watts || dt.presupuesto_poe_watts || 250,
    wdr: cam.wdr || dt.wdr || 'Digital WDR',
    modo_extendido: sw.modo_extend_cctv_250m !== undefined ? sw.modo_extend_cctv_250m : Boolean(dt.modo_extendido),
    analiticas_ia: cam.analiticas_ia?.clasificacion_objetos || nvr.ia_propia_nvr || dt.analiticas_ia || []
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
