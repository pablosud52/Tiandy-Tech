import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Producto, TipoDispositivo, EstadoStock, SelloGraficoConfig, PosicionSello, CapaSello, BadgeGlobalConfig } from '../../../shared/types.js';
import { formatCurrency, parseModelAndSpec } from '../../../shared/helpers.js';
import { optimizeImageToWebP, formatFileSize } from '../../utils/imageOptimizer.js';
import { SellosGraficosOverlay, BadgeOverlay, DEFAULT_BADGE_SVGS } from '../../components/Badges.js';
import { 
  Cctv, 
  HardDrive, 
  Network, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  Layers, 
  Cpu, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Volume2, 
  Mic, 
  Database, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  Move, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  FileSpreadsheet
} from 'lucide-react';

interface ProductEditFormProps {
  initialData: Partial<Producto>;
  existingProducts?: Producto[];
  isNew?: boolean;
  onSave: (product: Producto) => Promise<void> | void;
  onCancel: () => void;
  isSaving?: boolean;
  title?: string;
  submitLabel?: string;
}

export const DEFAULT_SELLOS_GRAFICOS: SelloGraficoConfig[] = [
  {
    id: 'NUEVO_MODELO',
    nombre: 'Nuevo Modelo',
    activo: false,
    imagen_url: '/data/badges/nuevo-modelo.svg',
    posicion: 'top-left',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'COLORMAKER',
    nombre: 'Color Maker',
    activo: false,
    imagen_url: '/data/badges/colormaker.svg',
    posicion: 'bottom-right',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'POLAR_DAY',
    nombre: 'Polar day',
    activo: false,
    imagen_url: '/data/badges/polarday.svg',
    posicion: 'bottom-center',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'SMD_1',
    nombre: 'SMD 1.0',
    activo: false,
    imagen_url: '/data/badges/smd-1.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'SMD_2',
    nombre: 'SMD 2.0',
    activo: false,
    imagen_url: '/data/badges/smd-2.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'SMD_3',
    nombre: 'SMD 3.0',
    activo: false,
    imagen_url: '/data/badges/smd-3.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100
  },
  {
    id: 'VCA',
    nombre: 'VCA',
    activo: false,
    imagen_url: '/data/badges/vca.svg',
    posicion: 'top-right',
    capa: 'front',
    tamano: 100
  }
];

export interface TechBadgeDef {
  id: string;
  label: string;
  canonicalBadge: string;
  desc: string;
  matches: (badgeText: string) => boolean;
}

