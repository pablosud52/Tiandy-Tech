import React, { useState, useEffect, useMemo } from 'react';
import { Producto, TipoDispositivo, FiltrosBusqueda, ItemCotizacion, BadgeGlobalConfig } from '../shared/types.js';
import { getProductSpecs, matchesSearchQuery } from '../shared/helpers.js';
import { Navbar } from './components/Navbar.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductTable } from './components/ProductTable.js';
import { FilterSidebar } from './components/FilterSidebar.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { getProductSellos } from './components/Badges.js';
import { CompareFloatingBar, CompareModal } from './components/CompareModal.js';
import { CompareView } from './components/CompareView.js';
import { QuotationModal, QuotationFloatingBar } from './components/QuotationModal.js';
import { WikiPage } from './pages/WikiPage.js';
// Detección estricta de compilación pública para Cloudflare Pages
const isPublicBuild = import.meta.env.VITE_PUBLIC_BUILD === 'true';

// Lazy loading condicional: Vite y Rollup omiten y no generan chunks del panel en build público
const AdminPage = !isPublicBuild
  ? React.lazy(() => import('./admin/AdminPage.js').then((m) => ({ default: m.AdminPage })))
  : null;
const AdminLogin = !isPublicBuild
  ? React.lazy(() => import('./admin/AdminLogin.js').then((m) => ({ default: m.AdminLogin })))
  : null;

