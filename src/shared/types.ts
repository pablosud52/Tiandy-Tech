export type TipoDispositivo = 'CAMARA' | 'NVR' | 'SWITCH';

export type EstadoStock = 
  | 'ENTREGA_INMEDIATA'
  | 'POCAS_UNIDADES'
  | 'ULTIMA_UNIDAD'
  | 'PROXIMO_ARRIBO'
  | 'AGOTADO'
  | 'CONSULTAR';

export interface DatosCamara {
  formato: 'Bullet' | 'Turret' | 'Domo' | 'PTZ' | 'Fisheye' | string;
  conectividad_tipo: 'Cableada (PoE/RJ45)' | 'Wi-Fi' | '4G Celular / Solar' | string;
  movimiento_tipo: 'Fija' | 'PT / PTZ Móvil' | string;
  optica_tipo: 'Estándar' | 'Panorámica 180° (Dual Sensor)' | 'Dual Sensor' | 'Zoom Óptico (PTZ)' | string;
  resolucion_mp: string;
  resolucion_max_pixels: string;
  sensor_imagen: string;
  distancia_focal: string;
  apertura_iris: string;
  campo_vision_fov?: {
    horizontal?: string;
    vertical?: string;
    diagonal?: string;
  };
  wdr?: string;
  dori_metros?: {
    detectar?: number | null;
    observar?: number | null;
    reconocer?: number | null;
    identificar?: number | null;
  };
  iluminacion_minima_color?: string;
  alcance_ir_metros?: number;
  alcance_luz_blanca_metros?: number;
  alimentacion?: {
    tipo: string;
    especificacion?: string;
  };
  interfaces?: {
    audio_integrado?: 'Sin Audio' | 'Solo Micrófono' | 'Micrófono + Parlante' | string;
    audio_io_externo?: string | null;
    salida_alarma?: string | null;
    entrada_alarma?: string | null;
    ranura_sd?: string | null;
    boton_reset?: boolean;
  };
  analiticas_ia?: {
    version_smd?: string | null;
    clasificacion_objetos?: string[];
    captura_facial?: boolean;
    early_warning_disuasion?: {
      soporta: boolean;
      estroboscopica_roja_azul?: boolean;
      sirena?: boolean;
    };
    vca_funciones?: string[];
  };
  fisico?: {
    material?: string;
    grado_ip?: string;
    proteccion_sobretension?: string;
    temperatura_operacion?: string;
    dimensiones_mm?: string;
    peso_kg?: number | null;
  };
  onvif_perfiles?: string[];
}

export interface DatosNVR {
  canales_ip: number;
  ancho_banda_ingreso_mbps: number;
  ancho_banda_egreso_mbps: number;
  bahias_sata: number;
  capacidad_max_por_disco_tb: number;
  puertos_poe_integrados: number;
  salidas_video: string[];
  resolucion_max_grabacion: string;
  decodificacion_simultanea: string;
  puertos_red?: string;
  puertos_usb?: string;
  entradas_alarma?: string;
  salidas_alarma?: string;
  audio_io?: string;
  ia_propia_nvr?: string[];
  alimentacion?: string;
  onvif_perfiles?: string[];
}

export interface DatosSwitch {
  puertos_poe_totales: number;
  velocidad_puertos_poe: string;
  puertos_uplink_rj45: number;
  velocidad_uplink_rj45: string;
  puertos_sfp_fibra: number;
  velocidad_sfp: string;
  presupuesto_poe_watts: number;
  estandar_poe: string[];
  modo_extend_cctv_250m: boolean;
  poe_watchdog: boolean;
  prioridad_poe_puertos?: string;
  tipo_administracion?: string;
  tipo_fuente?: string;
}

export type DatosTecnicos = {
  camara?: DatosCamara;
  nvr?: DatosNVR;
  switch?: DatosSwitch;
};

export interface Producto {
  id?: any;
  modelo: string;
  especificacion_completa: string;
  serie: string;
  tipo_dispositivo: TipoDispositivo;
  subtipo?: string;
  badge_nuevo: boolean;
  visible: boolean;
  precio_usd: number | null;
  estado_stock: EstadoStock;
  fecha_arribo_estimada?: string | null;
  codigo_1?: string | null;
  codigo_2?: string | null;
  codigo_interno?: string | null;
  codigo_barras_ean?: string | null;
  imagen_principal: string;
  galeria?: string[];
  datasheet_pdf?: string;
  badges_detectados?: string[];
  datos_tecnicos: DatosTecnicos;
  created_at?: string;
  updated_at?: string;
}

export interface BadgeConfig {
  id: string;
  nombre: string;
  posicion: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  bg_color?: string;
  text_color?: string;
  icono?: string;
  activo: boolean;
}

export interface FilterOptions {
  busqueda?: string;
  tipo_dispositivo: TipoDispositivo;
  serie?: string;
  resolucion?: string;
  formato?: string;
  tecnologia_nocturna?: string;
  audio?: string;
  canales?: number;
  bahias_sata?: number;
  puertos_poe?: number;
  estado_stock?: EstadoStock;
  solo_stock?: boolean;
}

export interface FiltrosBusqueda {
  serie: string[];
  estado_stock: string[];
  formato: string[];
  resolucion_mp: string[];
  badges: string[];
  canales: string[];
  bahias: string[];
  puertos_poe: string[];
  microfono_incorporado: boolean;
  altavoz_incorporado: boolean;
  slot_sd: boolean;
  poe_integrado: boolean;
  modo_extendido: boolean;
}

export interface ItemCotizacion {
  producto: Producto;
  cantidad: number;
}
