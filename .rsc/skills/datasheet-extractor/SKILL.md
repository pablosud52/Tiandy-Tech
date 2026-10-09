---
name: datasheet-extractor
description: Extracción, normalización y validación estructurada de especificaciones técnicas desde datasheets PDF oficiales de Tiandy (Cámaras, NVRs y Switches PoE).
---

# Skill: CCTV & Network Hardware Datasheet Extractor (v2.0)

## 1. Misión y Alcance
Esta skill instruye al agente para leer, interpretar y extraer datos técnicos desde documentos PDF oficiales de Tiandy (datasheets de Cámaras IP, Grabadores NVR y Switches PoE), convirtiendo texto no estructurado en un objeto JSON normalizado que cumpla sin excepciones el esquema del proyecto Tiandy Tech.

---

## 2. Reglas Críticas de Interpretación y Normalización

### 2.1 Identificación, Serie y Clasificación
* **Modelo Base:** Primer término identificador del encabezado (ej. `TC-C32QV`, `TC-R3110`, `TC-P3S028`).
* **Especificación Completa:** Cadena completa incluyendo sufijos y revisiones de hardware (ej. `TC-C32QV 2FNA-28`, `TC-R3110 4HA`, `TC-P3S028 Spec:G/2422/AT/280`).
* **Serie Comercial:** Extraer del chevron gráfico en la pág. 1 o texto asociado: `Spark Series`, `Lite Series`, `Pro Series`, `Ultra Series`, `AK Series`, `SK Series`, `LK Series`, etc.
* **Tipo de Dispositivo:**
  * Si el título o subtítulo contiene *"Bullet"*, *"Turret"*, *"Dome"*, *"PT Camera"*, *"PTZ"* o *"Panoramic"* $\rightarrow$ `tipo_dispositivo: "CAMARA"`.
  * Si contiene *"NVR"*, *"Network Video Recorder"* o *"ch AI NVR"* $\rightarrow$ `tipo_dispositivo: "NVR"`.
  * Si contiene *"PoE switch"* o *"Ethernet Switch"* $\rightarrow$ `tipo_dispositivo: "SWITCH"`.

---

### 2.2 Detección Automática de Badges / Sellos Tecnológicos Sugeridos
El extractor debe analizar las especificaciones del PDF e incluir en el array `badges_detectados`:
* **Polar Day:** Subtítulo indica *"Polar Day"* o iluminación mínima a color $\le 0.0005\text{ Lux}$ (ej. `0.0001 Lux`, `0.0002 Lux`).
* **ColorMaker:** Subtítulo indica *"ColorMaker"* o apertura de diafragma `F1.0` combinada con LEDs de luz blanca/cálida (*Whitelight Distance*).
* **Early Warning (Disuasión Activa):** Mención de *"Red and Blue Alarm Flash"*, *"Built-in Loudspeaker"* o analítica *"Early Warning"*.
* **Panorámica 180° / Dual Sensor:** Campo de visión FOV horizontal $\ge 170^\circ$, mención de *"Dual Lens"*, *"Dual Sensor"* o dos resoluciones combinadas (ej. `4MP + 4MP`).
* **4K Ultra HD:** Resolución de 8MP ($3840 \times 2160$) o superior.
* **SMD 2.0:** Clasificación de humanos y vehículos integrada sobre reglas VCA (Cruce de línea y Perímetro).
* **Face Recognition (FR):** Presencia de reconocimiento facial nativo en NVR o captura facial en cámara.
* **Wi-Fi:** Conectividad inalámbrica Wi-Fi declarada.
* **4G Solar:** Conectividad celular 4G LTE y panel solar integrado.

---

### 2.3 Reglas Específicas para Cámaras IP

1. **Salidas de Alarma (Alerta de Seguridad Crítica):**
   * El agente debe buscar explícitamente el término `TTL` o `Relay`.
   * Si el documento indica *"TTL output, 30mA, 12VDC"*, registrar obligatoriamente como:  
     `"1x TTL (12V DC, 30mA) - No conectar carga directa sin transistor/relé intermedio"`.
   * Solo si el documento menciona *"Switching"* o *"relay output"*, clasificar como relé mecánico/contacto seco.