export const AVAILABLE_TECH_BADGES: TechBadgeDef[] = [
  {
    id: '4K_ULTRA_HD',
    label: '4K Ultra HD',
    canonicalBadge: '4K Ultra HD',
    desc: 'Resolución 4K Ultra HD (8MP / 3840×2160)',
    matches: (b) => /4K|3840\s*[x×]\s*2160|8MP/i.test(b)
  },
  {
    id: 'POE_WATCHDOG',
    label: 'PoE Watchdog',
    canonicalBadge: 'PoE Watchdog',
    desc: 'Reinicio automático inteligente de cámaras colgadas',
    matches: (b) => /Watchdog/i.test(b)
  },
  {
    id: 'DUAL_LIGHT',
    label: 'Dual Light',
    canonicalBadge: 'Dual Light',
    desc: 'Iluminación híbrida IR + Luz blanca cálida',
    matches: (b) => /Dual\s*Light|DUAL_LIGHT/i.test(b)
  },
  {
    id: 'PARLANTE_INCORPORADO',
    label: 'Altavoz / Parlante',
    canonicalBadge: 'Altavoz',
    desc: 'Audio bidireccional y sirenas disuasorias',
    matches: (b) => /Parlante|Altavoz|PARLANTE_INCORPORADO/i.test(b)
  },
  {
    id: 'EARLY_WARNING',
    label: 'Early Warning (EW)',
    canonicalBadge: 'Early Warning',
    desc: 'Disuasión activa con estrobo rojo/azul y sirena',
    matches: (b) => /Early\s*Warning|EARLY_WARNING|\bEW\b/i.test(b)
  },
  {
    id: 'PANORAMICA_180',
    label: '180° Panorámica',
    canonicalBadge: '180° Panorámica',
    desc: 'Lente o sensor dual ultra gran angular 180°',
    matches: (b) => /180°?|Panor[aá]mi/i.test(b)
  },
  {
    id: 'FACE_RECOGNITION',
    label: 'Face Recognition',
    canonicalBadge: 'Face Recognition',
    desc: 'Captura y reconocimiento facial asistido por IA',
    matches: (b) => /Face|Facial/i.test(b)
  },
  {
    id: 'WIFI',
    label: 'Wi-Fi',
    canonicalBadge: 'Wi-Fi',
    desc: 'Conectividad inalámbrica Wi-Fi integrada',
    matches: (b) => /Wi-?Fi/i.test(b)
  },
  {
    id: 'SOLAR_4G',
    label: '4G Solar',
    canonicalBadge: '4G Solar',
    desc: 'Alimentación solar y enlace 4G LTE autónomo',
    matches: (b) => /4G|Solar/i.test(b)
  }
];

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  initialData,
  existingProducts = [],
  isNew = false,
  onSave,
  onCancel,
  isSaving = false,
  title,
  submitLabel = 'Guardar Ficha Técnica'
}) => {
  const [formData, setFormData] = useState<Partial<Producto>>(() => {
    const base: Partial<Producto> = {
      modelo: '',
      serie: '',
      tipo_dispositivo: 'CAMARA',
      subtipo: '',
      especificacion_completa: '',
      codigo_1: '',
      codigo_2: '',
      precio_usd: 0,
      estado_stock: 'ENTREGA_INMEDIATA',
      badge_nuevo: false,
      visible: true,
      imagen_principal: '',
      datasheet_pdf: '',
      badges_detectados: [],
      datos_tecnicos: {},
      ...initialData
    };

    // Para cámaras Tiandy, el micrófono incorporado siempre está marcado por defecto
    const isCam = (base.tipo_dispositivo || 'CAMARA') === 'CAMARA';
    if (isCam) {
      const dt = { ...(base.datos_tecnicos || {}) };
      const cam = { ...((dt as any).camara || {}) };
      if (cam.microfono_incorporado === undefined) {
        cam.microfono_incorporado = true;
      }
      base.datos_tecnicos = { ...dt, camara: cam };
    }

    // Inicialización y migración automática de sellos gráficos
    const rawSellos = (base.datos_tecnicos as any)?.sellos_graficos;
    let sellosList: SelloGraficoConfig[] = [];
    if (Array.isArray(rawSellos) && rawSellos.length > 0) {
      sellosList = DEFAULT_SELLOS_GRAFICOS.map((def) => {
        const found = rawSellos.find((s: any) => s.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    } else {
      sellosList = DEFAULT_SELLOS_GRAFICOS.map((def) => {
        let activo = false;
        if (def.id === 'NUEVO_MODELO' && base.badge_nuevo) activo = true;
        if (def.id === 'COLORMAKER' && (base.badges_detectados || []).some((b: string) => b.toUpperCase().includes('COLORMAKER'))) activo = true;
        if (def.id === 'POLAR_DAY' && (base.badges_detectados || []).some((b: string) => b.toUpperCase().includes('POLAR'))) activo = true;
        if (def.id === 'SMD_1' && (base.badges_detectados || []).some((b: string) => /SMD\s*1/i.test(b))) activo = true;
        if (def.id === 'SMD_2' && (base.badges_detectados || []).some((b: string) => /SMD\s*2/i.test(b))) activo = true;
        if (def.id === 'SMD_3' && (base.badges_detectados || []).some((b: string) => /SMD\s*3/i.test(b))) activo = true;
        if (def.id === 'VCA' && (base.badges_detectados || []).some((b: string) => /VCA/i.test(b))) activo = true;
        return { ...def, activo };
      });
    }

    base.datos_tecnicos = {
      ...base.datos_tecnicos,
      sellos_graficos: sellosList
    };

    return base;
  });

  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'badges' | 'matriz'>('general');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    General: true,
    Camera: true,
    Lens: true
  });
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [customBadgeInput, setCustomBadgeInput] = useState<string>('');

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDatasheetKeyChange = (category: string, oldKey: string, newKey: string) => {
    if (!newKey.trim()) return;
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      const catObj = { ...(currentSpecs[category] || {}) };
      const val = catObj[oldKey];
      delete catObj[oldKey];
      catObj[newKey] = val;
      currentSpecs[category] = catObj;
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
  };

  const handleDatasheetValChange = (category: string, key: string, val: string) => {
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      const catObj = { ...(currentSpecs[category] || {}) };
      catObj[key] = val;
      currentSpecs[category] = catObj;
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
  };

  const handleDatasheetItemDelete = (category: string, key: string) => {
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      const catObj = { ...(currentSpecs[category] || {}) };
      delete catObj[key];
      currentSpecs[category] = catObj;
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
  };

  const handleDatasheetItemAdd = (category: string) => {
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      const catObj = { ...(currentSpecs[category] || {}) };
      const newKey = `Nuevo Parámetro ${Object.keys(catObj).length + 1}`;
      catObj[newKey] = '';
      currentSpecs[category] = catObj;
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
  };

  const handleDatasheetCategoryAdd = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      if (!currentSpecs[name]) {
        currentSpecs[name] = {};
      }
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
    setExpandedCategories((prev) => ({ ...prev, [name]: true }));
    setNewCategoryName('');
  };

  const handleDatasheetCategoryDelete = (category: string) => {
    if (!confirm(`¿Eliminar toda la sección "${category}" de la matriz del datasheet?`)) return;
    setFormData((prev) => {
      const currentSpecs = { ...(prev.datos_tecnicos?.especificaciones_datasheet || {}) };
      delete currentSpecs[category];
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          especificaciones_datasheet: currentSpecs
        }
      };
    });
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Ingesta PDF inteligente integrada
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);

  const [imageStats, setImageStats] = useState<{
    originalSize: string;
    optimizedSize: string;
    dimensions: string;
  } | null>(null);

  const [baseModelInput, setBaseModelInput] = useState(() => {
    const parsed = parseModelAndSpec(initialData?.modelo || '', initialData?.subtipo, initialData?.especificacion_completa);
    return parsed.baseModel;
  });

  const [variantSpecInput, setVariantSpecInput] = useState(() => {
    const parsed = parseModelAndSpec(initialData?.modelo || '', initialData?.subtipo, initialData?.especificacion_completa);
    return parsed.variantSpec;
  });

  // Validación de unicidad de Código 1 y Código 2 en tiempo real contra los productos existentes
  const codeValidation = useMemo(() => {
    const c1 = (formData.codigo_1 || '').trim();
    const c2 = (formData.codigo_2 || '').trim();
    const currentId = formData.id;

    let errorCod1: string | null = null;
    let errorCod2: string | null = null;

    if (!existingProducts || existingProducts.length === 0) {
      return { errorCod1, errorCod2, isValid: true };
    }

    for (const other of existingProducts) {
      // Ignorar el mismo producto (por ID o por modelo si es edición)
      if (currentId && String(other.id) === String(currentId)) continue;
      if (formData.modelo && other.modelo.toUpperCase() === formData.modelo.toUpperCase() && !currentId) continue;

      const o1 = (other.codigo_1 || '').trim();
      const o2 = (other.codigo_2 || '').trim();

      if (c1 && (c1 === o1 || c1 === o2)) {
        errorCod1 = `El Código 1 "${c1}" ya está en uso por "${other.modelo}". No puede repetirse entre productos.`;
      }
      if (c2 && (c2 === o1 || c2 === o2)) {
        errorCod2 = `El Código 2 "${c2}" ya está en uso por "${other.modelo}". No puede repetirse entre productos.`;
      }
    }

    return {
      errorCod1,
      errorCod2,
      isValid: !errorCod1 && !errorCod2
    };
  }, [formData.codigo_1, formData.codigo_2, formData.id, formData.modelo, existingProducts]);

  // Opciones oficiales de Serie Comercial según el Tipo de Dispositivo
  const seriesOptions = useMemo(() => {
    if (formData.tipo_dispositivo === 'CAMARA') {
      return ['AK Series', 'SK Series', 'LK Series', 'WIFI / 4G Solar', 'PTZ'];
    }
    if (formData.tipo_dispositivo === 'NVR') {
      return [
        'AK',
        'SK',
        'Light AI',
        'LK',
        'AI',
        'AK Series',
        'SK Series',
        'Light AI Series',
        'LK Series',
        'AI Series'
      ];
    }
    return ['General'];
  }, [formData.tipo_dispositivo]);

  // Sincronizar si cambia initialData (ej: tras extracción de PDF o selección de producto)
  const [precioInput, setPrecioInput] = useState<string>(() => {
    const val = initialData?.precio_usd;
    return (val !== undefined && val !== null ? val : 0).toFixed(2);
  });

  useEffect(() => {
    if (initialData) {
      const rawSellos = (initialData.datos_tecnicos as any)?.sellos_graficos;
      let sellosList: SelloGraficoConfig[] = [];
      if (Array.isArray(rawSellos) && rawSellos.length > 0) {
        sellosList = DEFAULT_SELLOS_GRAFICOS.map((def) => {
          const found = rawSellos.find((s: any) => s.id === def.id);
          const resolvedImg = (found?.imagen_url && found.imagen_url.trim() !== '') ? found.imagen_url : (def.imagen_url || DEFAULT_BADGE_SVGS[def.id] || '');
          return found ? { ...def, ...found, imagen_url: resolvedImg } : def;
        });
      } else {
        const bDet = initialData.badges_detectados || [];
        const cAna = (initialData.datos_tecnicos as any)?.camara?.analiticas_ia;
        const vSmd = cAna?.version_smd || '';
        const vFunc = cAna?.vca_funciones;
        sellosList = DEFAULT_SELLOS_GRAFICOS.map((def) => {
          let activo = false;
          if (def.id === 'NUEVO_MODELO' && initialData.badge_nuevo) activo = true;
          if (def.id === 'COLORMAKER' && bDet.some((b: string) => b.toUpperCase().includes('COLORMAKER'))) activo = true;
          if (def.id === 'POLAR_DAY' && bDet.some((b: string) => b.toUpperCase().includes('POLAR'))) activo = true;
          if (def.id === 'SMD_1' && (bDet.some((b: string) => /SMD\s*1/i.test(b)) || /1(\.0)?/i.test(vSmd))) activo = true;
          if (def.id === 'SMD_2' && (bDet.some((b: string) => /SMD\s*2/i.test(b)) || /2(\.0)?/i.test(vSmd))) activo = true;
          if (def.id === 'SMD_3' && (bDet.some((b: string) => /SMD\s*3/i.test(b)) || /3(\.0)?/i.test(vSmd))) activo = true;
          if (def.id === 'VCA' && (bDet.some((b: string) => /VCA/i.test(b)) || (Array.isArray(vFunc) ? vFunc.length > 0 : Boolean(vFunc)))) activo = true;
          return { ...def, activo };
        });
      }

      setFormData(prev => ({
        ...prev,
        ...initialData,
        datos_tecnicos: {
          ...(initialData.datos_tecnicos || {}),
          sellos_graficos: sellosList
        }
      }));
      const parsed = parseModelAndSpec(initialData.modelo || '', initialData.subtipo, initialData.especificacion_completa);
      setBaseModelInput(parsed.baseModel);
      setVariantSpecInput(parsed.variantSpec);
      const pVal = initialData.precio_usd;
      setPrecioInput((pVal !== undefined && pVal !== null ? pVal : 0).toFixed(2));
      setLocalImagePreview(null);
      setImgError(false);
    }
  }, [initialData]);

  // Manejo de cambios en Modelo Base y Spec en cuadros separados
  const handleBaseModelChange = (val: string) => {
    setBaseModelInput(val);
    const trimmedBase = val.trim();
    const trimmedSpec = variantSpecInput.trim();
    const combined = trimmedSpec ? `${trimmedBase} ${trimmedSpec}` : trimmedBase;
    setFormData(prev => ({ ...prev, modelo: combined, especificacion_completa: combined }));
  };

  const handleVariantSpecChange = (val: string) => {
    const cleanVal = val.replace(/^Spec[:.\s-]*/i, '');
    setVariantSpecInput(cleanVal);
    const trimmedBase = baseModelInput.trim();
    const trimmedSpec = cleanVal.trim();
    const combined = trimmedSpec ? `${trimmedBase} ${trimmedSpec}` : trimmedBase;
    setFormData(prev => ({ ...prev, modelo: combined, especificacion_completa: combined }));
  };

  // Detección de duplicado por modelo
  const isDuplicate = React.useMemo(() => {
    if (!formData.modelo || !formData.modelo.trim()) return false;
    const cleanCurrent = formData.modelo.trim().toLowerCase();
    return existingProducts.some(
      (p) => p.modelo.toLowerCase() === cleanCurrent && (!formData.id || p.id !== formData.id)
    );
  }, [formData.modelo, formData.id, existingProducts]);

  // Manejo de cambios en datos generales
  const handleGeneralChange = (field: keyof Producto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Manejo de cambios en datos técnicos específicos
  const handleTechnicalChange = (section: 'camara' | 'nvr' | 'switch', field: string, value: any) => {
    setFormData((prev) => {
      const existingSection = (prev.datos_tecnicos as any)?.[section] || {};
      return {
        ...prev,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          [section]: {
            ...existingSection,
            [field]: value
          }
        }
      };
    });
  };

  // Toggle de badges
  const handleToggleBadge = (badge: string) => {
    setFormData((prev) => {
      const current = prev.badges_detectados || [];
      const updated = current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge];
      return { ...prev, badges_detectados: updated };
    });
  };

  // Configuración global de sellos (fuente de verdad para posición, escala, imagen y estado global)
  const [globalBadgesConfig, setGlobalBadgesConfig] = useState<BadgeGlobalConfig[]>([]);

  useEffect(() => {
    fetch(`/api/configuracion/badges?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.badges)) {
          setGlobalBadgesConfig(data.badges);
        }
      })
      .catch(() => {});
  }, []);

  const baseSellos = useMemo(() => {
    if (globalBadgesConfig.length > 0) {
      return globalBadgesConfig.map((gb) => ({
        id: gb.id,
        nombre: gb.nombre,
        activo: false,
        imagen_url: (gb.imagen_url && gb.imagen_url.trim() !== '') ? gb.imagen_url : (DEFAULT_BADGE_SVGS[gb.id] || ''),
        posicion: gb.posicion,
        capa: gb.capa,
        tamano: gb.tamano,
        anclaje: gb.anclaje || 'esquina',
        opacidad: gb.opacidad !== undefined ? gb.opacidad : 1,
        activo_global: gb.activo_global
      }));
    }
    return DEFAULT_SELLOS_GRAFICOS;
  }, [globalBadgesConfig]);

  // Sellos gráficos computados
  const currentSellos: (SelloGraficoConfig & { activo_global?: boolean })[] = useMemo(() => {
    const raw = (formData.datos_tecnicos as any)?.sellos_graficos;
    if (Array.isArray(raw) && raw.length > 0) {
      return baseSellos.map((def) => {
        const found = raw.find((s: any) => s.id === def.id);
        const resolvedImg = (found?.imagen_url && found.imagen_url.trim() !== '') 
          ? found.imagen_url 
          : (def.imagen_url || DEFAULT_BADGE_SVGS[def.id] || '');
        return found ? { ...def, activo: Boolean(found.activo), imagen_url: resolvedImg } : def;
      });
    }
    return baseSellos;
  }, [formData.datos_tecnicos, baseSellos]);

  const handleUpdateSellos = (newSellos: SelloGraficoConfig[]) => {
    const isNuevoActivo = Boolean(newSellos.find((s) => s.id === 'NUEVO_MODELO')?.activo);
    const isColorMakerActivo = Boolean(newSellos.find((s) => s.id === 'COLORMAKER')?.activo);
    const isPolarDayActivo = Boolean(newSellos.find((s) => s.id === 'POLAR_DAY')?.activo);
    const isSmd1Activo = Boolean(newSellos.find((s) => s.id === 'SMD_1')?.activo);
    const isSmd2Activo = Boolean(newSellos.find((s) => s.id === 'SMD_2')?.activo);
    const isSmd3Activo = Boolean(newSellos.find((s) => s.id === 'SMD_3')?.activo);
    const isVcaActivo = Boolean(newSellos.find((s) => s.id === 'VCA')?.activo);

    setFormData((prev) => {
      let badges = [...(prev.badges_detectados || [])].filter(
        (b) => !['COLORMAKER', 'ColorMaker', 'POLAR_DAY', 'Polar Day', 'SMD 1.0', 'SMD_1', 'SMD 2.0', 'SMD_2', 'SMD 3.0', 'SMD_3', 'VCA'].some(x => b.toUpperCase().includes(x.toUpperCase()))
      );
      if (isColorMakerActivo) badges.push('COLORMAKER');
      if (isPolarDayActivo) badges.push('POLAR_DAY');
      if (isSmd1Activo) badges.push('SMD 1.0');
      if (isSmd2Activo) badges.push('SMD 2.0');
      if (isSmd3Activo) badges.push('SMD 3.0');
      if (isVcaActivo) badges.push('VCA');

      return {
        ...prev,
        badge_nuevo: isNuevoActivo,
        badges_detectados: badges,
        datos_tecnicos: {
          ...prev.datos_tecnicos,
          sellos_graficos: newSellos
        }
      };
    });
  };

  const handleToggleSello = (id: string) => {
    const updated = currentSellos.map((s) => {
      if (s.id === id) {
        return { ...s, activo: !s.activo };
      }
      return s;
    });
    handleUpdateSellos(updated);
  };

  const isTechBadgeActive = (badgeDef: TechBadgeDef): boolean => {
    return (formData.badges_detectados || []).some(
      (b) => badgeDef.matches(b) || b.toUpperCase() === badgeDef.id || b.toUpperCase() === badgeDef.canonicalBadge.toUpperCase()
    );
  };

  const handleToggleTechBadge = (badgeDef: TechBadgeDef) => {
    setFormData((prev) => {
      const current = prev.badges_detectados || [];
      const isActive = isTechBadgeActive(badgeDef);
      let updated: string[];
      if (isActive) {
        updated = current.filter(
          (b) => !badgeDef.matches(b) && b.toUpperCase() !== badgeDef.id && b.toUpperCase() !== badgeDef.canonicalBadge.toUpperCase()
        );
      } else {
        updated = [...current, badgeDef.canonicalBadge];
      }
      return { ...prev, badges_detectados: updated };
    });
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      badges_detectados: (prev.badges_detectados || []).filter((b) => b !== badgeToRemove)
    }));
  };

  const handleAddCustomBadge = () => {
    const trimmed = customBadgeInput.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const current = prev.badges_detectados || [];
      if (current.some((b) => b.toUpperCase() === trimmed.toUpperCase())) return prev;
      return { ...prev, badges_detectados: [...current, trimmed] };
    });
    setCustomBadgeInput('');
  };

  const handleClearAllTextBadges = () => {
    if (window.confirm('¿Deseas desactivar y remover todas las etiquetas de texto de este producto?')) {
      setFormData((prev) => ({
        ...prev,
        badges_detectados: []
      }));
    }
  };

  // Otras etiquetas detectadas del PDF o personalizadas que no son sellos ni distintivos tecnológicos estándar
  const otherDetectedBadges = useMemo(() => {
    const sellosKeywords = ['COLORMAKER', 'POLAR_DAY', 'POLAR DAY', 'NUEVO_MODELO', 'NUEVO MODELO', 'SMD 1.0', 'SMD 2.0', 'SMD 3.0', 'SMD', 'VCA'];
    return (formData.badges_detectados || []).filter((b) => {
      const upper = b.toUpperCase().trim();
      const inTech = AVAILABLE_TECH_BADGES.some((tb) => tb.matches(b) || tb.id === upper || tb.canonicalBadge.toUpperCase() === upper);
      if (inTech) return false;
      const inSellos = sellosKeywords.some((s) => upper.includes(s));
      if (inSellos) return false;
      return true;
    });
  }, [formData.badges_detectados]);

  const hasTopRightSello = useMemo(() => {
    return currentSellos.some(
      (s) => s.activo && s.posicion === 'top-right' && Boolean(s.imagen_url || DEFAULT_BADGE_SVGS[s.id])
    );
  }, [currentSellos]);

  // Procesar archivo de imagen con compresión WebP, preview instantáneo y subida
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageUploadError('El archivo debe ser una imagen válida (JPG, PNG, WebP, etc.)');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);
    setImageStats(null);
    setImgError(false);

    try {
      // 1. Redimensionar a máx 800px y convertir a WebP ligero
      const optimized = await optimizeImageToWebP(file, 800, 0.85);

      // 2. Previsualización instantánea en memoria (0 delay)
      const localBlobUrl = URL.createObjectURL(optimized.blob);
      setLocalImagePreview(localBlobUrl);

      // 3. Preparar payload con archivo .webp
      const body = new FormData();
      body.append('image', optimized.blob, optimized.fileName);

      // 4. Enviar a endpoint de guardado
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, imagen_principal: data.url }));
        setImageStats({
          originalSize: formatFileSize(optimized.originalSize),
          optimizedSize: formatFileSize(optimized.optimizedSize),
          dimensions: `${optimized.width}x${optimized.height} px`
        });
      } else {
        setImageUploadError(data.error || 'Error al subir la imagen al servidor');
      }
    } catch (err: any) {
      setImageUploadError(`Error procesando imagen: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  // Ingesta inteligente de PDF para auto-completar el formulario
  const handlePdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('El archivo seleccionado debe ser un documento PDF (.pdf)');
      return;
    }

    setIsUploadingPdf(true);
    setPdfError(null);
    setPdfSuccess(null);

    try {
      const body = new FormData();
      body.append('pdf', file);

      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body
      });
      const result = await res.json();

      if (res.ok && result.success && result.data) {
        const extracted: Producto = result.data;

        const extractedBadges = extracted.badges_detectados || [];
        const extractedCam = (extracted.datos_tecnicos as any)?.camara?.analiticas_ia;
        const extVersionSmd = extractedCam?.version_smd || '';
        const extVca = extractedCam?.vca_funciones;

        // Si el PDF detectó tecnologías, reflejar la activación en sellos_graficos para que los chips se marquen automáticamente
        const updatedSellos = currentSellos.map(s => {
          let activo = s.activo;
          if (s.id === 'COLORMAKER' && extractedBadges.some(b => b.toUpperCase().includes('COLORMAKER'))) activo = true;
          if (s.id === 'POLAR_DAY' && extractedBadges.some(b => b.toUpperCase().includes('POLAR'))) activo = true;
          if (s.id === 'SMD_1' && (extractedBadges.some(b => /SMD\s*1/i.test(b)) || /1(\.0)?/i.test(extVersionSmd))) activo = true;
          if (s.id === 'SMD_2' && (extractedBadges.some(b => /SMD\s*2/i.test(b)) || /2(\.0)?/i.test(extVersionSmd))) activo = true;
          if (s.id === 'SMD_3' && (extractedBadges.some(b => /SMD\s*3/i.test(b)) || /3(\.0)?/i.test(extVersionSmd))) activo = true;
          if (s.id === 'VCA' && (extractedBadges.some(b => /VCA/i.test(b)) || (Array.isArray(extVca) ? extVca.length > 0 : Boolean(extVca)))) activo = true;
          return { ...s, activo };
        });

        setFormData((prev) => ({
          ...prev,
          modelo: extracted.modelo || prev.modelo,
          especificacion_completa: extracted.especificacion_completa || extracted.modelo || prev.especificacion_completa,
          serie: '',
          tipo_dispositivo: extracted.tipo_dispositivo || prev.tipo_dispositivo,
          subtipo: extracted.subtipo || prev.subtipo,
          codigo_1: extracted.codigo_1 || prev.codigo_1,
          codigo_2: extracted.codigo_2 || prev.codigo_2,
          datasheet_pdf: extracted.datasheet_pdf || prev.datasheet_pdf,
          badges_detectados: Array.from(new Set([...(prev.badges_detectados || []), ...extractedBadges])),
          datos_tecnicos: {
            ...prev.datos_tecnicos,
            ...(extracted.datos_tecnicos || {}),
            sellos_graficos: updatedSellos
          }
        }));

        const parsed = parseModelAndSpec(extracted.modelo || '', extracted.subtipo, extracted.especificacion_completa);
        setBaseModelInput(parsed.baseModel);
        setVariantSpecInput(parsed.variantSpec);

        if (extracted.precio_usd) {
          setPrecioInput(extracted.precio_usd.toFixed(2));
        }

        setPdfSuccess(`✓ Datasheet de "${extracted.modelo}" procesado con éxito. Especificaciones técnicas autocompletadas.`);
      } else {
        setPdfError(result.error || 'No se pudieron extraer datos del PDF');
      }
    } catch (err: any) {
      setPdfError(`Error al procesar el archivo PDF: ${err.message}`);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBase = baseModelInput.trim();
    const finalSpec = variantSpecInput.trim();
    const finalModel = finalSpec ? `${finalBase} ${finalSpec}` : finalBase;

    if (!finalBase) {
      alert('El Modelo Base del producto es obligatorio');
      return;
    }

    if (!codeValidation.isValid) {
      alert(codeValidation.errorCod1 || codeValidation.errorCod2 || 'No puede haber códigos repetidos entre distintos productos.');
      return;
    }

    const parsedPrice = parseFloat(precioInput.replace(',', '.')) || 0;
    const isNuevoActivo = Boolean(currentSellos.find((s) => s.id === 'NUEVO_MODELO')?.activo);
    const isColorMakerActivo = Boolean(currentSellos.find((s) => s.id === 'COLORMAKER')?.activo);
    const isPolarDayActivo = Boolean(currentSellos.find((s) => s.id === 'POLAR_DAY')?.activo);
    const isSmd1Activo = Boolean(currentSellos.find((s) => s.id === 'SMD_1')?.activo);
    const isSmd2Activo = Boolean(currentSellos.find((s) => s.id === 'SMD_2')?.activo);
    const isSmd3Activo = Boolean(currentSellos.find((s) => s.id === 'SMD_3')?.activo);
    const isVcaActivo = Boolean(currentSellos.find((s) => s.id === 'VCA')?.activo);

    let updatedBadges = [...(formData.badges_detectados || [])].filter(
      (b) => !['COLORMAKER', 'ColorMaker', 'POLAR_DAY', 'Polar Day', 'SMD 1.0', 'SMD_1', 'SMD 2.0', 'SMD_2', 'SMD 3.0', 'SMD_3', 'VCA'].some(x => b.toUpperCase().includes(x.toUpperCase()))
    );
    if (isColorMakerActivo) updatedBadges.push('COLORMAKER');
    if (isPolarDayActivo) updatedBadges.push('POLAR_DAY');
    if (isSmd1Activo) updatedBadges.push('SMD 1.0');
    if (isSmd2Activo) updatedBadges.push('SMD 2.0');
    if (isSmd3Activo) updatedBadges.push('SMD 3.0');
    if (isVcaActivo) updatedBadges.push('VCA');

    const finalDatosTecnicos: any = {
      ...(formData.datos_tecnicos || {}),
      sellos_graficos: currentSellos
    };

    // Sanitización automática según tipo de dispositivo para evitar datos residuales
    if (formData.tipo_dispositivo === 'NVR') {
      delete finalDatosTecnicos.camara;
      delete finalDatosTecnicos.switch;
    } else if (formData.tipo_dispositivo === 'CAMARA') {
      delete finalDatosTecnicos.nvr;
      delete finalDatosTecnicos.switch;
    } else if (formData.tipo_dispositivo === 'SWITCH') {
      delete finalDatosTecnicos.camara;
      delete finalDatosTecnicos.nvr;
    }

    const toSave: Producto = {
      ...(formData as Producto),
      modelo: finalModel,
      especificacion_completa: formData.especificacion_completa || finalModel,
      precio_usd: parsedPrice,
      codigo_1: formData.codigo_1 ? formData.codigo_1.trim() : null,
      codigo_2: formData.codigo_2 ? formData.codigo_2.trim() : null,
      badge_nuevo: isNuevoActivo,
      badges_detectados: updatedBadges,
      datos_tecnicos: finalDatosTecnicos
    };
    onSave(toSave);
  };

  const camSpecs = (formData.datos_tecnicos as any)?.camara || {};
  const nvrSpecs = (formData.datos_tecnicos as any)?.nvr || {};
  const switchSpecs = (formData.datos_tecnicos as any)?.switch || {};

  const { baseModel, variantSpec } = parseModelAndSpec(formData.modelo || '', formData.subtipo || '');

  return (
    <div className="flex flex-col h-full max-h-[88vh]">
      {/* Header Sticky del Modal con Acciones Inmediatas */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-3 pt-1 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title || (formData.id ? `Editar: ${baseModel || formData.modelo}` : 'Nuevo Producto en Catálogo')}
              </h3>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                {formData.tipo_dispositivo === 'CAMARA' ? 'Cámara IP' : formData.tipo_dispositivo === 'NVR' ? 'NVR' : formData.tipo_dispositivo === 'SWITCH' ? 'Switch PoE' : 'Accesorio'}
              </span>
            </div>
            {variantSpec && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                Variante: {variantSpec}
              </span>
            )}
          </div>
        </div>

        {/* Acciones Rápidas en la Cabecera */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Switch de Visibilidad en Catálogo */}
          <label 
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all select-none ${
              formData.visible !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-sm'
                : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 opacity-70'
            }`}
            title="Controla si este producto se visualiza en la web pública de clientes"
          >
            <input
              type="checkbox"
              checked={formData.visible !== false}
              onChange={(e) => handleGeneralChange('visible', e.target.checked)}
              className="sr-only"
            />
            {formData.visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{formData.visible !== false ? 'Visible en Web' : 'Oculto en Web'}</span>
          </label>

          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          {/* Botón Guardar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-tiandy-700 hover:bg-tiandy-600 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md shadow-tiandy-700/20 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>{submitLabel}</span>
          </button>

          {/* Botón Cerrar [X] */}
          <button
            onClick={onCancel}
            type="button"
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Alerta de Producto Duplicado */}
      {isDuplicate && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 p-3.5 flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">¡Atención! Este modelo ya existe en el catálogo:</span>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Se detectó el modelo <strong>"{formData.modelo}"</strong> previamente cargado. Si guardas estos cambios, sobrescribirás o duplicarás la ficha técnica existente.
            </p>
          </div>
        </div>
      )}

      {/* Zona de Ingesta Inteligente de Datasheet PDF */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDraggingPdf(true); }}
        onDragLeave={() => setIsDraggingPdf(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingPdf(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handlePdfFile(file);
        }}
        className={`mt-3 rounded-2xl border-2 border-dashed p-3.5 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDraggingPdf 
            ? 'border-tiandy-500 bg-tiandy-50/80 dark:bg-tiandy-950/40 ring-2 ring-tiandy-500/20' 
            : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-tiandy-100 dark:bg-tiandy-950/80 border border-tiandy-200 dark:border-tiandy-800 flex items-center justify-center text-tiandy-700 dark:text-tiandy-400 shrink-0">
            {isUploadingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Cargar PDF</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-tiandy-100 text-tiandy-700 dark:bg-tiandy-900/60 dark:text-tiandy-300">
                Auto-llenado con Datasheet
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Arrastra aquí el Datasheet PDF o usa el botón para auto-completar especificaciones, modelo y conectividad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <label className="cursor-pointer rounded-xl bg-tiandy-700 text-white hover:bg-tiandy-600 px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
            {isUploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{isUploadingPdf ? 'Extrayendo PDF...' : 'Cargar PDF'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfFile(file);
                e.target.value = '';
              }}
              disabled={isUploadingPdf}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Notificaciones de Ingesta PDF */}
      {pdfSuccess && (
        <div className="mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{pdfSuccess}</span>
          </div>
          <button onClick={() => setPdfSuccess(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white ml-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {pdfError && (
        <div className="mt-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 p-2.5 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{pdfError}</span>
          </div>
          <button onClick={() => setPdfError(null)} className="text-rose-600 hover:text-rose-800 dark:hover:text-white ml-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tabs de Navegación Interna */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          1. General y Comercial
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'specs'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4" />
          2. Especificaciones Técnicas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Tag className="h-4 w-4" />
          3. Etiquetas y Sellos ({(formData.badges_detectados?.length || 0) + currentSellos.filter(s => s.activo).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matriz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'matriz'
              ? 'bg-tiandy-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          4. Matriz Datasheet ({Object.keys(formData.datos_tecnicos?.especificaciones_datasheet || {}).length})
        </button>
      </div>

      {/* Formulario Scrolleable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-1 space-y-5">
        {/* TAB 1: GENERAL & COMERCIAL */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Modelo Base y Spec en Cuadros Separados */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cuadro 1: Modelo Base */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Modelo Base *
                  </label>
                  <input
                    type="text"
                    value={baseModelInput}
                    onChange={(e) => handleBaseModelChange(e.target.value)}
                    placeholder="ej. TC-C320N, TC-C34XN, TC-R3110"
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Código base del dispositivo (sin variante de lente/hardware)
                  </span>
                </div>

                {/* Cuadro 2: Especificación / Variante (Spec) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Especificación / Variante (Spec)
                  </label>
                  <input
                    type="text"
                    value={variantSpecInput}
                    onChange={(e) => handleVariantSpecChange(e.target.value)}
                    placeholder="ej. 1ANB-28, 1CNB-28, I3W/E/Y/2.8mm/V4.2"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:border-tiandy-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sin prefijo "Spec:". Se visualiza debajo del modelo en gris.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Serie Comercial */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Serie Comercial</span>
                  <span className="text-[10px] font-normal text-slate-400 font-sans lowercase">(opcional)</span>
                </label>
                {(() => {
                  const isSinSerie = !formData.serie || !formData.serie.trim() || formData.serie.trim().toLowerCase() === 'general series';
                  const selectValue = isSinSerie ? '' : formData.serie;

                  return (
                    <>
                      <select
                        value={selectValue}
                        onChange={(e) => handleGeneralChange('serie', e.target.value)}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold focus:border-tiandy-600 focus:outline-none transition-colors ${
                          isSinSerie
                            ? 'border-amber-300 bg-amber-50/50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-300'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                      >
                        <option value="">-- Sin Serie Asignada --</option>
                        {seriesOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        {formData.serie && !seriesOptions.includes(formData.serie) && !isSinSerie && (
                          <option value={formData.serie}>{formData.serie} (Actual)</option>
                        )}
                      </select>
                      {isSinSerie && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
                          ⚠️ Puedes guardarlo sin serie; se resaltará como pendiente en la tabla.
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Tipo de Dispositivo */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Dispositivo *
                </label>
                <select
                  value={formData.tipo_dispositivo || 'CAMARA'}
                  onChange={(e) => {
                    const newTipo = e.target.value as TipoDispositivo;
                    setFormData((prev) => {
                      let updatedSerie = prev.serie || '';
                      if (newTipo === 'SWITCH' || newTipo === 'ACCESORIO') {
                        updatedSerie = '';
                      } else if (newTipo === 'NVR' && !['AK', 'SK', 'Light AI', 'LK', 'AI', 'AK Series', 'SK Series', 'Light AI Series', 'LK Series', 'AI Series'].includes(updatedSerie)) {
                        updatedSerie = '';
                      }
                      return {
                        ...prev,
                        tipo_dispositivo: newTipo,
                        serie: updatedSerie
                      };
                    });
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                >
                  <option value="CAMARA">Cámara IP</option>
                  <option value="NVR">Grabador NVR</option>
                  <option value="SWITCH">Switch PoE</option>
                  <option value="ACCESORIO">Accesorio / Montaje</option>
                </select>
              </div>

              {/* Subtipo / Variante descriptiva */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Subtipo / Variante
                </label>
                <input
                  type="text"
                  value={formData.subtipo || ''}
                  onChange={(e) => handleGeneralChange('subtipo', e.target.value)}
                  placeholder="ej. Turret 2MP Fixed Lens"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                />
              </div>

              {/* Precio en U$S (siempre con 2 decimales) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Precio Neto U$S (s/IVA) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    U$S
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={precioInput}
                    onChange={(e) => setPrecioInput(e.target.value)}
                    onBlur={() => {
                      const parsed = parseFloat(precioInput.replace(',', '.')) || 0;
                      const normalized = Math.max(0, Math.round(parsed * 100) / 100);
                      setPrecioInput(normalized.toFixed(2));
                      handleGeneralChange('precio_usd', normalized);
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-12 pr-3 font-mono text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estado de Stock */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Disponibilidad de Stock *
                </label>
                <select
                  value={formData.estado_stock || 'ENTREGA_INMEDIATA'}
                  onChange={(e) => handleGeneralChange('estado_stock', e.target.value as EstadoStock)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
                >
                  <option value="ENTREGA_INMEDIATA">ENTREGA INMEDIATA</option>
                  <option value="POCAS_UNIDADES">POCAS UNIDADES</option>
                  <option value="PROXIMO_ARRIBO">PRÓXIMO ARRIBO</option>
                  <option value="AGOTADO">AGOTADO</option>
                  <option value="CONSULTAR">CONSULTAR</option>
                </select>
              </div>
            </div>

            {/* Códigos de Sincronización e Integración (Sistema de Stock y Precios) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                    <Database className="h-4 w-4 text-tiandy-700 dark:text-tiandy-400" />
                    <span>Códigos de Sincronización e Integración</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Reservados para vincular con la base de datos de stock y precios de la empresa. No visibles en la web pública, pero indexados para búsquedas.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  Dejar en blanco si no aplica • Unicidad estricta
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Código 1 */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Código 1 (ej: Código ERP / Stock)
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_1 || ''}
                    onChange={(e) => handleGeneralChange('codigo_1', e.target.value)}
                    placeholder="ej. ART-0491 o 10442 (opcional)"
                    className={`w-full rounded-xl border p-2.5 font-mono text-xs font-bold focus:outline-none transition-colors ${
                      codeValidation.errorCod1
                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-tiandy-600'
                    }`}
                  />
                  {codeValidation.errorCod1 ? (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                      ⚠️ {codeValidation.errorCod1}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Identificador principal. No puede repetirse en otros productos.
                    </span>
                  )}
                </div>

                {/* Código 2 */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Código 2 (ej: Código de barras / alternativo)
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_2 || ''}
                    onChange={(e) => handleGeneralChange('codigo_2', e.target.value)}
                    placeholder="ej. 779812345678 (opcional)"
                    className={`w-full rounded-xl border p-2.5 font-mono text-xs font-bold focus:outline-none transition-colors ${
                      codeValidation.errorCod2
                        ? 'border-rose-500 bg-rose-50/40 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-tiandy-600'
                    }`}
                  />
                  {codeValidation.errorCod2 ? (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                      ⚠️ {codeValidation.errorCod2}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Puede ser igual al Código 1 en este mismo producto, pero no repetirse en otros.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Carga de Imagen del Producto con Optimización Automática WebP y Drag & Drop */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingImage(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processImageFile(file);
              }}
              className={`rounded-2xl border p-4 space-y-3 transition-all ${
                isDraggingImage
                  ? 'border-tiandy-500 bg-tiandy-50/80 dark:bg-tiandy-950/40 ring-2 ring-tiandy-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Imagen Principal del Producto
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  Auto-optimización WebP (Máx. 800px)
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Preview Box con Drag and Drop */}
                <div 
                  className={`relative w-28 h-28 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group transition-all ${
                    isDraggingImage ? 'border-tiandy-500 ring-2 ring-tiandy-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {(localImagePreview || formData.imagen_principal) && !imgError ? (
                    <>
                      <img
                        key={localImagePreview || formData.imagen_principal}
                        src={localImagePreview || formData.imagen_principal}
                        alt={formData.modelo}
                        className="w-full h-full object-contain p-1.5 transition-all"
                        onError={() => setImgError(true)}
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider">
                        {(localImagePreview || formData.imagen_principal)?.endsWith('.webp') || localImagePreview ? 'WEBP' : 'IMG'}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 p-2 text-center">
                      <ImageIcon className="h-8 w-8 mb-1" />
                      <span className="text-[9px] font-semibold text-slate-400">
                        {isDraggingImage ? 'Soltar aquí' : 'Sin Imagen'}
                      </span>
                    </div>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                      <Loader2 className="h-6 w-6 animate-spin text-tiandy-400" />
                    </div>
                  )}
                </div>

                {/* Subir archivo, arrastrar o ingresar URL */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-xl bg-slate-900 text-white dark:bg-tiandy-700 hover:bg-slate-800 dark:hover:bg-tiandy-600 px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
                      {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploadingImage ? 'Optimizando a WebP...' : 'Subir imagen desde equipo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>

                    {(formData.imagen_principal || localImagePreview) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocalImagePreview(null);
                          setImgError(false);
                          handleGeneralChange('imagen_principal', '');
                          setImageStats(null);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Puedes arrastrar una imagen directamente sobre este cuadro o usar el botón para cargarla.
                  </p>

                  {/* Estadísticas de compresión WebP en tiempo real */}
                  {imageStats && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Imagen optimizada a <strong>{imageStats.dimensions}</strong> • Reducida de {imageStats.originalSize} a <strong>{imageStats.optimizedSize}</strong> en formato WebP ultraligero.
                      </span>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.imagen_principal || ''}
                    onChange={(e) => {
                      setLocalImagePreview(null);
                      setImgError(false);
                      handleGeneralChange('imagen_principal', e.target.value);
                    }}
                    placeholder="o pega una URL directa de imagen (ej: /data/images/... o https://...)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                  />

                  {imageUploadError && (
                    <p className="text-xs text-rose-600 font-semibold">{imageUploadError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción / Ficha Completa */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Especificación Completa / Resumen de Ficha
              </label>
              <textarea
                rows={3}
                value={formData.especificacion_completa || ''}
                onChange={(e) => handleGeneralChange('especificacion_completa', e.target.value)}
                placeholder="Resumen de especificaciones para búsqueda rápida..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-tiandy-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ESPECIFICACIONES TÉCNICAS */}
        {activeTab === 'specs' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {formData.tipo_dispositivo === 'CAMARA' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <Cctv className="h-4 w-4" />
                  Parámetros Técnicos de Cámara IP
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Formato de Carcasa
                    </label>
                    <select
                      value={camSpecs.formato || 'Turret'}
                      onChange={(e) => handleTechnicalChange('camara', 'formato', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Bullet">Bullet</option>
                      <option value="Turret">Turret</option>
                      <option value="Domo">Domo</option>
                      <option value="PTZ">PTZ</option>
                      <option value="Fisheye">Fisheye</option>
                      <option value="Box">Box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución (Megapíxeles)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.resolucion_mp || '2MP'}
                      onChange={(e) => handleTechnicalChange('camara', 'resolucion_mp', e.target.value)}
                      placeholder="ej. 2MP, 4MP, 8MP (4K)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución Máx. Píxeles
                    </label>
                    <input
                      type="text"
                      value={camSpecs.resolucion_max_pixels || '1920x1080'}
                      onChange={(e) => handleTechnicalChange('camara', 'resolucion_max_pixels', e.target.value)}
                      placeholder="ej. 1920x1080, 2560x1440, 3840x2160"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Lente / Distancia Focal
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_focal || '2.8mm'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_focal', e.target.value)}
                      placeholder="ej. 2.8mm, 4mm, 2.7-13.5mm motorizado"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Apertura de Iris
                    </label>
                    <input
                      type="text"
                      value={camSpecs.apertura_iris || 'F1.6'}
                      onChange={(e) => handleTechnicalChange('camara', 'apertura_iris', e.target.value)}
                      placeholder="ej. F1.6, F2.0, F1.0"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Sensor de Imagen
                    </label>
                    <input
                      type="text"
                      value={camSpecs.sensor_imagen || '1/2.8" CMOS'}
                      onChange={(e) => handleTechnicalChange('camara', 'sensor_imagen', e.target.value)}
                      placeholder='ej. 1/2.8" CMOS, 1/1.8" CMOS'
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Alcance Infrarrojo (IR)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_ir_m || '30m'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_ir_m', e.target.value)}
                      placeholder="ej. 30m, 50m, 80m"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Luz Cálida / Blanca
                    </label>
                    <input
                      type="text"
                      value={camSpecs.distancia_luz_blanca_m || '0m'}
                      onChange={(e) => handleTechnicalChange('camara', 'distancia_luz_blanca_m', e.target.value)}
                      placeholder="ej. 30m, 50m (si aplica)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      WDR (Rango Dinámico)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.wdr || 'DWDR'}
                      onChange={(e) => handleTechnicalChange('camara', 'wdr', e.target.value)}
                      placeholder="ej. DWDR, 120dB, 140dB"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Compresión Códecs
                    </label>
                    <input
                      type="text"
                      value={camSpecs.codecs_video || 'S+265/H.265/H.264'}
                      onChange={(e) => handleTechnicalChange('camara', 'codecs_video', e.target.value)}
                      placeholder="ej. S+265/H.265/H.264"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Protección Intemperie
                    </label>
                    <input
                      type="text"
                      value={camSpecs.proteccion_ip || 'IP67'}
                      onChange={(e) => handleTechnicalChange('camara', 'proteccion_ip', e.target.value)}
                      placeholder="ej. IP67, IP66, IK10"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Alimentación
                    </label>
                    <input
                      type="text"
                      value={camSpecs.alimentacion?.tipo || camSpecs.alimentacion_tipo || (formData.datos_tecnicos as any)?.caracteristicas_principales?.alimentacion || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTechnicalChange('camara', 'alimentacion', {
                          tipo: val,
                          especificacion: camSpecs.alimentacion?.especificacion || camSpecs.consumo_max_w || ''
                        });
                        handleTechnicalChange('camara', 'alimentacion_tipo', val);
                        setFormData((prev) => ({
                          ...prev,
                          datos_tecnicos: {
                            ...prev.datos_tecnicos,
                            caracteristicas_principales: {
                              ...(prev.datos_tecnicos?.caracteristicas_principales as any),
                              alimentacion: val
                            }
                          }
                        }));
                      }}
                      placeholder="ej. PoE (802.3af), 12V DC, 12V DC / PoE (802.3af)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Consumo Máximo (Watts)
                    </label>
                    <input
                      type="text"
                      value={camSpecs.alimentacion?.especificacion || camSpecs.consumo_max_w || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTechnicalChange('camara', 'alimentacion', {
                          tipo: camSpecs.alimentacion?.tipo || camSpecs.alimentacion_tipo || '',
                          especificacion: val
                        });
                        handleTechnicalChange('camara', 'consumo_max_w', val);
                      }}
                      placeholder="ej. Max. 2W, Max. 6W, Max. 7.5W"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Toggles de Hardware de Cámara */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={camSpecs.microfono_incorporado !== undefined ? Boolean(camSpecs.microfono_incorporado) : true}
                      onChange={(e) => handleTechnicalChange('camara', 'microfono_incorporado', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Mic className="h-4 w-4 text-emerald-600" />
                    Micrófono Incorporado
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.altavoz_incorporado)}
                      onChange={(e) => handleTechnicalChange('camara', 'altavoz_incorporado', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    Altavoz / Sirena
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.slot_sd)}
                      onChange={(e) => handleTechnicalChange('camara', 'slot_sd', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <Database className="h-4 w-4 text-amber-600" />
                    Ranura MicroSD (Slot SD)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.interfaces?.entrada_alarma)}
                      onChange={(e) => {
                        const inter = { ...(camSpecs.interfaces || {}), entrada_alarma: e.target.checked ? '1-ch Entrada de Alarma' : null };
                        handleTechnicalChange('camara', 'interfaces', inter);
                      }}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Entrada de Alarma
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(camSpecs.interfaces?.salida_alarma || (camSpecs as any).salidas_alarma)}
                      onChange={(e) => {
                        const inter = { ...(camSpecs.interfaces || {}), salida_alarma: e.target.checked ? '1-ch Salida de Alarma' : null };
                        handleTechnicalChange('camara', 'interfaces', inter);
                      }}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <ShieldCheck className="h-4 w-4 text-rose-600" />
                    Salida de Alarma
                  </label>
                </div>
              </div>
            )}

            {formData.tipo_dispositivo === 'NVR' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" />
                  Parámetros Técnicos de Grabador NVR
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Canales de Video
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.canales_video || 8}
                      onChange={(e) => handleTechnicalChange('nvr', 'canales_video', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Bahías HDD
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.bahias_hdd || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleTechnicalChange('nvr', 'bahias_hdd', val);
                        handleTechnicalChange('nvr', 'bahias_sata', val);
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Capacidad Máx. por Disco (TB)
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.capacidad_max_por_disco_tb || 10}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleTechnicalChange('nvr', 'capacidad_max_por_disco_tb', val);
                        setFormData((prev: any) => ({
                          ...prev,
                          datos_tecnicos: {
                            ...prev.datos_tecnicos,
                            caracteristicas_principales: {
                              ...prev.datos_tecnicos?.caracteristicas_principales,
                              capacidad_max: `Hasta ${val}TB por disco`
                            }
                          }
                        }));
                      }}
                      min={1}
                      max={32}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Puertos PoE Integrados
                    </label>
                    <input
                      type="number"
                      value={nvrSpecs.puertos_poe_integrados || nvrSpecs.canales_poe || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        handleTechnicalChange('nvr', 'puertos_poe_integrados', val);
                        handleTechnicalChange('nvr', 'canales_poe', val);
                      }}
                      min={0}
                      max={64}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Resolución Máx. Grabación
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.resolucion_max_grabacion || '4K / 8MP'}
                      onChange={(e) => handleTechnicalChange('nvr', 'resolucion_max_grabacion', e.target.value)}
                      placeholder="ej. 4K, 8MP, 12MP"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Ancho de Banda Entrante (Mbps)
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.ancho_banda_entrada_mbps || '80 Mbps'}
                      onChange={(e) => handleTechnicalChange('nvr', 'ancho_banda_entrada_mbps', e.target.value)}
                      placeholder="ej. 80 Mbps, 160 Mbps"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Salidas de Video
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.salidas_video || '1x HDMI, 1x VGA'}
                      onChange={(e) => handleTechnicalChange('nvr', 'salidas_video', e.target.value)}
                      placeholder="ej. 1x HDMI 4K, 1x VGA"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Alimentación
                    </label>
                    <input
                      type="text"
                      value={nvrSpecs.alimentacion || (formData.datos_tecnicos as any)?.caracteristicas_principales?.alimentacion || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTechnicalChange('nvr', 'alimentacion', val);
                        setFormData((prev) => ({
                          ...prev,
                          datos_tecnicos: {
                            ...prev.datos_tecnicos,
                            caracteristicas_principales: {
                              ...(prev.datos_tecnicos?.caracteristicas_principales as any),
                              alimentacion: val
                            }
                          }
                        }));
                      }}
                      placeholder="ej. 12V DC, 48V DC, 100~240V AC"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Toggles de Interfaces E/S de NVR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(nvrSpecs.entradas_alarma || (formData.datos_tecnicos as any)?.caracteristicas_principales?.entradas_alarma)}
                      onChange={(e) => {
                        const val = e.target.checked ? '4-ch Entrada de Alarma' : '';
                        handleTechnicalChange('nvr', 'entradas_alarma', val);
                        setFormData((prev) => ({
                          ...prev,
                          datos_tecnicos: {
                            ...prev.datos_tecnicos,
                            caracteristicas_principales: {
                              ...(prev.datos_tecnicos?.caracteristicas_principales as any),
                              entradas_alarma: val || null
                            }
                          }
                        }));
                      }}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Entrada de Alarma (Alarm In)
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(nvrSpecs.salidas_alarma || (formData.datos_tecnicos as any)?.caracteristicas_principales?.salidas_alarma)}
                      onChange={(e) => {
                        const val = e.target.checked ? '1-ch Salida de Alarma' : '';
                        handleTechnicalChange('nvr', 'salidas_alarma', val);
                        setFormData((prev) => ({
                          ...prev,
                          datos_tecnicos: {
                            ...prev.datos_tecnicos,
                            caracteristicas_principales: {
                              ...(prev.datos_tecnicos?.caracteristicas_principales as any),
                              salidas_alarma: val || null
                            }
                          }
                        }));
                      }}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <ShieldCheck className="h-4 w-4 text-rose-600" />
                    Salida de Alarma (Alarm Out)
                  </label>
                </div>
              </div>
            )}

            {formData.tipo_dispositivo === 'SWITCH' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tiandy-700 dark:text-tiandy-400 flex items-center gap-1.5">
                  <Network className="h-4 w-4" />
                  Parámetros Técnicos de Switch PoE
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Puertos PoE
                    </label>
                    <input
                      type="number"
                      value={switchSpecs.puertos_poe || 8}
                      onChange={(e) => handleTechnicalChange('switch', 'puertos_poe', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Presupuesto PoE Total (Watts)
                    </label>
                    <input
                      type="number"
                      value={switchSpecs.poe_budget_watts || 120}
                      onChange={(e) => handleTechnicalChange('switch', 'poe_budget_watts', parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Puertos Uplink
                    </label>
                    <input
                      type="text"
                      value={switchSpecs.puertos_uplink || '2x Gigabit'}
                      onChange={(e) => handleTechnicalChange('switch', 'puertos_uplink', e.target.value)}
                      placeholder="ej. 2x Gigabit RJ45, 2x SFP"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(switchSpecs.modo_extendido_250m)}
                      onChange={(e) => handleTechnicalChange('switch', 'modo_extendido_250m', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <span>Soporta Modo Extendido (250m a 10Mbps)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={switchSpecs.poe_watchdog !== false}
                      onChange={(e) => handleTechnicalChange('switch', 'poe_watchdog', e.target.checked)}
                      className="rounded text-tiandy-700 focus:ring-tiandy-600 h-4 w-4"
                    />
                    <span>Soporta Función PoE Watchdog Automático</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ETIQUETAS Y SELLOS GRÁFICOS */}
        {activeTab === 'badges' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* Cabecera explicativa de la sección */}
            <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Gestión Centralizada y Uniforme de Etiquetas
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Activa o desactiva las etiquetas, sellos gráficos y distintivos tecnológicos para este producto. Todos los textos y distintivos automáticos del PDF pueden marcarse o desmarcarse individualmente aquí.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda: Activación de Sellos y Distintivos (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. SELLOS GRÁFICOS SOBRE LA IMAGEN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      1. Sellos Gráficos sobre Imagen (Activar / Desactivar)
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Ubicación y tamaño uniformes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentSellos.map((sello) => (
                      <div
                        key={sello.id}
                        onClick={() => handleToggleSello(sello.id)}
                        className={`cursor-pointer rounded-2xl border p-3 transition-all flex items-center justify-between ${
                          sello.activo
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-600 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-75 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                            <img
                              src={sello.imagen_url || `/data/badges/${sello.id.toLowerCase().replace('_', '-')}.svg`}
                              alt={sello.nombre}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.onerror = null;
                                if (sello.id === 'NUEVO_MODELO') img.src = '/data/badges/nuevo-modelo.svg';
                                else if (sello.id === 'COLORMAKER') img.src = '/data/badges/colormaker.svg';
                                else if (sello.id === 'POLAR_DAY') img.src = '/data/badges/polarday.svg';
                                else if (sello.id === 'SMD_1') img.src = '/data/badges/smd-1.svg';
                                else if (sello.id === 'SMD_2') img.src = '/data/badges/smd-2.svg';
                                else if (sello.id === 'SMD_3') img.src = '/data/badges/smd-3.svg';
                                else if (sello.id === 'VCA') img.src = '/data/badges/vca.svg';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{sello.nombre}</span>
                              {sello.activo_global === false && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold">
                                  Global Inactivo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {sello.posicion || 'top-right'} • {sello.tamano || 100}%
                            </div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          sello.activo ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                        }`}>
                          {sello.activo && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. DISTINTIVOS TECNOLÓGICOS FUNCIONALES */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      2. Distintivos Tecnológicos Funcionales (Pastillas sobre Imagen)
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Activa o desmarca para mostrar u ocultar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {AVAILABLE_TECH_BADGES.map((b) => {
                      const isActive = isTechBadgeActive(b);
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleToggleTechBadge(b)}
                          className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                            isActive
                              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-700 text-slate-900 dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{b.label}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                            }`}>
                              {isActive && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {b.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. OTRAS ETIQUETAS DETECTADAS DEL PDF / PERSONALIZADAS */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-emerald-600" />
                      3. Otras Etiquetas Detectadas y Personalizadas
                    </h4>
                    {(formData.badges_detectados && formData.badges_detectados.length > 0) && (
                      <button
                        type="button"
                        onClick={handleClearAllTextBadges}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Limpiar todas las etiquetas
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-3">
                    {otherDetectedBadges.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No hay etiquetas adicionales de texto detectadas para este producto.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                          Etiquetas activas adicionales (haz clic en × para quitar):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {otherDetectedBadges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs"
                            >
                              <span>{badge}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveBadge(badge);
                                }}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                title={`Quitar etiqueta "${badge}"`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Agregar nueva etiqueta personalizada */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={customBadgeInput}
                        onChange={(e) => setCustomBadgeInput(e.target.value)}
                        placeholder="Nueva etiqueta personalizada (ej. Hi-PoE, Full-Color...)"
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomBadge();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomBadge}
                        className="rounded-xl bg-tiandy-700 text-white hover:bg-tiandy-600 px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Previsualización en Vivo de la Tarjeta con Sellos (5 cols) */}
              <div className="lg:col-span-5 sticky top-16">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-tiandy-600" />
                      Previsualización en Vivo de la Imagen
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      CSS Overlays
                    </span>
                  </div>

                  {/* Cuadro simulador idéntico a ProductCard */}
                  <div className="relative aspect-[16/10] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-center p-4 overflow-hidden shadow-inner select-none">
                    {/* Sellos detrás */}
                    <SellosGraficosOverlay sellos={currentSellos} capaFiltro="back" tamano="normal" />

                    {/* Badges de texto funcionales superpuestos */}
                    <BadgeOverlay badges={formData.badges_detectados} activeSellos={currentSellos} hasTopRightSello={hasTopRightSello} />

                    {/* Imagen principal */}
                    {localImagePreview || formData.imagen_principal ? (
                      <img
                        src={localImagePreview || formData.imagen_principal}
                        alt="Previsualización"
                        className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm"
                      />
                    ) : (
                      <div className="text-center text-slate-300 dark:text-slate-600 relative z-10">
                        <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-1" />
                        <span className="text-[10px] font-mono uppercase text-slate-400">Sin Imagen Cargada</span>
                      </div>
                    )}

                    {/* Sellos delante */}
                    <SellosGraficosOverlay sellos={currentSellos} capaFiltro="front" tamano="normal" />

                    {/* Badge de stock simulado para ver superposición */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border border-slate-200 bg-slate-100/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 shadow-2xs z-30">
                      STOCK
                    </span>
                  </div>

                  {/* Resumen de elementos aplicados */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-2 pt-1">
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Sellos gráficos activos:
                      </div>
                      {currentSellos.filter(s => s.activo).length === 0 ? (
                        <div className="text-[10px] italic text-slate-400">Ningún sello gráfico activo</div>
                      ) : (
                        <div className="space-y-1">
                          {currentSellos.filter(s => s.activo).map(s => (
                            <div key={s.id} className="text-[10px] flex items-center justify-between font-mono bg-white dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200">• {s.nombre}</span>
                              <span className="text-slate-400">
                                {s.posicion} ({s.capa === 'front' ? 'delante' : 'fondo'})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Etiquetas de texto activas sobre imagen:
                      </div>
                      {(!formData.badges_detectados || formData.badges_detectados.length === 0) ? (
                        <div className="text-[10px] italic text-slate-400">Ninguna etiqueta de texto activa</div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {formData.badges_detectados.map(b => (
                            <span key={b} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-white border border-white/20">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MATRIZ DATASHEET & COMPARATIVA */}
        {activeTab === 'matriz' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Header explicativo y añadir nueva categoría */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                    <FileSpreadsheet className="h-4 w-4 text-tiandy-700 dark:text-tiandy-400" />
                    <span>Matriz de Especificaciones del Datasheet</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Información técnica completa extraída del PDF oficial. Se utiliza para la matriz comparativa de productos y la ficha técnica profunda.
                  </p>
                </div>

                {/* Formulario rápido para añadir nueva categoría */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nueva categoría (ej. Audio)"
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDatasheetCategoryAdd(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleDatasheetCategoryAdd}
                    className="rounded-xl bg-tiandy-700 text-white hover:bg-tiandy-600 px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Crear Sección</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de Categorías con Acordeón */}
            {Object.keys(formData.datos_tecnicos?.especificaciones_datasheet || {}).length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Sin matriz técnica registrada</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Sube el archivo PDF del producto con el botón de auto-llenado superior para cargar automáticamente todas las especificaciones estructuradas, o agrega una categoría manualmente.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(formData.datos_tecnicos?.especificaciones_datasheet || {}).map(([cat, items]) => {
                  const isExpanded = expandedCategories[cat] !== false;
                  const count = items ? Object.keys(items).length : 0;

                  return (
                    <div
                      key={cat}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                    >
                      {/* Cabecera del Acordeón */}
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="flex items-center gap-2 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-tiandy-600 dark:hover:text-tiandy-400 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          )}
                          <span className="uppercase tracking-wide">{cat}</span>
                          <span className="text-[10px] font-normal text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            {count} parámetros
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDatasheetItemAdd(cat)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Parámetro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDatasheetCategoryDelete(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar sección completa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Cuerpo del Acordeón (Grid de Claves y Valores) */}
                      {isExpanded && (
                        <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                          {count === 0 ? (
                            <div className="text-[11px] italic text-slate-400 py-2 text-center">
                              Sección sin parámetros. Usa el botón "+ Parámetro" para añadir uno.
                            </div>
                          ) : (
                            Object.entries(items || {}).map(([key, val], idx) => (
                              <div
                                key={`${cat}-${key}-${idx}`}
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 py-2 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-1 rounded-lg"
                              >
                                {/* Nombre del Parámetro (Clave) */}
                                <div className="md:col-span-4">
                                  <input
                                    type="text"
                                    defaultValue={key}
                                    onBlur={(e) => {
                                      if (e.target.value !== key) {
                                        handleDatasheetKeyChange(cat, key, e.target.value);
                                      }
                                    }}
                                    className="w-full text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-tiandy-600 focus:outline-none"
                                    placeholder="Nombre del parámetro"
                                  />
                                </div>

                                {/* Valor del Parámetro */}
                                <div className="md:col-span-7">
                                  <input
                                    type="text"
                                    value={val || ''}
                                    onChange={(e) => handleDatasheetValChange(cat, key, e.target.value)}
                                    className="w-full text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-tiandy-600 focus:outline-none"
                                    placeholder="Valor técnico (ej. 2.8mm, IP67, etc.)"
                                  />
                                </div>

                                {/* Botón Borrar Fila */}
                                <div className="md:col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleDatasheetItemDelete(cat, key)}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Eliminar este parámetro"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer compacto de estado */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          <div>
            {formData.precio_usd ? `Precio fijado: ${formatCurrency(formData.precio_usd)} neto s/IVA` : 'Sin precio fijado'}
          </div>
          <div className="text-[11px] text-slate-400">
            {formData.modelo ? `Modelo: ${formData.modelo}` : ''}
          </div>
        </div>
      </form>
    </div>
  );
};
