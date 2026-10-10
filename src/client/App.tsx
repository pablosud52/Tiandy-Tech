import React, { useState, useEffect, useMemo } from 'react';
import { Producto, TipoDispositivo, FiltrosBusqueda, ItemCotizacion } from '../shared/types.js';
import { getProductSpecs } from '../shared/helpers.js';
import { Navbar } from './components/Navbar.js';
import { TabsNav } from './components/TabsNav.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductTable } from './components/ProductTable.js';
import { FilterSidebar } from './components/FilterSidebar.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CompareFloatingBar, CompareModal } from './components/CompareModal.js';
import { QuotationModal } from './components/QuotationModal.js';
import { WikiPage } from './pages/WikiPage.js';
import { AdminPage } from './admin/AdminPage.js';
import { AdminLogin } from './admin/AdminLogin.js';
import { Filter, SlidersHorizontal, Loader2, AlertCircle, ArrowUpDown, Barcode, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<'catalog' | 'wiki' | 'admin'>('catalog');
  const [activeTab, setActiveTab] = useState<TipoDispositivo | 'WIKI'>('CAMARA');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [busqueda, setBusqueda] = useState<string>('');
  const [busquedaCodigo, setBusquedaCodigo] = useState<string>('');

  // Admin Authentication State
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('tiandy_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('tiandy_admin_token') || null;
  });

  // Validar sesión activa en el backend al montar o cambiar token
  useEffect(() => {
    if (adminToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            localStorage.removeItem('tiandy_admin_token');
            localStorage.removeItem('tiandy_admin_user');
            setAdminUser(null);
            setAdminToken(null);
          } else {
            setAdminUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [adminToken]);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    microfono_incorporado: false,
    altavoz_incorporado: false,
    slot_sd: false,
    poe_integrado: false,
    modo_extendido: false
  });

  // Mobile Filters Drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Producto[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Sorting State
  const [ordenarPor, setOrdenarPor] = useState<'default' | 'precio_asc' | 'precio_desc' | 'modelo_asc'>('default');

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

  // Sync TabsNav WIKI click with activeView
  const handleTabChange = (tab: TipoDispositivo | 'WIKI') => {
    if (tab === 'WIKI') {
      setActiveView('wiki');
    } else {
      setActiveView('catalog');
      setActiveTab(tab);
    }
  };

  // Fetch Products
  const fetchProductos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/productos?limit=500');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setProductos(list);
    } catch (err: any) {
      setError(`Error de conexión con el servidor: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Comparison Handlers
  const handleToggleCompare = (producto: Producto) => {
    if (comparedProducts.some((p) => p.id === producto.id)) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== producto.id));
    } else if (comparedProducts.length < 3) {
      setComparedProducts((prev) => [...prev, producto]);
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
      // 1. Tab Tipo Dispositivo
      if ((prod.tipo_dispositivo as string) !== activeTab) return false;

      const specs = getProductSpecs(prod);

      // 2. Buscador Exclusivo por Códigos (Código 1 y Código 2)
      if (busquedaCodigo.trim()) {
        const codQuery = busquedaCodigo.toLowerCase().trim();
        const matchCod1 = prod.codigo_1 ? prod.codigo_1.toLowerCase().includes(codQuery) : false;
        const matchCod2 = prod.codigo_2 ? prod.codigo_2.toLowerCase().includes(codQuery) : false;
        if (!matchCod1 && !matchCod2) {
          return false;
        }
      }

      // 3. Buscador General de Catálogo (Modelo, Serie, Descripción y Especificaciones)
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const matchModelo = prod.modelo.toLowerCase().includes(query);
        const matchSerie = (prod.serie || '').toLowerCase().includes(query);
        const matchDesc = (prod.subtipo || prod.especificacion_completa || '').toLowerCase().includes(query);
        const matchFormato = (specs.formato || '').toLowerCase().includes(query);
        const matchRes = (specs.resolucion || '').toLowerCase().includes(query);
        if (!matchModelo && !matchSerie && !matchDesc && !matchFormato && !matchRes) {
          return false;
        }
      }

      // 3. Serie Tiandy
      if (filtros.serie && filtros.serie.length > 0) {
        if (!filtros.serie.some((s: string) => prod.serie.toLowerCase().includes(s.toLowerCase()))) return false;
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

      // 7. Badges de tecnología
      if (filtros.badges && filtros.badges.length > 0) {
        const hasAnyBadge = filtros.badges.some((b: string) => prod.badges_detectados?.includes(b as any));
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

      // 11. Switches
      if (filtros.puertos_poe && filtros.puertos_poe.length > 0) {
        const pStr = `${specs.puertos_poe} Puertos PoE`;
        if (!filtros.puertos_poe.includes(pStr)) return false;
      }

      return true;
    });
  }, [productos, activeView, activeTab, busqueda, filtros]);

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
      switches: productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length
    };
  }, [productos]);

  const comparedIds = useMemo(() => comparedProducts.map((p) => String(p.id)), [comparedProducts]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Navbar Global */}
      <Navbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        busquedaCodigo={busquedaCodigo}
        setBusquedaCodigo={setBusquedaCodigo}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
        totalProductos={productos.length}
        onOpenCotizacion={() => setIsCotizacionOpen(true)}
        totalCotizacionItems={totalCotizacionItems}
        totalCotizacionMonto={totalCotizacionMonto}
      />

      {/* Main Content Area */}
      {activeView === 'admin' ? (
        <main className="flex-1">
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
              onLogout={() => {
                if (adminToken) {
                  fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${adminToken}` }
                  }).catch(() => {});
                }
                localStorage.removeItem('tiandy_admin_token');
                localStorage.removeItem('tiandy_admin_user');
                setAdminUser(null);
                setAdminToken(null);
                setActiveView('catalog');
              }}
              onBackToCatalog={() => setActiveView('catalog')}
            />
          )}
        </main>
      ) : activeView === 'wiki' ? (
        <main className="flex-1">
          <WikiPage />
        </main>
      ) : (
        <>
          {/* Tabs Navigation (Cámaras, NVRs, Switches, Wiki) */}
          <TabsNav
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            counts={counts}
          />

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
                {/* Top Bar: Mobile Filter Toggle + Status Count + Sort Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                    </button>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Mostrando <strong className="text-slate-900 dark:text-white">{sortedProducts.length}</strong> de {counts[activeTab === 'CAMARA' ? 'camaras' : activeTab === 'NVR' ? 'nvrs' : 'switches']} modelos
                    </span>

                    {/* Indicador de filtro exclusivo por código */}
                    {busquedaCodigo && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-mono font-medium text-amber-700 dark:text-amber-400">
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Código: <strong>{busquedaCodigo}</strong></span>
                        <button
                          onClick={() => setBusquedaCodigo('')}
                          className="ml-1 text-amber-600 hover:text-amber-900 dark:hover:text-white"
                          title="Quitar filtro de código"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Pastillas de ordenamiento */}
                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold px-1.5 flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        Ordenar:
                      </span>
                      <button
                        onClick={() => setOrdenarPor('default')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          ordenarPor === 'default'
                            ? 'bg-tiandy-700 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Defecto
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
                    </div>

                    <div className="text-[11px] font-medium text-slate-400 hidden xl:block">
                      Precios expresados en U$S neto oficial sin IVA
                    </div>
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
                      onClick={fetchProductos}
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
                            canCompare={comparedProducts.length < 3}
                            onAddToCotizacion={handleAddToCotizacion}
                            isEnCotizacion={cotizacionIds.includes(String(prod.id))}
                          />
                        ))}
                      </div>
                    ) : (
                      <ProductTable
                        productos={sortedProducts}
                        onSelect={setSelectedProduct}
                        comparedIds={comparedIds}
                        onToggleCompare={handleToggleCompare}
                        canCompare={comparedProducts.length < 3}
                        onAddToCotizacion={handleAddToCotizacion}
                        cotizacionIds={cotizacionIds}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* Floating Comparison Bar */}
      <CompareFloatingBar
        productos={comparedProducts}
        onOpen={() => setIsCompareModalOpen(true)}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
      />

      {/* Detail Technical Modal */}
      <ProductDetailModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isCompared={selectedProduct ? comparedIds.includes(String(selectedProduct.id)) : false}
        onToggleCompare={handleToggleCompare}
        canCompare={comparedProducts.length < 3}
        onAddToCotizacion={handleAddToCotizacion}
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

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Tiandy Tech</span>
            <span>•</span>
            <span>Plataforma Unificada de Catálogo Técnico y Datasheets</span>
          </div>
          <div>
            Diseñado para uso profesional de distribuidores, integradores e instaladores de CCTV.
          </div>
        </div>
      </footer>
    </div>
  );
}
