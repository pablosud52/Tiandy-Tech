import React, { useState, useEffect } from 'react';
import { Producto } from '../../shared/types.js';
import { AdminDashboardModule } from './modules/AdminDashboardModule.js';
import { AdminCatalogModule } from './modules/AdminCatalogModule.js';
import { AdminBatchModule } from './modules/AdminBatchModule.js';
import { AdminExtractorModule } from './modules/AdminExtractorModule.js';
import { AdminBadgesModule } from './modules/AdminBadgesModule.js';
import { AdminUsersModule } from './modules/AdminUsersModule.js';
import {
  BarChart3,
  Package,
  DollarSign,
  UploadCloud,
  Layers,
  Users,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

interface AdminPageProps {
  onBackToCatalog: () => void;
  currentUser: any;
  onLogout: () => void;
}

export type AdminModuleType = 'dashboard' | 'catalog' | 'batch' | 'extractor' | 'badges' | 'users';

export const AdminPage: React.FC<AdminPageProps> = ({
  onBackToCatalog,
  currentUser,
  onLogout
}) => {
  const [activeModule, setActiveModule] = useState<AdminModuleType>('dashboard');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Cargar productos completos (incluyendo ocultos)
  const loadProductos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/productos?todos=true');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setProductos(list);
    } catch (err) {
      console.error('Error al cargar productos para backoffice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const menuItems = [
    {
      id: 'dashboard' as AdminModuleType,
      nombre: 'Dashboard & Métricas',
      descripcion: 'Resumen ejecutivo y stock',
      icono: BarChart3
    },
    {
      id: 'catalog' as AdminModuleType,
      nombre: 'Catálogo & Modelos',
      descripcion: 'Gestión y visibilidad',
      icono: Package,
      badge: productos.length
    },
    {
      id: 'batch' as AdminModuleType,
      nombre: 'Editor Rápido Precios',
      descripcion: 'Edición masiva de lista',
      icono: DollarSign
    },
    {
      id: 'extractor' as AdminModuleType,
      nombre: 'Ingesta PDF (Datasheets)',
      descripcion: 'Extractor inteligente',
      icono: UploadCloud
    },
    {
      id: 'badges' as AdminModuleType,
      nombre: 'Badges y Tecnologías',
      descripcion: 'ColorMaker, Polar Day, EW',
      icono: Layers
    },
    {
      id: 'users' as AdminModuleType,
      nombre: 'Control de Usuarios',
      descripcion: 'Cuentas y contraseñas',
      icono: Users
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col">
      {/* Top Header Barra Superior del Admin */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
          {/* Logo y Botón Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Tiandy Tech
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                Backoffice
              </span>
            </div>

            {/* Breadcrumb del Módulo Activo */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span>Admin</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {menuItems.find((m) => m.id === activeModule)?.nombre}
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin User Info Pill */}
            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-sm">
                {(currentUser?.username || 'A').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.nombre || currentUser?.username || 'Administrador'}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                  {currentUser?.rol || 'SUPERADMIN'}
                </div>
              </div>
            </div>

            {/* Ir al Catálogo Público */}
            <button
              onClick={onBackToCatalog}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              title="Volver a la vista del catálogo público"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ver Catálogo</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors"
              title="Cerrar sesión del backoffice"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Backoffice Workspace con Sidebar */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* SIDEBAR DE MÓDULOS (Desktop & Mobile Drawer) */}
          <aside
            className={`w-full lg:w-64 xl:w-72 shrink-0 space-y-2 lg:sticky lg:top-20 ${
              isMobileMenuOpen ? 'block mb-4' : 'hidden lg:block'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Módulos de Gestión
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icono;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 translate-x-1'
                        : 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.nombre}</div>
                        <div
                          className={`text-[10px] leading-tight mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {item.descripcion}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Banner Informativo de Conexión */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900 hidden lg:block">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                Catálogo Activo
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                67 fichas técnicas cargadas con extracción IA de especificaciones. Base de datos SQLite sincronizada.
              </p>
            </div>
          </aside>

          {/* ÁREA DE CONTENIDO PRINCIPAL DEL MÓDULO */}
          <main className="flex-1 min-w-0 w-full">
            {activeModule === 'dashboard' && (
              <AdminDashboardModule
                productos={productos}
                onNavigateTab={(tab) => setActiveModule(tab as AdminModuleType)}
              />
            )}

            {activeModule === 'catalog' && (
              <AdminCatalogModule
                productos={productos}
                onRefresh={loadProductos}
              />
            )}

            {activeModule === 'batch' && (
              <AdminBatchModule
                productos={productos}
                onRefresh={loadProductos}
              />
            )}

            {activeModule === 'extractor' && (
              <AdminExtractorModule
                existingProducts={productos}
                onProductAdded={() => {
                  loadProductos();
                  setActiveModule('catalog');
                }}
              />
            )}

            {activeModule === 'badges' && (
              <AdminBadgesModule
                productos={productos}
              />
            )}

            {activeModule === 'users' && (
              <AdminUsersModule
                currentUser={currentUser}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