import { Filter, SlidersHorizontal, Loader2, AlertCircle, ArrowUpDown, Barcode, X, Calculator, BatteryCharging, Database, LayoutGrid, Table } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<'catalog' | 'wiki' | 'admin' | 'compare' | 'herramientas'>('catalog');
  const [activeTab, setActiveTab] = useState<TipoDispositivo | 'WIKI'>('CAMARA');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaCodigo, setBusquedaCodigo] = useState<string>('');

  // Salvaguarda: En build público nunca permitir vista 'admin'
  useEffect(() => {
    if (isPublicBuild && activeView === 'admin') {
      setActiveView('catalog');
    }
  }, [activeView]);

  // Admin Authentication State (solo activo en entorno local/NAS con admin habilitado)
  const [adminUser, setAdminUser] = useState<any>(() => {
    if (isPublicBuild) return null;
    try {
      // Limpiar residuos antiguos permanentes de localStorage
      localStorage.removeItem('tiandy_admin_token');
      localStorage.removeItem('tiandy_admin_user');
      const saved = sessionStorage.getItem('tiandy_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (isPublicBuild) return null;
    return sessionStorage.getItem('tiandy_admin_token') || null;
  });

  // Validar sesión activa en el backend al montar o cambiar token (solo en modo local / NAS)
  useEffect(() => {
    if (isPublicBuild) return;
    if (adminToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            sessionStorage.removeItem('tiandy_admin_token');
            sessionStorage.removeItem('tiandy_admin_user');
            localStorage.removeItem('tiandy_admin_token');
            localStorage.removeItem('tiandy_admin_user');
            setAdminUser(null);
            setAdminToken(null);
          } else {
            setAdminUser(data.user);
          }
        })
        .catch(() => {
          sessionStorage.removeItem('tiandy_admin_token');
          sessionStorage.removeItem('tiandy_admin_user');
          setAdminUser(null);
          setAdminToken(null);
        });
    }
  }, [adminToken]);

  // Dark Mode (por defecto modo visual claro)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tiandy_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tiandy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tiandy_theme', 'light');
    }
  }, [darkMode]);

  // Secciones Visibles en Catálogo Público (controladas desde el panel)
  const [seccionesVisibles, setSeccionesVisibles] = useState<Record<string, boolean>>({
    CAMARA: true,
    NVR: true,
    SWITCH: true,
    ACCESORIO: true,
    WIKI: true,
    HERRAMIENTAS: true,
    COMPARADOR: true,
    COTIZADOR: true,
    HERRAMIENTAS_UPS: true,
    HERRAMIENTAS_ALMACENAMIENTO: true
  });

  // Redirigir al catálogo principal si la sección activa fue deshabilitada
  useEffect(() => {
    if (activeView === 'wiki' && seccionesVisibles?.WIKI === false) {
      setActiveView('catalog');
    } else if (activeView === 'compare' && seccionesVisibles?.COMPARADOR === false) {
      setActiveView('catalog');
    } else if (
      activeView === 'herramientas' &&
      (seccionesVisibles?.HERRAMIENTAS === false ||
        (seccionesVisibles?.HERRAMIENTAS_UPS === false && seccionesVisibles?.HERRAMIENTAS_ALMACENAMIENTO === false))
    ) {
      setActiveView('catalog');
    }
  }, [activeView, seccionesVisibles]);

  // Configuración Centralizada de Etiquetas Globales con persistencia inmediata para evitar parpadeos
  const [globalBadges, setGlobalBadges] = useState<BadgeGlobalConfig[]>(() => {
    try {
      const cached = localStorage.getItem('tiandy_global_badges');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Data State
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    serie: [],
    estado_stock: [],
    formato: [],
    resolucion_mp: [],
    badges: [],
    canales: [],
    bahias: [],
    puertos_poe: [],
    puertos_poe_nvr: [],
    interfaces_es: [],
    microfono_incorporado: false,
    altavoz_incorporado: false,
    slot_sd: false,
    poe_integrado: false,
    modo_extendido: false
  });

  // Resetear filtros automáticamente al cambiar de sección/categoría para no bloquear productos
  useEffect(() => {
    setFiltros({
      serie: [],
      estado_stock: [],
      formato: [],
      resolucion_mp: [],
      badges: [],
      canales: [],
      bahias: [],
      puertos_poe: [],
      puertos_poe_nvr: [],
      interfaces_es: [],
      microfono_incorporado: false,
      altavoz_incorporado: false,
      slot_sd: false,
      poe_integrado: false,
      modo_extendido: false
    });
  }, [activeTab]);

  // Mobile Filters Drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Producto[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Sorting State
  const [ordenarPor, setOrdenarPor] = useState<'modelo_asc' | 'precio_asc' | 'precio_desc'>('modelo_asc');

  // Quotation State
  const [cotizacion, setCotizacion] = useState<ItemCotizacion[]>(() => {
    try {
      const saved = localStorage.getItem('tiandy_cotizacion');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && item.producto && item.producto.id != null);
    } catch {
      return [];
    }
  });
  const [isCotizacionOpen, setIsCotizacionOpen] = useState<boolean>(false);

  // Persist quotation in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tiandy_cotizacion', JSON.stringify(cotizacion));
    } catch {}
  }, [cotizacion]);

  // Quotation Handlers
  const handleAddToCotizacion = (producto: Producto, cantidad: number = 1) => {
    setCotizacion((prev) => {
      const exists = prev.find((item) => String(item.producto.id) === String(producto.id));
      if (exists) {
        return prev.map((item) =>
          String(item.producto.id) === String(producto.id)
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const handleToggleCotizacion = (producto: Producto) => {
    setCotizacion((prev) => {
      const exists = prev.find((item) => String(item.producto.id) === String(producto.id));
      if (exists) {
        return prev.filter((item) => String(item.producto.id) !== String(producto.id));
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const handleUpdateCotizacionQty = (productId: any, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCotizacion(productId);
      return;
    }
    setCotizacion((prev) =>
      prev.map((item) =>
        String(item.producto.id) === String(productId)
          ? { ...item, cantidad: newQty }
          : item
      )
    );
  };

  const handleRemoveFromCotizacion = (productId: any) => {
    setCotizacion((prev) => prev.filter((item) => String(item.producto.id) !== String(productId)));
  };

  const handleClearCotizacion = () => {
    setCotizacion([]);
  };

  // Sync TabsNav clicks with activeView
  const handleTabChange = (tab: TipoDispositivo | 'WIKI' | 'COMPARE' | 'HERRAMIENTAS') => {
    if (tab === 'WIKI') {
      setActiveView('wiki');
    } else if (tab === 'COMPARE') {
      setActiveView('compare');
    } else if (tab === 'HERRAMIENTAS') {
      setActiveView('herramientas');
    } else {
      setActiveView('catalog');
      setActiveTab(tab);
    }
  };

  // Fetch Products con anti-caché y soporte para refresco en tiempo real + fallback autónomo
  const fetchProductos = async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/productos?limit=500&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setProductos(list);
    } catch (err: any) {
      // Fallback a snapshot estático de datos para despliegues autónomos en Cloudflare Pages
      try {
        const staticRes = await fetch(`/data/productos.json?_t=${Date.now()}`);
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          const list = Array.isArray(staticData) ? staticData : staticData.data || [];
          setProductos(list);
          return;
        }
      } catch {}
      if (!silent) setError(`Error al cargar catálogo: ${err.message}`);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchSecciones = async () => {
    try {
      let res = await fetch(`/api/configuracion/secciones?_t=${Date.now()}`);
      if (!res.ok) {
        res = await fetch(`/data/sections.json?_t=${Date.now()}`);
      }
      const data = await res.json();
      if (data.success && data.secciones) {
        setSeccionesVisibles(data.secciones);
        // Si la sección activa quedó oculta, reasignar a la primera visible
        setActiveTab((prev) => {
          if (data.secciones[prev] === false) {
            const available = (['CAMARA', 'NVR', 'SWITCH', 'ACCESORIO'] as TipoDispositivo[]).find(
              (cat) => data.secciones[cat] !== false
            );
            return available || 'CAMARA';
          }
          return prev;
        });
      }
    } catch {
      try {
        const staticRes = await fetch(`/data/sections.json?_t=${Date.now()}`);
        if (staticRes.ok) {
          const data = await staticRes.json();
          if (data.success && data.secciones) setSeccionesVisibles(data.secciones);
        }
      } catch {}
    }
  };

  const fetchGlobalBadges = async () => {
    try {
      let res = await fetch(`/api/configuracion/badges?_t=${Date.now()}`);
      if (!res.ok) {
        res = await fetch(`/data/badges.json?_t=${Date.now()}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.badges)) {
        setGlobalBadges(data.badges);
        try {
          localStorage.setItem('tiandy_global_badges', JSON.stringify(data.badges));
        } catch {}
      }
    } catch {
      try {
        const staticRes = await fetch(`/data/badges.json?_t=${Date.now()}`);
        if (staticRes.ok) {
          const data = await staticRes.json();
          if (data.success && Array.isArray(data.badges)) setGlobalBadges(data.badges);
        }
      } catch {}
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchSecciones();
    fetchGlobalBadges();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('tiandy_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'REFRESH_ALL') {
          fetchProductos(true);
          fetchSecciones();
          fetchGlobalBadges();
        }
      };
    } catch {}

    const handleFocus = () => {
      fetchProductos(true);
      fetchSecciones();
      fetchGlobalBadges();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (bc) bc.close();
    };
  }, []);

  // Revalidación inmediata al regresar a la vista pública de catálogo
  useEffect(() => {
    if (activeView === 'catalog' || activeView === 'compare') {
      fetchProductos(true);
      fetchSecciones();
      fetchGlobalBadges();
    }
  }, [activeView]);

  // Comparison Handlers con restricción de homogeneidad de categoría (máx 4)
  const handleToggleCompare = (producto: Producto) => {
    if (comparedProducts.some((p) => p.id === producto.id)) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== producto.id));
      return;
    }

    if (comparedProducts.length > 0 && comparedProducts[0].tipo_dispositivo !== producto.tipo_dispositivo) {
      const catLabel = comparedProducts[0].tipo_dispositivo === 'CAMARA' 
        ? 'Cámaras IP' 
        : comparedProducts[0].tipo_dispositivo === 'NVR' 
        ? 'NVRs / Grabadores' 
        : 'Switches PoE';
      alert(`No se pueden comparar productos de diferentes categorías. Actualmente estás comparando ${catLabel}. Limpia la comparativa para comparar otros dispositivos.`);
      return;
    }

    if (comparedProducts.length < 4) {
      setComparedProducts((prev) => [...prev, producto]);
    } else {
      alert('Se permite comparar hasta un máximo de 4 productos simultáneamente.');
    }
  };

  const handleRemoveCompare = (id: any) => {
    setComparedProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
    setIsCompareModalOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFiltros({
      serie: [],
      estado_stock: [],
      formato: [],
      resolucion_mp: [],
      badges: [],
      canales: [],
      bahias: [],
      puertos_poe: [],
      puertos_poe_nvr: [],
      interfaces_es: [],
      microfono_incorporado: false,
      altavoz_incorporado: false,
      slot_sd: false,
      poe_integrado: false,
      modo_extendido: false
    });
    setBusqueda('');
    setBusquedaCodigo('');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (activeView !== 'catalog') return [];

    return productos.filter((prod) => {
      // 0. Ocultar si la sección está deshabilitada en el panel
      if (seccionesVisibles && seccionesVisibles[prod.tipo_dispositivo] === false) {
        return false;
      }

      // 1. Tab Tipo Dispositivo
      if ((prod.tipo_dispositivo as string) !== activeTab) return false;

      const specs = getProductSpecs(prod);

      // 2. Buscador General de Catálogo (Motor Universal con Datasheet Corpus y operador AND)
      if (busqueda.trim()) {
        if (!matchesSearchQuery(prod, busqueda, globalBadges)) {
          return false;
        }
      }

      // 3. Series Tiandy (AK, SK, LK, WIFI / 4G Solar, PTZ)
      if (filtros.serie && filtros.serie.length > 0) {
        const matchesSerie = filtros.serie.some((s: string) => {
          const sLower = s.toLowerCase();
          const prodSerieLower = (prod.serie || '').toLowerCase();
          const prodModelLower = (prod.modelo || '').toLowerCase();
          const prodDescLower = (prod.subtipo || prod.especificacion_completa || '').toLowerCase();

          if (s === 'AK') {
            return prodSerieLower.includes('ak');
          }
          if (s === 'SK') {
            return prodSerieLower.includes('sk') || prodSerieLower.includes('spark');
          }
          if (s === 'LK') {
            return prodSerieLower.includes('lk') || prodSerieLower.includes('lite');
          }
          if (s === 'WIFI_4G') {
            const cam = (prod.datos_tecnicos as any)?.camara;
            const conec = (cam?.conectividad_tipo || '').toLowerCase();
            return (
              prodSerieLower.includes('wifi') ||
              prodSerieLower.includes('wi-fi') ||
              prodSerieLower.includes('solar') ||
              prodSerieLower.includes('4g') ||
              prodModelLower.includes('wifi') ||
              prodDescLower.includes('wifi') ||
              prodDescLower.includes('wi-fi') ||
              prodDescLower.includes('solar') ||
              conec.includes('wi-fi') ||
              conec.includes('solar') ||
              conec.includes('4g')
            );
          }
          if (s === 'PTZ') {
            return (
              prodSerieLower.includes('ptz') ||
              prodModelLower.includes('ptz') ||
              (specs.formato || '').toLowerCase().includes('ptz') ||
              prodDescLower.includes('ptz')
            );
          }
          return prodSerieLower.includes(sLower);
        });

        if (!matchesSerie) return false;
      }

      // 4. Estado Stock
      if (filtros.estado_stock && filtros.estado_stock.length > 0) {
        if (!filtros.estado_stock.includes(prod.estado_stock)) return false;
      }

      // 5. Formato
      if (filtros.formato && filtros.formato.length > 0) {
        if (!filtros.formato.some((f: string) => specs.formato.toLowerCase().includes(f.toLowerCase()))) {
          return false;
        }
      }

      // 6. Resolución
      if (filtros.resolucion_mp && filtros.resolucion_mp.length > 0) {
        if (!filtros.resolucion_mp.some((r: string) => specs.resolucion.toUpperCase().includes(r.toUpperCase()))) {
          return false;
        }
      }

      // 7. Badges de tecnología y Sellos Gráficos
      if (filtros.badges && filtros.badges.length > 0) {
        const sellos = getProductSellos(prod);
        const hasAnyBadge = filtros.badges.some((b: string) => {
          const bNorm = b.toUpperCase().replace(/\s+/g, '_');
          // Chequear sellos gráficos activos
          if (bNorm === 'COLORMAKER' && sellos.some((s) => s.id === 'COLORMAKER' && s.activo)) return true;
          if (bNorm === 'POLAR_DAY' && sellos.some((s) => s.id === 'POLAR_DAY' && s.activo)) return true;
          if (bNorm === 'NUEVO_MODELO' && (sellos.some((s) => s.id === 'NUEVO_MODELO' && s.activo) || prod.badge_nuevo)) return true;
          // Chequear badges detectados en formato normalizado
          return (prod.badges_detectados || []).some((bd: string) => {
            const bdNorm = bd.toUpperCase().replace(/\s+/g, '_');
            return bdNorm === bNorm || bdNorm.includes(bNorm) || bNorm.includes(bdNorm);
          });
        });
        if (!hasAnyBadge) return false;
      }

      // 8. Audio
      if (filtros.microfono_incorporado && !specs.microfono) return false;
      if (filtros.altavoz_incorporado && !specs.altavoz) return false;
      if (filtros.slot_sd && !specs.ranura_sd) return false;

      // 9. Canales NVR
      if (filtros.canales && filtros.canales.length > 0) {
        const prodCh = `${specs.canales}ch`;
        if (!filtros.canales.includes(prodCh)) return false;
      }

      // 10. Bahías NVR
      if (filtros.bahias && filtros.bahias.length > 0) {
        const prodB = `${specs.bahias} HDD${(specs.bahias || 1) > 1 ? 's' : ''}`;
        if (!filtros.bahias.includes(prodB)) return false;
      }
      if (filtros.poe_integrado && (!specs.canales_poe || specs.canales_poe === 0)) return false;

      // 10.1 Puertos PoE NVR (4 Puertos PoE / 8 Puertos PoE)
      if (filtros.puertos_poe_nvr && filtros.puertos_poe_nvr.length > 0) {
        const poeMatches = filtros.puertos_poe_nvr.some((pStr: string) => {
          if (pStr.includes('4') && specs.canales_poe === 4) return true;
          if (pStr.includes('8') && specs.canales_poe === 8) return true;
          return false;
        });
        if (!poeMatches) return false;
      }

      // 10.2 Interfaces E/S (Alarmas y Audio en Cámaras y NVRs)
      if (filtros.interfaces_es && filtros.interfaces_es.length > 0) {
        for (const es of filtros.interfaces_es) {
          if (es === 'ENTRADA_ALARMA' && !specs.entrada_alarma) return false;
          if (es === 'SALIDA_ALARMA' && !specs.salida_alarma) return false;
          if (es === 'SALIDA_AUDIO' && !specs.salida_audio) return false;
        }
      }

      // 11. Switches
      if (filtros.puertos_poe && filtros.puertos_poe.length > 0) {
        const pStr = `${specs.puertos_poe} Puertos PoE`;
        if (!filtros.puertos_poe.includes(pStr)) return false;
      }

      return true;
    });
  }, [productos, activeView, activeTab, busqueda, filtros, seccionesVisibles]);

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (ordenarPor === 'precio_asc') {
      return list.sort((a, b) => {
        const pA = a.precio_usd ?? Infinity;
        const pB = b.precio_usd ?? Infinity;
        return pA - pB;
      });
    }
    if (ordenarPor === 'precio_desc') {
      return list.sort((a, b) => {
        const pA = a.precio_usd ?? -Infinity;
        const pB = b.precio_usd ?? -Infinity;
        return pB - pA;
      });
    }
    if (ordenarPor === 'modelo_asc') {
      return list.sort((a, b) => a.modelo.localeCompare(b.modelo));
    }
    return list;
  }, [filteredProducts, ordenarPor]);

  // Totals for Quotation
  const totalCotizacionItems = useMemo(
    () => cotizacion.reduce((acc, item) => acc + (item?.cantidad || 0), 0),
    [cotizacion]
  );

  const totalCotizacionMonto = useMemo(
    () => cotizacion.reduce((acc, item) => acc + (item?.producto?.precio_usd || 0) * (item?.cantidad || 0), 0),
    [cotizacion]
  );

  const cotizacionIds = useMemo(
    () => cotizacion.filter((item) => item?.producto?.id != null).map((item) => String(item.producto.id)),
    [cotizacion]
  );

  // Counts for Tabs
  const counts = useMemo(() => {
    return {
      camaras: productos.filter((p) => p.tipo_dispositivo === 'CAMARA').length,
      nvrs: productos.filter((p) => p.tipo_dispositivo === 'NVR').length,
      switches: productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length,
      accesorios: productos.filter((p) => p.tipo_dispositivo === 'ACCESORIO').length
    };
  }, [productos]);

  const comparedIds = useMemo(() => comparedProducts.map((p) => String(p.id)), [comparedProducts]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Cabecera Unificada Sticky (Navbar única) - Solo visible fuera del panel de control */}
      {activeView !== 'admin' && (
        <header className="sticky top-0 z-40 glass-header border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
          <Navbar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            activeView={activeView}
            setActiveView={setActiveView}
            activeCategory={activeTab as TipoDispositivo}
            onSelectCategory={(cat) => handleTabChange(cat)}
            counts={counts}
            compareCount={comparedProducts.length}
            onOpenCotizacion={() => setIsCotizacionOpen(true)}
            totalCotizacionItems={totalCotizacionItems}
            seccionesVisibles={seccionesVisibles}
          />
        </header>
      )}

      {/* Main Content Area */}
      {(!isPublicBuild && activeView === 'admin' && AdminPage && AdminLogin) ? (
        <main className="flex-1">
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm">Cargando panel...</div>}>
            {!adminUser || !adminToken ? (
              <AdminLogin
                onLoginSuccess={(user, token) => {
                  setAdminUser(user);
                  setAdminToken(token);
                }}
                onBackToCatalog={() => setActiveView('catalog')}
              />
            ) : (
              <AdminPage
                currentUser={adminUser}
                adminToken={adminToken}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={() => {
                  if (adminToken) {
                    fetch('/api/auth/logout', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${adminToken}` }
                    }).catch(() => {});
                  }
                  sessionStorage.removeItem('tiandy_admin_token');
                  sessionStorage.removeItem('tiandy_admin_user');
                  localStorage.removeItem('tiandy_admin_token');
                  localStorage.removeItem('tiandy_admin_user');
                  setAdminUser(null);
                  setAdminToken(null);
                  fetchProductos(true);
                  setActiveView('catalog');
                }}
                onBackToCatalog={() => {
                  fetchProductos(true);
                  setActiveView('catalog');
                }}
                onRefreshCatalog={() => fetchProductos(true)}
              />
            )}
          </React.Suspense>
        </main>
      ) : activeView === 'wiki' ? (
        <main className="flex-1">
          <WikiPage />
        </main>
      ) : activeView === 'compare' ? (
        <main className="flex-1">
          <CompareView
            productos={comparedProducts}
            allProductos={productos}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
            onAddProduct={handleToggleCompare}
            onBackToCatalog={() => setActiveView('catalog')}
            onOpenProductDetail={setSelectedProduct}
            onAddToCotizacion={handleAddToCotizacion}
          />
        </main>
      ) : activeView === 'herramientas' ? (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tiandy-100 dark:bg-tiandy-950/60 text-tiandy-700 dark:text-tiandy-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              Herramientas de Ingeniería & Cálculo
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Calculadoras Técnicas para Instaladores
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl text-sm">
              Módulos diseñados para dimensionar sistemas de videovigilancia Tiandy: estimación de respaldo energético (UPS) y requerimientos de almacenamiento HDD según compresión S+265.
            </p>
          </div>

          {seccionesVisibles?.HERRAMIENTAS_UPS === false && seccionesVisibles?.HERRAMIENTAS_ALMACENAMIENTO === false ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No hay herramientas de cálculo habilitadas en este momento.</p>
              <p className="text-xs text-slate-400 mt-1">El administrador puede habilitar la Calculadora UPS o Almacenamiento HDD desde el panel de control en la sección "Visibilidad Web".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calculadora UPS */}
              {seccionesVisibles?.HERRAMIENTAS_UPS !== false && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-tiandy-400 transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                      <BatteryCharging className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      Calculadora de Respaldo UPS
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Dimensiona la autonomía de baterías y potencia requerida (VA/Watts) calculando el consumo consolidado de NVRs, cámaras PoE y switches Tiandy.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg w-fit">
                      <span>⚡ Próximamente disponible</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      En fase de calibración técnica
                    </button>
                  </div>
                </div>
              )}

              {/* Calculadora Almacenamiento HDD */}
              {seccionesVisibles?.HERRAMIENTAS_ALMACENAMIENTO !== false && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-tiandy-400 transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                      <Database className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      Calculadora de Almacenamiento HDD
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Estima los Terabytes necesarios para días de retención continua o por evento, aprovechando la eficiencia de compresión S+265 de Tiandy.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg w-fit">
                      <span>💾 Próximamente disponible</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      En fase de calibración técnica
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
            <div className="flex gap-6">
              {/* Desktop Filter Sidebar */}
              <FilterSidebar
                tipo={activeTab as TipoDispositivo}
                filtros={filtros}
                onChange={setFiltros}
                onReset={handleResetFilters}
                conteoResultados={sortedProducts.length}
                isOpenMobile={isMobileFiltersOpen}
                onCloseMobile={() => setIsMobileFiltersOpen(false)}
              />

              {/* Products Area */}
              <div className="flex-1 min-w-0">
                {/* Top Bar: Filtros Móvil + Ordenamiento a la izquierda | Contador a la derecha */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                    </button>

                    {/* Selector de modo Fichas / Tabla (estilo gemelo a Ordenar, con triple separación hacia Ordenar) */}
                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl mr-6">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          viewMode === 'grid'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Modo Fichas Visuales de Hardware"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Fichas</span>
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          viewMode === 'table'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Modo Tabla Técnica"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Tabla</span>
                      </button>
                    </div>

                    {/* Pastillas de ordenamiento a la izquierda */}
                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold px-1.5 flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        Ordenar:
                      </span>
                      <button
                        onClick={() => setOrdenarPor('modelo_asc')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          ordenarPor === 'modelo_asc'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Modelo A-Z
                      </button>
                      <button
                        onClick={() => setOrdenarPor('precio_asc')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          ordenarPor === 'precio_asc'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Precio: Menor
                      </button>
                      <button
                        onClick={() => setOrdenarPor('precio_desc')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          ordenarPor === 'precio_desc'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Precio: Mayor
                      </button>
                    </div>
                  </div>

                  {/* Contador de productos a la derecha (reemplaza 'Precios expresados...') */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Mostrando <strong className="text-slate-900 dark:text-white">{sortedProducts.length}</strong> de {counts[activeTab === 'CAMARA' ? 'camaras' : activeTab === 'NVR' ? 'nvrs' : activeTab === 'SWITCH' ? 'switches' : 'accesorios']} modelos
                    </span>
                  </div>
                </div>

                {/* Loading & Error States */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
                    <p className="text-sm font-semibold">Cargando catálogo técnico Tiandy...</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <h3 className="font-bold text-sm">Error de comunicación</h3>
                    <p className="text-xs mt-1">{error}</p>
                    <button
                      onClick={() => fetchProductos()}
                      className="mt-3 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                    >
                      Reintentar conexión
                    </button>
                  </div>
                )}

                {/* Products Grid / Table View */}
                {!isLoading && !error && (
                  <>
                    {sortedProducts.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <Filter className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                          No se encontraron modelos con los filtros seleccionados
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Prueba ajustar los parámetros de búsqueda o restablecer los filtros activos.
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                        >
                          Restablecer todos los filtros
                        </button>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1900px]:grid-cols-5 gap-5">
                        {sortedProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            producto={prod}
                            onSelect={setSelectedProduct}
                            isCompared={comparedIds.includes(String(prod.id))}
                            onToggleCompare={handleToggleCompare}
                            canCompare={comparedProducts.length < 4}
                            onAddToCotizacion={handleToggleCotizacion}
                            isEnCotizacion={cotizacionIds.includes(String(prod.id))}
                            globalBadges={globalBadges}
                          />
                        ))}
                      </div>
                    ) : (
                      <ProductTable
                        productos={sortedProducts}
                        onSelect={setSelectedProduct}
                        comparedIds={comparedIds}
                        onToggleCompare={handleToggleCompare}
                        canCompare={comparedProducts.length < 4}
                        onAddToCotizacion={handleToggleCotizacion}
                        cotizacionIds={cotizacionIds}
                        globalBadges={globalBadges}
                        activeTab={activeTab}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
      )}

      {/* Floating Action Bars (Cotizador & Comparador con vista rápida y acceso directo) */}
      <div className="fixed bottom-5 sm:bottom-6 left-1/2 z-40 -translate-x-1/2 transform flex flex-col-reverse items-center gap-2.5 max-w-[95vw] pointer-events-none">
        {seccionesVisibles?.COTIZADOR !== false && cotizacion.length > 0 && (
          <div className="pointer-events-auto">
            <QuotationFloatingBar
              items={cotizacion}
              onOpen={() => setIsCotizacionOpen(true)}
              onRemove={handleRemoveFromCotizacion}
              onClear={handleClearCotizacion}
              onUpdateQuantity={handleUpdateCotizacionQty}
              standalone={false}
            />
          </div>
        )}
        {seccionesVisibles?.COMPARADOR !== false && comparedProducts.length > 0 && (
          <div className="pointer-events-auto">
            <CompareFloatingBar
              productos={comparedProducts}
              onOpen={() => setActiveView('compare')}
              onRemove={handleRemoveCompare}
              onClear={handleClearCompare}
              standalone={false}
            />
          </div>
        )}
      </div>

      {/* Detail Technical Modal */}
      <ProductDetailModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isCompared={selectedProduct ? comparedIds.includes(String(selectedProduct.id)) : false}
        onToggleCompare={handleToggleCompare}
        canCompare={comparedProducts.length < 4}
        onAddToCotizacion={handleAddToCotizacion}
        globalBadges={globalBadges}
      />

      {/* Quotation Cart Modal */}
      <QuotationModal
        isOpen={isCotizacionOpen}
        onClose={() => setIsCotizacionOpen(false)}
        items={cotizacion}
        onUpdateQuantity={handleUpdateCotizacionQty}
        onRemoveItem={handleRemoveFromCotizacion}
        onClear={handleClearCotizacion}
      />

      {/* Side-by-Side Compare Modal */}
      <CompareModal
        productos={comparedProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenModal={() => setIsCompareModalOpen(true)}
      />

      {/* Footer Estilo en.tiandy.com (Fondo oscuro y textos blancos) */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-white py-6">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Marca Oficial */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-poppins font-black text-base sm:text-lg text-white tracking-tight">
              Tiandy Uruguay
            </span>
          </div>

          {/* Información Legal y Comercial con formato uniforme y alta visibilidad en blanco */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tiandy-400 shrink-0 shadow-xs" />
              <span>Los precios están expresados en Dólares Americanos (U$S) y no incluyen impuestos.</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tiandy-400 shrink-0 shadow-xs" />
              <span>Mercadería sujeta a stock disponible.</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tiandy-400 shrink-0 shadow-xs" />
              <span>Los precios pueden variar sin previo aviso.</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
