import { createRequire } from 'module';
import path from 'path';
import { 
  Producto, 
  TipoDispositivo, 
  DatosCamara, 
  DatosNVR, 
  DatosSwitch, 
  CaracteristicasPrincipalesCamara,
  CaracteristicasPrincipalesNVR,
  CaracteristicasPrincipalesSwitch,
  EspecificacionesDatasheet
} from '../../shared/types.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Parsea la tabla completa de SPECIFICATIONS de un datasheet Tiandy,
 * agrupando por categorías técnicas y omitiendo DIMENSIONS, KEY FEATURES y diagramas.
 */
export function parseEspecificacionesDatasheet(text: string): EspecificacionesDatasheet {
  const specMatch = text.search(/SPECIFICATIONS/i);
  if (specMatch === -1) return {};

  let content = text.substring(specMatch + 'SPECIFICATIONS'.length);

  // Exclusiones estrictas ordenadas por el usuario:
  // - No incluir DIMENSIONS (Unit: mm)
  // - No incluir Assembly diagram of Junction Box
  const stopMatches = [
    /DIMENSIONS\s*\(Unit:\s*mm\)/i,
    /DIMENSIONS\s*\(Unit:mm\)/i,
    /Assembly\s*diagram\s*of\s*Junction\s*Box/i,
    /Assembly\s*diagram/i,
    /Packing\s*Info/i
  ];

  let cutoff = content.length;
  for (const regex of stopMatches) {
    const m = content.search(regex);
    if (m !== -1 && m < cutoff) {
      cutoff = m;
    }
  }
  content = content.substring(0, cutoff);

  const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // Filtrar fechas aisladas como 2025.12.02 o 2024-04-03 y números de página
  const lines = rawLines.filter(l => !/^\d{4}[.\-/]\d{2}([.\-/]\d{2})?$/.test(l) && !/^\d+$/.test(l));

  const knownCategories = [
    'Camera', 'Lens', 'DORI Distance', 'Illuminator', 'Compression Standard',
    'Image', 'Feature', 'Network', 'Interface', 'General',
    'Video and Audio', 'Audio and Video', 'Compression', 'Record Playback', 'Alarm', 'Intelligent Analytics',
    'I/O Interface', 'Performance', 'Standard', 'Function', 'DIP Switch', 'Environment',
    'Physical Specifications', 'Power Voltage', 'Power'
  ];

  const knownKeyPrefixes = [
    // Camera
    'Image Sensor', 'Min. Illumination', 'Shutter Time', 'Day&Night', 'Day & Night',
    'Smart IR', 'WDR', 'S/N', 'Angle Adjustment', 'Lens Type', 'Focal Length',
    'Lens Mount', 'Aperture Range', 'Aperture Type', 'Field of View', 'DORI Distance',
    'Detect', 'Observe', 'Recognize', 'Identify', 'IR LEDs', 'IR Distance', 'Wavelength',
    'White LEDs', 'Whitelight Distance', 'Video Compression', 'Video Bit Rate',
    'Audio Compression', 'Audio Sampling Rate', 'Max. Resolution', 'Main Stream',
    'Sub Stream', 'Third Stream', 'BLC', 'HLC', 'AGC', '3D DNR', 'White Balance',
    'OSD', 'Privacy Mask', 'Defog', 'General Alarm', 'Exceptions Alarm', 'Intelligent Analytics',
    'VCA', 'Protocols', 'System Compatibility', 'Remote Connection', 'Client', 'Web',
    'Communication Interface', 'Audio I/O', 'Alarm I/O', 'Reset Button', 'On-board storage',
    'Web Client Language', 'Operating Temperature', 'Operating Humidity', 'Storage Temperature',
    'Storage Humidity', 'Power Supply', 'Protection', 'Boundary Dimensions', 'Package Dimensions',
    'GrossWeight', 'NetWeight', 'Casing', 'Housing',
    // NVR
    'Access Channel', 'Incoming Bandwidth', 'Outgoing Bandwidth', 'Resolution',
    'Preview Decoding Capability', 'Third-party Camera Access', 'HDMI Output', 'Liveview display',
    'VGA Output', 'Multi-screen Display', 'Video', 'Audio', 'Stream Type', 'Network Protocol',
    'Mobile Phone Access', 'Multi-channel Playback', 'Record Mode', 'Storage Method',
    'Backup', 'Playback Function', 'AI by Camera', 'AI by NVR', 'SATA', 'Capacity',
    // Switch
    'Power', 'Ethernet', 'Bandwidth', 'Throughput', 'Packet Buffer', 'MAC Address',
    'Transfer Mode', 'Network Protocol', 'PoE Protocol', 'Industrial Standard', 'Network Medium',
    'LED Indicators', 'POE LED Buttons', 'VLAN', 'Default', 'Extend', 'Working Environment',
    'Working Temperature', 'Storage Temperature', 'Working Humidity', 'Dimension', 'Product Dimension',
    'Package Dimension', 'N.W', 'G.W', 'Input Voltage', 'Supply Power', 'Mainboard power consumption', 'POE power'
  ];

  const categorySynonyms: Record<string, string> = {
    'video & audio': 'Video and Audio',
    'audio & video': 'Video and Audio',
    'audio/video': 'Video and Audio',
    'interfaces': 'Interface',
    'i/o interfaces': 'Interface',
    'i/o interface': 'Interface',
    'physical': 'Physical Specifications',
    'dimensions': 'Physical Specifications',
    'power': 'General',
    'power voltage': 'General',
    'environment': 'General',
    'working environment': 'General'
  };

  const keySynonyms: Record<string, string> = {
    'supply power': 'Power Supply',
    'supply voltage': 'Power Supply',
    'input voltage': 'Power Supply',
    'power': 'Power Supply',
    'working temperature': 'Operating Temperature',
    'working humidity': 'Operating Humidity',
    'alarm input / output': 'Alarm I/O',
    'alarm input/output': 'Alarm I/O',
    'alarm in/out': 'Alarm I/O',
    'audio input / output': 'Audio I/O',
    'audio in/out': 'Audio I/O',
    'product dimension': 'Boundary Dimensions',
    'dimension': 'Boundary Dimensions',
    'package dimension': 'Package Dimensions'
  };

  const specs: EspecificacionesDatasheet = {};
  let currentCategory = 'General';
  specs[currentCategory] = {};

  let currentKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Verificar si la línea es un encabezado de categoría
    const lineLower = line.toLowerCase();
    const matchedCat = knownCategories.find(c => c.toLowerCase() === lineLower) || categorySynonyms[lineLower];
    if (matchedCat) {
      const normalizedCat = categorySynonyms[matchedCat.toLowerCase()] || matchedCat;
      currentCategory = normalizedCat;
      if (!specs[currentCategory]) specs[currentCategory] = {};
      currentKey = null;
      continue;
    }

    let key = '';
    let val = '';

    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !line.startsWith('http') && colonIdx < 32 && !/^\d+:\d+/.test(line)) {
      key = line.substring(0, colonIdx).trim();
      val = line.substring(colonIdx + 1).trim();
    } else {
      const foundPrefix = knownKeyPrefixes.find(p => line.toLowerCase().startsWith(p.toLowerCase()));
      if (foundPrefix) {
        key = foundPrefix;
        val = line.substring(foundPrefix.length).trim().replace(/^[:\s-]+/, '');
      } else {
        const match = line.match(/^([A-Za-z0-9\/\-&() ]+?)\s{2,}(.+)$/);
        if (match && match[1].length <= 32) {
          key = match[1].trim();
          val = match[2].trim();
        } else {
          // Si teníamos una clave anterior sin valor, esta línea es su valor
          if (currentKey && (!specs[currentCategory][currentKey] || specs[currentCategory][currentKey] === '')) {
            specs[currentCategory][currentKey] = line;
            continue;
          } else if (currentKey && specs[currentCategory][currentKey]) {
            specs[currentCategory][currentKey] += '; ' + line;
            continue;
          } else {
            key = line;
            val = '';
          }
        }
      }
    }

    if (key) {
      const normalizedKey = keySynonyms[key.toLowerCase()] || key;
      currentKey = normalizedKey;
      specs[currentCategory][normalizedKey] = val || null;
    }
  }

  // Eliminar categorías vacías
  for (const cat of Object.keys(specs)) {
    if (Object.keys(specs[cat]).length === 0) {
      delete specs[cat];
    }
  }

  return specs;
}

