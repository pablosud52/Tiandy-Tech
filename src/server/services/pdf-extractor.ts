import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { Producto, TipoDispositivo, DatosCamara, DatosNVR, DatosSwitch } from '../../shared/types.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractFromPdf(pdfBuffer: Buffer, fileName: string): Promise<Producto> {
  const data = await pdfParse(pdfBuffer);
  const text = data.text;

  // 1. Clasificación de tipo
  let tipo: TipoDispositivo = 'CAMARA';
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('poe switch') || lowerText.includes('ethernet switch') || lowerText.includes('poe ports')) {
    tipo = 'SWITCH';
  } else if (lowerText.includes('nvr') || lowerText.includes('network video recorder') || lowerText.includes('ai nvr')) {
    tipo = 'NVR';
  } else {
    tipo = 'CAMARA';
  }

  // 2. Extraer modelo y especificación
  // Buscamos patrones típicos de Tiandy: TC-C..., TC-R..., TC-P..., TC-H...
  const modelMatch = text.match(/\b(TC-[A-Z0-9]+(?:\s+[^\r\n]+)?)/i);
  let modeloCompleto = modelMatch ? modelMatch[1].trim() : path.basename(fileName, '.pdf').replace(/_/g, ' ');
  
  // Limpiar modelo corto (ej: TC-C32QV)
  const baseModelMatch = modeloCompleto.match(/\b(TC-[A-Z0-9]+)/i);
  const modeloBase = baseModelMatch ? baseModelMatch[1].toUpperCase() : modeloCompleto.split(' ')[0];

  // 3. Extraer serie comercial
  let serie = 'General Series';
  if (/Spark\s+Series/i.test(text)) serie = 'Spark Series';
  else if (/Lite\s+Series/i.test(text) || /Lite-CUBE/i.test(text) || /Lite-K/i.test(text)) serie = 'Lite Series';
  else if (/Pro\s+Series/i.test(text)) serie = 'Pro Series';
  else if (/Ultra\s+Series/i.test(text)) serie = 'Ultra Series';
  else if (/Turbo\s+AI\+/i.test(text)) serie = 'Turbo AI+';
  else if (/AK\s*2|AK2/i.test(text) || /AK\s+Series/i.test(text)) serie = 'AK Series';
  else if (/SK\s*2|SK2/i.test(text) || /SK\s+Series/i.test(text)) serie = 'SK Series';
  else if (/LK\s*2|LK2/i.test(text) || /LK\s+Series/i.test(text)) serie = 'LK Series';

  // 4. Badges tecnológicos detectados
  const badges: string[] = [];
  if (/Polar\s*Day/i.test(text) || /0\.000[1-5]\s*Lux/i.test(text)) badges.push('Polar Day');
  if (/ColorMaker/i.test(text) || (/F1\.0/i.test(text) && /White\s*LED/i.test(text))) badges.push('ColorMaker');
  if (/Early\s*Warning/i.test(text) || /red\s*and\s*blue\s*alarm/i.test(text)) badges.push('Early Warning');
  if (/180°|Dual\s*Sensor|Dual\s*Lens|Panorami/i.test(text)) badges.push('180° Panorámica');
  if (/4K|8MP|3840\s*[×x]\s*2160/i.test(text)) badges.push('4K Ultra HD');
  if (/SMD\s*2\.0|Human\/Vehicle/i.test(text)) badges.push('SMD 2.0');
  if (/Face\s*Recognition|Reconocimiento\s*Facial/i.test(text)) badges.push('Face Recognition');
  if (/Wi-Fi|WIFI/i.test(text)) badges.push('Wi-Fi');
  if (/4G|Solar/i.test(text)) badges.push('4G Solar');
  if (/250m|PoE\s*Watchdog/i.test(text)) badges.push('PoE Watchdog');

  // 5. Extracción de subtipo
  let subtipo = '';
  const subMatch = text.match(/\b(\d+MP\s+[^\r\n]+(?:Camera|NVR|Switch))/i);
  if (subMatch) {
    subtipo = subMatch[1].trim();
  }

  // 6. Extracción técnica según tipo
  const datos_tecnicos: any = {};

  if (tipo === 'CAMARA') {
    const camara: DatosCamara = {
      formato: 'Bullet',
      conectividad_tipo: 'Cableada (PoE/RJ45)',
      movimiento_tipo: 'Fija',
      optica_tipo: 'Estándar',
      resolucion_mp: '2MP',
      resolucion_max_pixels: '1920x1080@30fps',
      sensor_imagen: '1/2.8" CMOS',
      distancia_focal: '2.8mm',
      apertura_iris: 'F1.6',
      dori_metros: {}
    };

    // Formato
    if (/Turret|Eyeball/i.test(text)) camara.formato = 'Turret';
    else if (/Dome|Domo/i.test(text)) camara.formato = 'Domo';
    else if (/PTZ/i.test(text)) { camara.formato = 'PTZ'; camara.movimiento_tipo = 'PT / PTZ Móvil'; }
    else if (/PT\s*Camera|PT\b/i.test(text)) { camara.formato = 'PT'; camara.movimiento_tipo = 'PT / PTZ Móvil'; }
    else if (/Fisheye/i.test(text)) camara.formato = 'Fisheye';
    else if (/Bullet/i.test(text)) camara.formato = 'Bullet';

    // Conectividad
    if (/Wi-Fi|WIFI/i.test(text)) camara.conectividad_tipo = 'Wi-Fi';
    else if (/4G|Solar/i.test(text)) camara.conectividad_tipo = '4G Celular / Solar';

    // Óptica
    if (/180°|Dual\s*Sensor|Dual\s*Lens/i.test(text)) camara.optica_tipo = 'Panorámica 180° (Dual Sensor)';
    else if (/Zoom|Optical\s*Zoom|\b25X\b|\b44X\b/i.test(text)) camara.optica_tipo = 'Zoom Óptico (PTZ)';

    // Resolución
    const resMpMatch = text.match(/\b([2-8]MP(?:\s*\+\s*[2-8]MP)?)\b/i);
    if (resMpMatch) camara.resolucion_mp = resMpMatch[1].toUpperCase();

    const resPixelsMatch = text.match(/(?:Max\.\s*Resolution|Up\s*to\s*[2-8]MP,?)\s*(\d{3,4}\s*[×x*]\s*\d{3,4}(?:@\d+fps)?)/i);
    if (resPixelsMatch) camara.resolucion_max_pixels = resPixelsMatch[1].replace(/\s+/g, '');

    // Sensor
    const sensorMatch = text.match(/(1\/\d(?:\.\d+)?["”]?\s*(?:CMOS|Progressive\s*Scan))/i);
    if (sensorMatch) camara.sensor_imagen = sensorMatch[1];

    // Lente / Distancia focal
    const focalMatch = text.match(/\b(\d(?:\.\d+)?(?:-\d+(?:\.\d+)?)?mm)\b/i);
    if (focalMatch) camara.distancia_focal = focalMatch[1];

    // Apertura
    const irisMatch = text.match(/\b(F1\.[0-6]|F2\.[0-4])\b/i);
    if (irisMatch) camara.apertura_iris = irisMatch[1];

    // FOV
    const fovH = text.match(/(\d+(?:\.\d+)?°)\s*\([Hh]/);
    const fovV = text.match(/(\d+(?:\.\d+)?°)\s*\([Vv]/);
    const fovD = text.match(/(\d+(?:\.\d+)?°)\s*\([Dd]/);
    if (fovH || fovV || fovD) {
      camara.campo_vision_fov = {
        horizontal: fovH ? fovH[1] : undefined,
        vertical: fovV ? fovV[1] : undefined,
        diagonal: fovD ? fovD[1] : undefined
      };
    }

    // DORI (Detect, Observe, Recognize, Identify)
    const dMatch = text.match(/Detect:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const oMatch = text.match(/Observe:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const rMatch = text.match(/Recognize:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const iMatch = text.match(/Identify:?\s*(\d+(?:\.\d+)?)\s*m/i);
    if (dMatch || oMatch || rMatch || iMatch) {
      camara.dori_metros = {
        detectar: dMatch ? parseFloat(dMatch[1]) : null,
        observar: oMatch ? parseFloat(oMatch[1]) : null,
        reconocer: rMatch ? parseFloat(rMatch[1]) : null,
        identificar: iMatch ? parseFloat(iMatch[1]) : null
      };
    }

    // Iluminación mínima
    const luxMatch = text.match(/Color:?\s*(0\.000?\d+\s*Lux[^\r\n,;]+)/i);
    if (luxMatch) camara.iluminacion_minima_color = luxMatch[1].trim();

    // Luces IR y Blanca
    const irMatch = text.match(/(?:IR\s*range|IR\s*Distance)[^\d]*(\d+)\s*m/i);
    if (irMatch) camara.alcance_ir_metros = parseInt(irMatch[1], 10);

    const whiteMatch = text.match(/(?:Whitelight\s*Distance|White\s*LEDs?[^\d]*up\s*to)\s*(\d+)\s*m/i);
    if (whiteMatch) camara.alcance_luz_blanca_metros = parseInt(whiteMatch[1], 10);

    // Audio
    if (/Built-in\s*Mic(?:rophone)?\s*(?:and|&|\+)\s*(?:Speaker|Loudspeaker)/i.test(text) || /Two-Way\s*Audio/i.test(text)) {
      camara.interfaces = { ...camara.interfaces, audio_integrado: 'Micrófono + Parlante' };
    } else if (/Built-in\s*Mic/i.test(text)) {
      camara.interfaces = { ...camara.interfaces, audio_integrado: 'Solo Micrófono' };
    }

    // Alarmas (TTL vs Relay)
    if (/TTL\s*output/i.test(text)) {
      camara.interfaces = { ...camara.interfaces, salida_alarma: '1x TTL (12V DC, 30mA)' };
    } else if (/relay\s*output/i.test(text)) {
      camara.interfaces = { ...camara.interfaces, salida_alarma: '1x Relé mecánico' };
    }

    // SD Card
    const sdMatch = text.match(/MicroSD[^\d]*(\d+GB)/i);
    if (sdMatch) {
      camara.interfaces = { ...camara.interfaces, ranura_sd: `MicroSD hasta ${sdMatch[1]}` };
    }

    // Dimensiones y peso
    const dimMatch = text.match(/(?:Boundary\s*Dimensions|Dimensions)[^\d]*(\d+\s*\(?[LWH]\)?\s*\d+\s*\(?[LWH]\)?\s*\d+\s*\(?[LWH]\)?\s*mm|\d+\s*[×x*]\s*\d+\s*[×x*]\s*\d+\s*mm)/i);
    if (dimMatch) camara.fisico = { ...camara.fisico, dimensiones_mm: dimMatch[1] };

    const weightMatch = text.match(/(?:GrossWeight|Gross\s*Weight|NetWeight)[^\d]*(\d+(?:\.\d+)?)\s*kg/i);
    if (weightMatch) camara.fisico = { ...camara.fisico, peso_kg: parseFloat(weightMatch[1]) };

    // Protección IP
    if (/IP67/i.test(text)) camara.fisico = { ...camara.fisico, grado_ip: 'IP67' };
    else if (/IP66/i.test(text)) camara.fisico = { ...camara.fisico, grado_ip: 'IP66' };

    datos_tecnicos.camara = camara;

  } else if (tipo === 'NVR') {
    const nvr: DatosNVR = {
      canales_ip: 10,
      ancho_banda_ingreso_mbps: 100,
      ancho_banda_egreso_mbps: 80,
      bahias_sata: 1,
      capacidad_max_por_disco_tb: 10,
      puertos_poe_integrados: 0,
      salidas_video: ['HDMI', 'VGA'],
      resolucion_max_grabacion: '16MP',
      decodificacion_simultanea: ''
    };

    // Canales
    const chMatch = text.match(/(\d+)\s*[-]?\s*ch(?:annel)?\s*(?:IP|AI)?/i);
    if (chMatch) nvr.canales_ip = parseInt(chMatch[1], 10);

    // Bandwidth
    const bwMatch = text.match(/Incoming\/Outgoing\s*bandwidth:?\s*(\d+)Mbps\/(\d+)Mbps/i);
    if (bwMatch) {
      nvr.ancho_banda_ingreso_mbps = parseInt(bwMatch[1], 10);
      nvr.ancho_banda_egreso_mbps = parseInt(bwMatch[2], 10);
    }

    // SATA
    const sataMatch = text.match(/(\d+)\s*(?:HDD|SATA)/i);
    if (sataMatch) nvr.bahias_sata = parseInt(sataMatch[1], 10);

    const tbMatch = text.match(/Up\s*to\s*(\d+)\s*TB\s*capacity/i);
    if (tbMatch) nvr.capacidad_max_por_disco_tb = parseInt(tbMatch[1], 10);

    // PoE integrados
    const poeMatch = text.match(/(\d+)\s*POE/i);
    if (poeMatch) nvr.puertos_poe_integrados = parseInt(poeMatch[1], 10);

    // IA por NVR
    const iaNvr: string[] = [];
    if (/Face\s*Recognition/i.test(text)) iaNvr.push('Reconocimiento Facial');
    if (/Smart\s*Motion\s*Detection|SMD/i.test(text)) iaNvr.push('SMD (Human/Vehicle)');
    if (/Tripwire|Perimeter/i.test(text)) iaNvr.push('Cruce de Línea y Perímetro');
    nvr.ia_propia_nvr = iaNvr;

    datos_tecnicos.nvr = nvr;

  } else if (tipo === 'SWITCH') {
    const sw: DatosSwitch = {
      puertos_poe_totales: 24,
      velocidad_puertos_poe: '10/100/1000 Mbps (Gigabit)',
      puertos_uplink_rj45: 2,
      velocidad_uplink_rj45: '1000 Mbps (Gigabit)',
      puertos_sfp_fibra: 2,
      velocidad_sfp: '1000 Mbps (Gigabit)',
      presupuesto_poe_watts: 280,
      estandar_poe: ['802.3af (15.4W)', '802.3at (30W)'],
      modo_extend_cctv_250m: true,
      poe_watchdog: true
    };

    // Puertos PoE
    const poePortsMatch = text.match(/(\d+)\s*[*x]?\s*(?:10\/100\/1000M|Gigabit|10\/100M)?\s*PoE\s*Ports/i);
    if (poePortsMatch) sw.puertos_poe_totales = parseInt(poePortsMatch[1], 10);

    // Watts
    const wattsMatch = text.match(/(?:POE\s*power:?\s*maximum|budget)[^\d]*(\d+)\s*W/i);
    if (wattsMatch) sw.presupuesto_poe_watts = parseInt(wattsMatch[1], 10);

    datos_tecnicos.switch = sw;
  }

  return {
    modelo: modeloBase,
    especificacion_completa: modeloCompleto,
    serie,
    tipo_dispositivo: tipo,
    subtipo,
    badge_nuevo: false,
    visible: true,
    precio_usd: null,
    estado_stock: 'ENTREGA_INMEDIATA',
    fecha_arribo_estimada: null,
    codigo_interno: null,
    codigo_barras_ean: null,
    imagen_principal: `/data/img/${modeloBase}.webp`,
    datasheet_pdf: `/data/docs/${fileName}`,
    badges_detectados: badges,
    datos_tecnicos
  };
}
