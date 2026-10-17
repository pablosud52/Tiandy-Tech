import React, { useState, useEffect } from 'react';
import { Producto } from '../../../shared/types.js';
import { 
  BarChart3, 
  Cctv, 
  HardDrive, 
  Network, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  FileSpreadsheet, 
  UploadCloud, 
  Users, 
  Server, 
  Database, 
  DollarSign,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface AdminDashboardModuleProps {
  productos: Producto[];
  onNavigateTab: (tab: 'catalog' | 'batch' | 'extractor' | 'badges' | 'users') => void;
}

export const AdminDashboardModule: React.FC<AdminDashboardModuleProps> = ({
  productos,
  onNavigateTab
}) => {
  const total = productos.length;
  const camaras = productos.filter((p) => p.tipo_dispositivo === 'CAMARA').length;
  const nvrs = productos.filter((p) => p.tipo_dispositivo === 'NVR').length;
  const switches = productos.filter((p) => p.tipo_dispositivo === 'SWITCH').length;

  const stockInmediato = productos.filter((p) => p.estado_stock === 'ENTREGA_INMEDIATA').length;
  const pocasUnidades = productos.filter((p) => p.estado_stock === 'POCAS_UNIDADES' || p.estado_stock === 'ULTIMA_UNIDAD').length;
  const proximoArribo = productos.filter((p) => p.estado_stock === 'PROXIMO_ARRIBO').length;
  const agotados = productos.filter((p) => p.estado_stock === 'AGOTADO').length;
  const sinPrecio = productos.filter((p) => !p.precio_usd || p.precio_usd <= 0).length;

  // Estado del almacenamiento de adjuntos y huérfanos
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [storageToast, setStorageToast] = useState<string | null>(null);

  const fetchStorageStatus = async () => {
    try {
      const res = await fetch('/api/storage/status');
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStorageStatus();
  }, []);

  const handleCleanStorage = async () => {
    if (!window.confirm('¿Deseas eliminar definitivamente todos los PDFs, imágenes y archivos temporales huérfanos sin producto asignado?')) {
      return;
    }
    setIsCleaningStorage(true);
    try {
      const res = await fetch('/api/storage/clean', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const mb = (data.totalBytesFreed / (1024 * 1024)).toFixed(2);
        setStorageToast(`✓ Limpieza exitosa: ${data.totalFilesDeleted} archivos huérfanos eliminados (${mb} MB liberados).`);
        fetchStorageStatus();
        setTimeout(() => setStorageToast(null), 5000);
      }
    } catch (err: any) {
      setStorageToast(`Error: ${err.message}`);
    } finally {
      setIsCleaningStorage(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(productos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tiandy-catalogo-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Saludo y Resumen Ejecutivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-emerald-950/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-200" />
            PANEL DE CONTROL GENERAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Resumen del Catálogo Técnico
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Visualización en tiempo real del inventario, estado de stock, tecnologías detectadas y métricas del sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50 active:scale-95 transition-all shadow-md"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            Exportar JSON
          </button>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500/30 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500/40 active:scale-95 transition-all backdrop-blur-md"
          >
            <UploadCloud className="h-4 w-4" />
            Nuevo Datasheet
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Productos */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="cursor-pointer group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Modelos</span>
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{total}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">modelos activos</span>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
            Ver catálogo completo <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Cámaras IP */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="cursor-pointer group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cámaras IP</span>
            <div className="rounded-2xl bg-sky-50 p-2.5 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Cctv className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{camaras}</span>
            <span className="text-xs font-semibold text-slate-400">({total > 0 ? Math.round((camaras / total) * 100) : 0}%)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Series AK, Spark, Lite, Pro, Ultra
          </div>
        </div>

        {/* NVRs */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="cursor-pointer group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Grabadores NVR</span>
            <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{nvrs}</span>
            <span className="text-xs font-semibold text-slate-400">({total > 0 ? Math.round((nvrs / total) * 100) : 0}%)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            De 5ch a 80ch • Hasta 8 Bahías
          </div>
        </div>

        {/* Switches PoE */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="cursor-pointer group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Switches PoE</span>
            <div className="rounded-2xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Network className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{switches}</span>
            <span className="text-xs font-semibold text-slate-400">({total > 0 ? Math.round((switches / total) * 100) : 0}%)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            CCTV Extend 250m • Watchdog PoE
          </div>
        </div>
      </div>

      {/* Fila 2: Salud del Stock y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose de Stock */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Distribución y Estado de Disponibilidad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumen de inventario para cálculo de cotizaciones inmediatas.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <DollarSign className="h-4 w-4" />
              Modificar Precios
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Entrega Inmediata
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200">
                {stockInmediato}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Stock asegurado
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-4 w-4" />
                Pocas Unidades
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-amber-900 dark:text-amber-200">
                {pocasUnidades}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                Stock crítico
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-bold">
                <Clock className="h-4 w-4" />
                Próximo Arribo
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-blue-900 dark:text-blue-200">
                {proximoArribo}
              </div>
              <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">
                En tránsito / aduana
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-bold">
                <XCircle className="h-4 w-4" />
                Agotados
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-rose-900 dark:text-rose-200">
                {agotados}
              </div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                Requiere pedido
              </div>
            </div>
          </div>

          {sinPrecio > 0 && (
            <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Hay <strong>{sinPrecio} productos</strong> sin precio USD configurado en el catálogo.
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('batch')}
                className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100"
              >
                Completar precios →
              </button>
            </div>
          )}
        </div>

        {/* Panel de Infraestructura & Estado Técnico */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-600" />
              Estado del Servidor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Información de despliegue y persistencia.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Base de Datos:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  SQLite WAL (tiandy.db)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Puerto Actual PC:</span>
                <span className="font-bold text-slate-900 dark:text-white">8090</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Puerto NAS Docker:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">1030 (Compose)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Seguridad:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Sesiones Scrypt Activas</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('users')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors"
            >
              <Users className="h-4 w-4 text-slate-500" />
              Administrar Cuentas y Accesos
            </button>
          </div>
        </div>
      </div>

      {/* FILA 3: Gestión de Archivos Adjuntos y Almacenamiento Huérfano */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="h-4 w-4" />
              Mantenimiento de Almacenamiento
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Archivos Adjuntos (PDFs, Imágenes y Temporales)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control de integridad: detecta y elimina archivos huérfanos que ya no pertenecen a ningún producto activo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {storageStatus && storageStatus.totalOrphanedCount > 0 ? (
              <button
                onClick={handleCleanStorage}
                disabled={isCleaningStorage}
                className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-rose-900/20 active:scale-95 disabled:opacity-50"
              >
                {isCleaningStorage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>
                  {isCleaningStorage
                    ? 'Limpiando...'
                    : `Limpiar ${storageStatus.totalOrphanedCount} Archivos Huérfanos (${(storageStatus.totalOrphanedBytes / (1024 * 1024)).toFixed(2)} MB)`}
                </span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Almacenamiento 100% Optimizado
              </div>
            )}
          </div>
        </div>

        {storageStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta PDFs en data/docs */}
            <div className={`p-4 rounded-2xl border transition-all ${
              storageStatus.docs.orphanedFiles > 0 
                ? 'bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40' 
                : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <FileText className="h-4 w-4 text-tiandy-600" />
                  Datasheets PDF (`data/docs`)
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {storageStatus.docs.totalFiles} archivos
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Espacio total:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {(storageStatus.docs.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">PDFs huérfanos:</span>
                <span className={`font-mono font-bold ${
                  storageStatus.docs.orphanedFiles > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                }`}>
                  {storageStatus.docs.orphanedFiles} ({(storageStatus.docs.orphanedSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>

            {/* Tarjeta Imágenes en data/images */}
            <div className={`p-4 rounded-2xl border transition-all ${
              storageStatus.images.orphanedFiles > 0 
                ? 'bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40' 
                : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  Imágenes Catálogo (`data/images`)
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {storageStatus.images.totalFiles} archivos
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Espacio total:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {(storageStatus.images.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Imágenes huérfanas:</span>
                <span className={`font-mono font-bold ${
                  storageStatus.images.orphanedFiles > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                }`}>
                  {storageStatus.images.orphanedFiles} ({(storageStatus.images.orphanedSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>

            {/* Tarjeta Uploads residuales */}
            <div className={`p-4 rounded-2xl border transition-all ${
              storageStatus.uploads.orphanedFiles > 0 
                ? 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40' 
                : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <UploadCloud className="h-4 w-4 text-purple-600" />
                  Temporales (`data/uploads`)
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {storageStatus.uploads.totalFiles} archivos
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Espacio residual:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {(storageStatus.uploads.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Estado:</span>
                <span className={`font-mono font-bold ${
                  storageStatus.uploads.orphanedFiles > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                }`}>
                  {storageStatus.uploads.orphanedFiles > 0 ? `${storageStatus.uploads.orphanedFiles} residuales` : 'Limpio'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notificación de Almacenamiento */}
      {storageToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{storageToast}</span>
        </div>
      )}
    </div>
  );
};