/**
 * Genera el resumen homologado de CARACTERÍSTICAS PRINCIPALES para la ficha rápida.
 */
export function extractCaracteristicasPrincipales(
  text: string, 
  tipo: TipoDispositivo
): CaracteristicasPrincipalesCamara | CaracteristicasPrincipalesNVR | CaracteristicasPrincipalesSwitch {
  if (tipo === 'CAMARA') {
    // 1. Formato
    let formato = 'Bullet';
    if (/Turret|Eyeball/i.test(text)) formato = 'Turret';
    else if (/Dome|Domo/i.test(text)) formato = 'Domo';
    else if (/PTZ/i.test(text)) formato = 'PTZ';
    else if (/PT\s*Camera|PT\b/i.test(text)) formato = 'PT';
    else if (/Fisheye/i.test(text)) formato = 'Fisheye';
    else if (/Bullet/i.test(text)) formato = 'Bullet';

    // 2. Carcasa
    let carcasa = 'Metal';
    if (/Metal\s*\+\s*plastic|Metal\s*and\s*plastic/i.test(text)) carcasa = 'Metal + Plástico';
    else if (/Plastic\s*housing/i.test(text)) carcasa = 'Plástico';
    else if (/Metal\s*housing|Full\s*metal/i.test(text)) carcasa = 'Metal';
    else if (/Plastic/i.test(text) && !/Metal/i.test(text)) carcasa = 'Plástico';

    // 3. Resolución
    let resolucion = '2MP';
    const resMpMatch = text.match(/\b([2-8]MP(?:\s*\+\s*[2-8]MP)?)\b/i);
    if (resMpMatch) resolucion = resMpMatch[1].toUpperCase();

    // 4. Sensor
    let sensor = '1/2.8" CMOS';
    const sMatch = text.match(/(1\/\d(?:\.\d+)?["”]?\s*(?:CMOS|Progressive\s*Scan))/i);
    if (sMatch) sensor = sMatch[1].trim();

    // 5. Min. Iluminación
    let min_iluminacion = 'Color: 0.0001Lux @ F1.0';
    const luxMatch = text.match(/Color:?\s*(\d+(?:\.\d+)?\s*Lux[^\r\n,;]+)/i);
    if (luxMatch) min_iluminacion = `Color: ${luxMatch[1].trim()}`;

    // 6. Visión Nocturna
    let vision_nocturna = 'IR 30m';
    const irMatch = text.match(/(?:IR\s*range|IR\s*Distance)[^\d]*(\d+)\s*m/i);
    const whiteMatch = text.match(/(?:Whitelight\s*Distance|White\s*LEDs?[^\d]*up\s*to)\s*(\d+)\s*m/i);
    if (irMatch && whiteMatch) {
      vision_nocturna = `IR ${irMatch[1]}m / Luz Blanca ${whiteMatch[1]}m`;
    } else if (whiteMatch) {
      vision_nocturna = `Luz Blanca LED ${whiteMatch[1]}m`;
    } else if (irMatch) {
      vision_nocturna = `IR LED ${irMatch[1]}m`;
    }

    // 7. DORI (Detecta, Observa, Reconoce, Identifica)
    let dori = null;
    const dMatch = text.match(/Detect:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const oMatch = text.match(/Observe:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const rMatch = text.match(/Recognize:?\s*(\d+(?:\.\d+)?)\s*m/i);
    const iMatch = text.match(/Identify:?\s*(\d+(?:\.\d+)?)\s*m/i);
    if (dMatch || oMatch || rMatch || iMatch) {
      dori = {
        detecta: dMatch ? `${dMatch[1]}m` : null,
        observa: oMatch ? `${oMatch[1]}m` : null,
        reconoce: rMatch ? `${rMatch[1]}m` : null,
        identifica: iMatch ? `${iMatch[1]}m` : null
      };
    }

    // 8. Almacenamiento
    let almacenamiento: string | null = null;
    const sdMatch = text.match(/MicroSD[^\d]*(\d+GB)/i);
    if (sdMatch) {
      almacenamiento = `MicroSD hasta ${sdMatch[1]}`;
    }

    // 9. Compresión de video
    let compresion_video = 'S+265/H.265/H.264B/H.264M/H.264H';
    const compMatch = text.match(/Video\s*Compression\s*[:\s]*([S\+0-9A-Za-z\/\.\-]+)/i);
    if (compMatch && compMatch[1].length > 4) {
      compresion_video = compMatch[1].trim();
    }

    // 10. SMD: usuario estricto: "solo tiene que indicar la versión, SMD 2.0 o SMD 1.0 y si no corresponde -"
    let smd: string | null = null;
    if (/SMD\s*2\.0|SMD2\.0/i.test(text)) smd = 'SMD 2.0';
    else if (/SMD\s*1\.0|SMD1\.0/i.test(text)) smd = 'SMD 1.0';

    // 11. VCA
    let vca: string | null = null;
    const vcaList: string[] = [];
    if (/Human\/Vehicle|Clasificación\s*Humano/i.test(text)) vcaList.push('Human/Vehicle Classification');
    if (/Tripwire/i.test(text)) vcaList.push('Tripwire');
    if (/Perimeter/i.test(text)) vcaList.push('Perimeter');
    if (/Video\s*Abnormal/i.test(text)) vcaList.push('Video Abnormal');
    if (/Audio\s*Abnormal/i.test(text)) vcaList.push('Audio Abnormal');
    if (/Face\s*Detection|Face\s*Capture/i.test(text)) vcaList.push('Face Detection');
    if (vcaList.length > 0) {
      vca = vcaList.join('; ');
    }

    // 12. Alimentación
    let alimentacion = 'DC12V, PoE IEEE 802.3af';
    const psMatch = text.match(/Power\s*Supply\s*:?([^\r\n]+)/i);
    if (psMatch) {
      alimentacion = psMatch[1].split(/Protection|Operating|Working|Dimension|Weight/i)[0].trim();
    }

    // 13. Salidas Alarma
    let salidas_alarma: string | null = null;
    if (/TTL\s*output/i.test(text)) {
      salidas_alarma = '1-ch, TTL (NO relé), 30mA, 12VDC';
    } else if (/relay\s*output/i.test(text)) {
      salidas_alarma = '1-ch, Relé mecánico';
    } else if (/Alarm\s*Output/i.test(text)) {
      salidas_alarma = '1-ch Salida de alarma';
    }

    const cam: CaracteristicasPrincipalesCamara = {
      formato,
      carcasa,
      resolucion,
      sensor,
      min_iluminacion,
      vision_nocturna,
      dori,
      almacenamiento,
      compresion_video,
      smd,
      vca,
      alimentacion,
      salidas_alarma
    };
    return cam;

  } else if (tipo === 'NVR') {
    let canales_ip = '10 canales';
    const chMatch = text.match(/(\d+)\s*[-]?\s*ch(?:annel)?\s*(?:IP|AI)?/i);
    if (chMatch) canales_ip = `${chMatch[1]} canales`;

    let ancho_banda = 'Entrada: 60Mbps / Salida: 40Mbps';
    const bwMatch = text.match(/Incoming\/Outgoing\s*bandwidth:?\s*(\d+)Mbps\/(\d+)Mbps/i);
    if (bwMatch) ancho_banda = `Entrada: ${bwMatch[1]}Mbps / Salida: ${bwMatch[2]}Mbps`;

    let bahias_sata = '1x SATA';
    const sataMatch = text.match(/(\d+)\s*(?:HDD|SATA)/i);
    if (sataMatch) bahias_sata = `${sataMatch[1]}x SATA`;

    let capacidad_max = 'Hasta 10TB por disco';
    const tbMatch = text.match(/Up\s*to\s*(\d+)\s*TB/i);
    if (tbMatch) capacidad_max = `Hasta ${tbMatch[1]}TB por disco`;

    let puertos_poe: string | null = null;
    const poeMatch = text.match(/(\d+)\s*POE/i);
    if (poeMatch && parseInt(poeMatch[1], 10) > 0) puertos_poe = `${poeMatch[1]} puertos PoE integrados`;

    let salidas_video = 'HDMI (4K) / VGA simultáneo';
    if (/HDMI/i.test(text) && /VGA/i.test(text)) salidas_video = 'HDMI (4K) / VGA';

    let decodificacion = '6MP(30fps)×1, 1080P(30fps)×4';
    const decMatch = text.match(/Preview\s*Decoding\s*Capability\s*:?([^\r\n]+)/i);
    if (decMatch) decodificacion = decMatch[1].trim();

    let compresion = 'S+265 / H.265 / S+264 / H.264';
    const nvrCompMatch = text.match(/(?:Video\s*:?)\s*(S\+265[^\r\n]+)/i);
    if (nvrCompMatch) compresion = nvrCompMatch[1].trim();

    let ia_soportada: string | null = null;
    const iaList: string[] = [];
    if (/Face\s*Recognition/i.test(text)) iaList.push('Reconocimiento Facial');
    if (/SMD|Smart\s*Motion/i.test(text)) iaList.push('SMD (Humano/Vehículo)');
    if (/Tripwire/i.test(text)) iaList.push('Tripwire y Perímetro');
    if (iaList.length > 0) ia_soportada = iaList.join('; ');

    let alimentacion = 'DC12V';
    const nvrPs = text.match(/Power\s*Supply\s*:?([^\r\n]+)/i);
    if (nvrPs) alimentacion = nvrPs[1].split(/Protection|Operating|Working|Dimension/i)[0].trim();

    const nvr: CaracteristicasPrincipalesNVR = {
      canales_ip,
      ancho_banda,
      bahias_sata,
      capacidad_max,
      puertos_poe,
      salidas_video,
      decodificacion,
      compresion,
      ia_soportada,
      alimentacion
    };
    return nvr;

  } else {
    // SWITCH
    let puertos_poe = '8x Gigabit PoE';
    const poePorts = text.match(/(\d+)\s*[*x]?\s*(?:10\/100\/1000M|Gigabit|10\/100M)?\s*PoE\s*Ports/i);
    if (poePorts) puertos_poe = `${poePorts[1]} puertos PoE`;

    let velocidad_poe = '10/100/1000 Mbps (Gigabit)';
    if (/10\/100M\s*PoE/i.test(text)) velocidad_poe = '10/100 Mbps Fast Ethernet';

    let puertos_uplink = '2x Gigabit Uplink RJ45';
    const upMatch = text.match(/(\d+)\s*[*x]?\s*(?:Gigabit|10\/100\/1000M)?\s*Uplink\s*(?:Ethernet)?\s*Port/i);
    if (upMatch) puertos_uplink = `${upMatch[1]}x Gigabit Uplink RJ45`;

    let puertos_sfp: string | null = null;
    const sfpMatch = text.match(/(\d+)\s*[*x]?\s*SFP/i);
    if (sfpMatch) puertos_sfp = `${sfpMatch[1]}x SFP Fibra`;

    let presupuesto_watts = '110W (PoE Budget)';
    const wMatch = text.match(/(?:POE\s*power:?\s*maximum|budget)[^\d]*(\d+)\s*W/i);
    if (wMatch) presupuesto_watts = `${wMatch[1]}W`;

    let estandar_poe = 'IEEE802.3af (15.4W) / IEEE802.3at (30W)';
    let modo_extend = 'Extend 250m con PoE Watchdog';
    let poe_watchdog = 'Sí (Watchdog automático)';
    let alimentacion = 'AC 100-240V 50/60Hz';

    const sw: CaracteristicasPrincipalesSwitch = {
      puertos_poe,
      velocidad_poe,
      puertos_uplink,
      puertos_sfp,
      presupuesto_watts,
      estandar_poe,
      modo_extend,
      poe_watchdog,
      alimentacion
    };
    return sw;
  }
}

/**
 * Función principal que procesa el buffer de un PDF y genera el producto con todas sus
 * especificaciones estructuradas y matriz para la comparativa.
 */
export async function extractFromPdf(pdfBuffer: Buffer, fileName: string): Promise<Producto> {
  let data: any;
  try {
    data = await pdfParse(pdfBuffer, { max: 0 });
  } catch (err: any) {
    try {
      const cloned = Buffer.from(pdfBuffer);
      data = await pdfParse(cloned);
    } catch (err2: any) {
      throw new Error(`Error procesando PDF: ${err2.message || err.message}`);
    }
  }

  const text = data?.text || '';

  // 1. Clasificación estricta de tipo
  let tipo: TipoDispositivo = 'CAMARA';
  const lowerText = text.toLowerCase();
  const lowerFile = fileName.toLowerCase();

  if (lowerText.includes('poe switch') || lowerText.includes('ethernet switch') || lowerFile.includes('tc-p3s') || lowerFile.includes('tc-s3')) {
    tipo = 'SWITCH';
  } else if (lowerText.includes('network video recorder') || lowerText.includes('ai nvr') || lowerFile.includes('tc-r')) {
    tipo = 'NVR';
  } else {
    tipo = 'CAMARA';
  }

  // 2. Extraer modelo base y especificación (Spec)
  let modeloBase = '';
  let variantSpec = '';

  const lines = text.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0);
  
  // Buscar en las primeras 50 líneas donde figura el modelo del datasheet
  for (const line of lines.slice(0, 50)) {
    const match = line.match(/\b(TC-[A-Z0-9]+)\b/i);
    if (match) {
      modeloBase = match[1].toUpperCase();
      const idx = line.indexOf(match[0]);
      let rest = line.substring(idx + match[0].length).trim();
      
      // Limpiar prefijo 'Spec:' o 'Spec' o ': '
      rest = rest.replace(/^Spec[:.\s-]*/i, '').trim();
      
      if (rest) {
        variantSpec = rest;
        break;
      }
    }
  }

  // Fallback si no se encontró en el cuerpo del texto: examinar nombre de archivo
  if (!modeloBase) {
    const fileBase = path.basename(fileName, '.pdf').replace(/_/g, ' ');
    const match = fileBase.match(/\b(TC-[A-Z0-9]+)\b/i);
    if (match) {
      modeloBase = match[1].toUpperCase();
      const idx = fileBase.indexOf(match[0]);
      let rest = fileBase.substring(idx + match[0].length).trim();
      rest = rest.replace(/^Spec[:.\s-]*/i, '').trim();
      if (rest) variantSpec = rest;
    } else {
      modeloBase = fileBase;
    }
  }

  // Si tenemos modelo base pero no encontramos variantSpec en el texto del PDF,
  // examinar si el nombre del archivo contiene la especificación/variante
  if (modeloBase && !variantSpec) {
    const fileBase = path.basename(fileName, '.pdf').replace(/_/g, ' ');
    if (fileBase.toUpperCase().includes(modeloBase)) {
      const idx = fileBase.toUpperCase().indexOf(modeloBase);
      let rest = fileBase.substring(idx + modeloBase.length).trim();
      rest = rest.replace(/^Spec[:.\s-]*/i, '').trim();
      if (rest) variantSpec = rest;
    }
  }

  // Limpiar cualquier residuo de "Spec:" en la variante
  variantSpec = variantSpec.replace(/\bSpec[:.\s-]*/gi, '').trim();

  // El modelo exacto resultante: ambos conforman el modelo exacto
  const modeloExacto = variantSpec ? `${modeloBase} ${variantSpec}` : modeloBase;

  // 3. Serie comercial: no se asigna automáticamente, queda vacía para selección manual en el panel
  const serie = '';

  // 4. Badges tecnológicos detectados
  const badges: string[] = [];
  if (/Polar\s*Day/i.test(text) || /0\.000[1-5]\s*Lux/i.test(text)) badges.push('Polar Day');
  if (/ColorMaker/i.test(text) || (/F1\.0/i.test(text) && /White\s*LED/i.test(text))) badges.push('ColorMaker');
  if (/Early\s*Warning/i.test(text) || /red\s*and\s*blue\s*alarm/i.test(text)) badges.push('Early Warning');
  if (/180°|Dual\s*Sensor|Dual\s*Lens|Panorami/i.test(text)) badges.push('180° Panorámica');
  if (/4K|8MP|3840\s*[×x]\s*2160/i.test(text)) badges.push('4K Ultra HD');
  if (/SMD\s*2\.0/i.test(text)) badges.push('SMD 2.0');
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

  // 6. Extracción técnica para filtros legacy
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

    if (/Turret|Eyeball/i.test(text)) camara.formato = 'Turret';
    else if (/Dome|Domo/i.test(text)) camara.formato = 'Domo';
    else if (/PTZ/i.test(text)) { camara.formato = 'PTZ'; camara.movimiento_tipo = 'PT / PTZ Móvil'; }
    else if (/PT\s*Camera|PT\b/i.test(text)) { camara.formato = 'PT'; camara.movimiento_tipo = 'PT / PTZ Móvil'; }
    else if (/Fisheye/i.test(text)) camara.formato = 'Fisheye';
    else if (/Bullet/i.test(text)) camara.formato = 'Bullet';

    if (/Wi-Fi|WIFI/i.test(text)) camara.conectividad_tipo = 'Wi-Fi';
    else if (/4G|Solar/i.test(text)) camara.conectividad_tipo = '4G Celular / Solar';

    const resMpMatch = text.match(/\b([2-8]MP(?:\s*\+\s*[2-8]MP)?)\b/i);
    if (resMpMatch) camara.resolucion_mp = resMpMatch[1].toUpperCase();

    const sensorMatch = text.match(/(1\/\d(?:\.\d+)?["”]?\s*(?:CMOS|Progressive\s*Scan))/i);
    if (sensorMatch) camara.sensor_imagen = sensorMatch[1];

    const focalMatch = text.match(/\b(\d(?:\.\d+)?(?:-\d+(?:\.\d+)?)?mm)\b/i);
    if (focalMatch) camara.distancia_focal = focalMatch[1];

    const irisMatch = text.match(/\b(F1\.[0-6]|F2\.[0-4])\b/i);
    if (irisMatch) camara.apertura_iris = irisMatch[1];

    // DORI
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

    if (/MicroSD[^\d]*(\d+GB)/i.test(text)) camara.slot_sd = true;
    camara.microfono_incorporado = true;
    camara.altavoz_incorporado = /Built-in\s*Speaker|Two-Way\s*Audio|Sirena|Siren/i.test(text);

    // Alimentación normalizada
    let alimentacionCam = 'DC12V, PoE IEEE 802.3af';
    const psCamMatch = text.match(/Power\s*(?:Supply|Voltage|Input)?\s*:?([^\r\n]+)/i);
    if (psCamMatch) {
      alimentacionCam = psCamMatch[1].split(/Protection|Operating|Working|Dimension|Weight/i)[0].trim();
    }
    camara.alimentacion = { tipo: alimentacionCam };
    camara.alimentacion_tipo = alimentacionCam;

    // Interfaces Alarmas y Audio en Cámara
    camara.interfaces = camara.interfaces || {};
    if (/Alarm\s*Input|\b\d+\s*Alarm\s*In\b|TTL\s*inputs?/i.test(text)) {
      camara.interfaces.entrada_alarma = '1-ch Entrada de Alarma';
    }
    if (/Alarm\s*Output|\b\d+\s*Alarm\s*Out\b|TTL\s*outputs?|relay\s*output/i.test(text)) {
      camara.interfaces.salida_alarma = '1-ch Salida de Alarma';
    }
    if (/Audio\s*Output|Audio\s*I\/O|Two-Way\s*Audio|Line-out/i.test(text)) {
      camara.interfaces.audio_io_externo = '1-ch Salida / Audio 2 Vías';
    }

    datos_tecnicos.camara = camara;

  } else if (tipo === 'NVR') {
    const nvr: DatosNVR = {
      canales_ip: 10,
      ancho_banda_ingreso_mbps: 60,
      ancho_banda_egreso_mbps: 40,
      bahias_sata: 1,
      capacidad_max_por_disco_tb: 10,
      puertos_poe_integrados: 0,
      salidas_video: ['HDMI', 'VGA'],
      resolucion_max_grabacion: '16MP',
      decodificacion_simultanea: ''
    };

    const chMatch = text.match(/(\d+)\s*[-]?\s*ch(?:annel)?\s*(?:IP|AI)?/i);
    if (chMatch) nvr.canales_ip = parseInt(chMatch[1], 10);

    const sataMatch = text.match(/(\d+)\s*(?:HDD|SATA)/i);
    if (sataMatch) nvr.bahias_sata = parseInt(sataMatch[1], 10);

    // Puertos PoE en NVR (por modelo P4/P8/P16 o por texto)
    let poeCount = 0;
    const modelPoeMatch = (modeloExacto + ' ' + fileName).match(/[-_\s]P(4|8|16)\b/i);
    if (modelPoeMatch) {
      poeCount = parseInt(modelPoeMatch[1], 10);
    } else {
      const poeMatch = text.match(/(\d+)\s*(?:[-]?ch(?:annel)?|RJ45|ports?)?\s*PoE/i) || text.match(/PoE\s*Interface\s*:?\s*(\d+)/i) || text.match(/(\d+)\s*POE/i);
      if (poeMatch) poeCount = parseInt(poeMatch[1], 10);
    }
    nvr.puertos_poe_integrados = poeCount;
    nvr.canales_poe = poeCount;

    // Alarmas & Audio en NVR
    if (/Alarm\s*Input|\b\d+\s*Alarm\s*In\b|TTL\s*inputs?/i.test(text)) {
      nvr.entradas_alarma = 'Entrada de Alarma';
    }
    if (/Alarm\s*Output|\b\d+\s*Alarm\s*Out\b|TTL\s*outputs?/i.test(text)) {
      nvr.salidas_alarma = 'Salida de Alarma';
    }
    if (/Audio\s*Output|Audio\s*I\/O|Two-Way\s*Audio/i.test(text)) {
      nvr.audio_io = 'Salida de Audio / 2 Vías';
    }

    datos_tecnicos.nvr = nvr;

  } else if (tipo === 'SWITCH') {
    const sw: DatosSwitch = {
      puertos_poe_totales: 8,
      velocidad_puertos_poe: '10/100/1000 Mbps (Gigabit)',
      puertos_uplink_rj45: 2,
      velocidad_uplink_rj45: '1000 Mbps (Gigabit)',
      puertos_sfp_fibra: 0,
      velocidad_sfp: '1000 Mbps (Gigabit)',
      presupuesto_poe_watts: 110,
      estandar_poe: ['802.3af (15.4W)', '802.3at (30W)'],
      modo_extend_cctv_250m: true,
      poe_watchdog: true
    };

    const poePortsMatch = text.match(/(\d+)\s*[*x]?\s*(?:10\/100\/1000M|Gigabit|10\/100M)?\s*PoE\s*Ports/i);
    if (poePortsMatch) sw.puertos_poe_totales = parseInt(poePortsMatch[1], 10);

    const wattsMatch = text.match(/(?:POE\s*power:?\s*maximum|budget)[^\d]*(\d+)\s*W/i);
    if (wattsMatch) sw.presupuesto_poe_watts = parseInt(wattsMatch[1], 10);

    datos_tecnicos.switch = sw;
  }

  // 7. CARACTERÍSTICAS PRINCIPALES para la ficha rápida
  const caracteristicas_principales = extractCaracteristicasPrincipales(text, tipo);
  datos_tecnicos.caracteristicas_principales = caracteristicas_principales;

  // 8. ESPECIFICACIONES COMPLETAS DEL DATASHEET para la matriz de comparativa
  const especificaciones_datasheet = parseEspecificacionesDatasheet(text);
  datos_tecnicos.especificaciones_datasheet = especificaciones_datasheet;

  // 9. SELLOS GRÁFICOS INICIALES (Sincronizados automáticamente con los distintivos detectados)
  datos_tecnicos.sellos_graficos = [
    { id: 'NUEVO_MODELO', nombre: 'Nuevo Modelo', activo: false, posicion: 'top-left' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'COLORMAKER', nombre: 'Color Maker', activo: badges.includes('ColorMaker'), posicion: 'bottom-right' as const, capa: 'front' as const, tamano: 130, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'POLAR_DAY', nombre: 'Polar day', activo: badges.includes('Polar Day'), posicion: 'bottom-right' as const, capa: 'front' as const, tamano: 130, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'SMD_1', nombre: 'SMD 1.0', activo: badges.includes('SMD 1.0'), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'SMD_2', nombre: 'SMD 2.0', activo: badges.includes('SMD 2.0'), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'SMD_3', nombre: 'SMD 3.0', activo: badges.includes('SMD 3.0'), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'VCA', nombre: 'VCA', activo: badges.includes('VCA') || Boolean((caracteristicas_principales as any)?.vca), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'DUAL_LIGHT', nombre: 'Dual Light', activo: badges.includes('Dual Light'), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'PARLANTE_INCORPORADO', nombre: 'Parlante incorporado', activo: Boolean(datos_tecnicos.camara?.altavoz_incorporado), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true },
    { id: 'EARLY_WARNING', nombre: 'Early Warning (EW)', activo: badges.includes('Early Warning'), posicion: 'top-right' as const, capa: 'front' as const, tamano: 100, anclaje: 'esquina' as const, opacidad: 1, activo_global: true }
  ];

  return {
    modelo: modeloExacto,
    especificacion_completa: modeloExacto,
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