2. **Alimentación y PoE:**
   * Mapear si soporta dualidad o solo un método:
     * Si lista *"DC12V"* y *"POE 802.3af"*, clasificar como `PoE + 12V DC`.
     * Si lista *"DC5V"* (típico en series 4G / solares o Wi-Fi PT), clasificar como `Solo 5V DC`.
     * Si el estándar PoE es `802.3at`, marcar explícitamente `PoE+ (802.3at)`.

3. **Métrica DORI (EN 62676-4):**
   * Extraer siempre en metros lineales numéricos:
     * `detectar`: Metros para Detección (25 px/m).
     * `observar`: Metros para Observación (63 px/m).
     * `reconocer`: Metros para Reconocimiento (125 px/m).
     * `identificar`: Metros para Identificación (250 px/m).
   * Si la tabla DORI no figura en el datasheet, asignar `null`.

4. **Óptica y Formato:**
   * Distinguir formato: `Bullet`, `Turret`, `Domo`, `PTZ` o `Fisheye`.
   * Clasificar tipo de óptica: `Estándar`, `Panorámica 180° (Dual Sensor)`, `Dual Sensor`, `Zoom Óptico (PTZ)`.

---

### 2.4 Reglas Específicas para Grabadores (NVRs)

1. **Canales y Ancho de Banda:**
   * Extraer número entero de canales IP (`canales_ip`).
   * Extraer ancho de banda de ingreso (`ancho_banda_ingreso_mbps`), aclarando si decrece con analítica IA activa (ej. `100 Mbps (AI on: 80 Mbps)`).
2. **Capacidad de Almacenamiento:**
   * Contar bahías SATA (`bahias_sata`) y registrar el límite de TB por disco (`capacidad_max_por_disco_tb`).
3. **IA por Hardware:**
   * Distinguir rigurosamente las analíticas nativas procesadas por el hardware del NVR (`ai_propia_nvr`: canales de reconocimiento facial o SMD autónomo) frente a las que solo visualiza (`ai_por_camara`).

---

### 2.5 Reglas Específicas para Switches PoE

1. **Topología de Puertos:**
   * Separar estrictamente cantidad y velocidad de puertos PoE, puertos de subida RJ45 (Uplink) y ranuras de fibra SFP.
2. **Presupuesto PoE (Budget):**
   * Extraer los Watts totales declarados (`presupuesto_poe_watts`, ej: 280).
3. **Funciones de Hardware CCTV:**
   * Detectar si el equipo tiene soporte de enlace extendido (`modo_extend_cctv_250m: true`) y reinicio inteligente por detección de caída (`poe_watchdog: true`).

---

## 3. Formato de Salida Obligatorio (JSON Schema Normalizado)

El resultado emitido debe ser exclusivamente el objeto JSON estructurado:

```json
{
  "comercial_privado": {
    "codigo_interno": null,
    "codigo_barras_ean": null,
    "precio_usd": null,
    "iva_incluido": false,
    "estado_stock": "ENTREGA_INMEDIATA",
    "fecha_arribo_estimada": null
  },
  "identificacion": {
    "modelo": "STRING",
    "especificacion_completa": "STRING",
    "serie": "STRING",
    "tipo_dispositivo": "CAMARA | NVR | SWITCH",
    "subtipo": "STRING",
    "badge_nuevo": false,
    "visible": true,
    "badges_detectados": ["STRING"]
  },
  "archivos": {
    "imagen_principal": "/img/productos/[MODELO_LIMPIO].webp",
    "galeria": [],
    "datasheet_pdf": "/docs/[NOMBRE_ARCHIVO_ORIGINAL].pdf"
  },
  "datos_tecnicos": {
    // Si tipo_dispositivo == "CAMARA":
    "camara": {
      "formato": "Bullet | Turret | Domo | PTZ | Fisheye",
      "conectividad_tipo": "Cableada (PoE/RJ45) | Wi-Fi | 4G Celular / Solar",
      "movimiento_tipo": "Fija | PT / PTZ Móvil",
      "optica_tipo": "Estándar | Panorámica 180° (Dual Sensor) | Dual Sensor | Zoom Óptico (PTZ)",
      "resolucion_mp": "STRING",
      "resolucion_max_pixels": "STRING",
      "sensor_imagen": "STRING",
      "distancia_focal": "STRING",
      "apertura_iris": "STRING",
      "campo_vision_fov": {
        "horizontal": "STRING",
        "vertical": "STRING",
        "diagonal": "STRING"
      },
      "wdr": "STRING",
      "dori_metros": {
        "detectar": 40.0,
        "observar": 15.9,
        "reconocer": 8.0,
        "identificar": 4.0
      },
      "iluminacion_minima_color": "STRING",
      "alcance_ir_metros": 0,
      "alcance_luz_blanca_metros": 15,
      "alimentacion": {
        "tipo": "STRING",
        "especificacion": "STRING"
      },
      "interfaces": {
        "audio_integrado": "Sin Audio | Solo Micrófono | Micrófono + Parlante",
        "audio_io_externo": "STRING",
        "salida_alarma": "STRING",
        "entrada_alarma": "STRING",
        "ranura_sd": "STRING",
        "boton_reset": true
      },
      "analiticas_ia": {
        "version_smd": "STRING",
        "clasificacion_objetos": ["Humano", "Vehículo"],
        "captura_facial": false,
        "early_warning_disuasion": {
          "soporta": false,
          "estroboscopica_roja_azul": false,
          "sirena": false
        },
        "vca_funciones": ["STRING"]
      },
      "fisico": {
        "material": "STRING",
        "grado_ip": "STRING",
        "proteccion_sobretension": "STRING",
        "temperatura_operacion": "STRING",
        "dimensiones_mm": "STRING",
        "peso_kg": 0.32
      },
      "onvif_perfiles": ["Profile S", "Profile T"]
    },

    // Si tipo_dispositivo == "NVR":
    "nvr": {
      "canales_ip": 10,
      "ancho_banda_ingreso_mbps": 100,
      "ancho_banda_egreso_mbps": 80,
      "bahias_sata": 1,
      "capacidad_max_por_disco_tb": 10,
      "puertos_poe_integrados": 0,
      "salidas_video": ["HDMI (4K)", "VGA"],
      "resolucion_max_grabacion": "16MP",
      "decodificacion_simultanea": "1x 16MP@30fps / 10x 1080P@30fps",
      "puertos_red": "1x RJ-45 10/100M",
      "puertos_usb": "2x USB 2.0",
      "entradas_alarma": "4x TTL (3.3V DC, 3mA)",
      "salidas_alarma": "1x Relé mecánico (24V DC, 1A)",
      "audio_io": "1 entrada 3.5mm / 1 salida RCA",
      "ia_propia_nvr": ["Reconocimiento Facial (1ch)", "SMD (4ch)", "Tripwire / Perímetro (4ch)"],
      "alimentacion": "12V DC (Fuente externa)",
      "onvif_perfiles": ["Profile S", "Profile T", "Profile G"]
    },

    // Si tipo_dispositivo == "SWITCH":
    "switch": {
      "puertos_poe_totales": 24,
      "velocidad_puertos_poe": "10/100/1000 Mbps (Gigabit)",
      "puertos_uplink_rj45": 2,
      "velocidad_uplink_rj45": "1000 Mbps (Gigabit)",
      "puertos_sfp_fibra": 2,
      "velocidad_sfp": "1000 Mbps (Gigabit)",
      "presupuesto_poe_watts": 280,
      "estandar_poe": ["802.3af (15.4W)", "802.3at (30W)"],
      "modo_extend_cctv_250m": true,
      "poe_watchdog": true,
      "prioridad_poe_puertos": "Puertos 1 a 16",
      "tipo_administracion": "No Administrable (DIP Switch)",
      "tipo_fuente": "Interna AC 100-240V"
    }
  }
}
```

---

## 4. Política de Valores Nulos y Ambigüedades

* Si un dato no figura explícitamente en el PDF (ej. cámara sin ranura MicroSD o sin protección IK declarada), asignar estrictamente `null` o `false`. **Bajo ninguna circunstancia inventar o inferir valores técnicos.**
* Para campos con rangos o tolerancias (ej. `DC12V ± 25%`), registrar el valor nominal y consignar la tolerancia dentro de la especificación textual.
