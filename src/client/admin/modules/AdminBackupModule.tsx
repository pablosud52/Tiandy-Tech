import React, { useState, useEffect, useRef } from 'react';
import { 
  Archive, 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Image as ImageIcon, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Server, 
  HardDrive, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  HelpCircle,
  FileCheck,
  FolderArchive,
  ArrowRight
} from 'lucide-react';

interface BackupStorageStats {
  dbSize: number;
  docsCount: number;
  docsSize: number;
  imagesCount: number;
  imagesSize: number;
  badgesCount: number;
  badgesSize: number;
  totalSize: number;
  totalFiles: number;
  totalProducts: number;
  totalUsers: number;
  countsByType: {
    camaras: number;
    nvrs: number;
    switches: number;
    accesorios: number;
  };
}

interface AdminBackupModuleProps {
  currentUser?: any;
  onRefreshCatalog?: () => void;
}

export const AdminBackupModule: React.FC<AdminBackupModuleProps> = ({
  currentUser,
  onRefreshCatalog
}) => {
  const [stats, setStats] = useState<BackupStorageStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [restoreResult, setRestoreResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tiandy_admin_token') || localStorage.getItem('tiandy_admin_token');
    }
    return null;
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Cargar estadísticas en tiempo real
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/backup/status?_t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err: any) {
      console.error('Error al cargar métricas de respaldo:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 1. Descargar respaldo ZIP completo
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/backup/export?_t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        throw new Error(`Error en la descarga (${res.status}): ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `tiandy-respaldo-completo-${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('✓ Respaldo comprimido generado y descargado con éxito.', 'success');
      fetchStats();
    } catch (err: any) {
      showToast(`Error al exportar respaldo: ${err.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Selección de archivo para restaurar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        showToast('El archivo debe ser un paquete comprimido en formato .zip', 'error');
        return;
      }
      setSelectedFile(file);
      setRestoreResult(null);
    }
  };

  // 3. Ejecutar restauración confirmada
  const executeRestore = async () => {
    if (!selectedFile) return;

    setShowConfirmModal(false);
    setIsRestoring(true);
    setRestoreResult(null);

    const formData = new FormData();
    formData.append('backupFile', selectedFile);

    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fallo desconocido en la restauración.');
      }

      setRestoreResult(data);
      showToast(`✓ ${data.message}`, 'success');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Notificar a toda la app para recargar catálogo
      try {
        const bc = new BroadcastChannel('tiandy_sync');
        bc.postMessage({ type: 'REFRESH_ALL' });
        bc.close();
      } catch {}

      onRefreshCatalog?.();
      fetchStats();
    } catch (err: any) {
      showToast(`Error al restaurar: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notificación */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 border-rose-700 text-rose-100'
              : toastMessage.type === 'info'
              ? 'bg-blue-900 border-blue-700 text-blue-100'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          ) : (
            <Check className="h-4 w-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Banner del Módulo */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-tiandy-50 dark:bg-tiandy-950/60 text-tiandy-700 dark:text-tiandy-300 px-3 py-1 text-xs font-bold border border-tiandy-200 dark:border-tiandy-800 mb-2">
              <Archive className="h-3.5 w-3.5" />
              MIGRACIÓN & RESPALDOS AUTÓNOMOS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestión Integral de Copias de Seguridad
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Exporta o importa el paquete maestro completo (.ZIP) con la base de datos SQLite consolidada, fichas técnicas PDF, fotografías de productos, sellos gráficos y credenciales de acceso. Diseñado para clonar y migrar la plataforma al NAS en 1 clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Refrescar métricas de almacenamiento"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-2xl bg-tiandy-700 hover:bg-tiandy-600 text-white px-5 py-2.5 text-xs font-bold transition shadow-md shadow-tiandy-900/20 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generando ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Exportar Respaldo (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas de Almacenamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Base de Datos SQLite */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Base de Datos</span>
            <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {stats ? formatBytes(stats.dbSize) : '...'}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              SQLite WAL Activo
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            {stats?.totalProducts ?? 0} modelos · {stats?.totalUsers ?? 0} usuarios
          </div>
        </div>

        {/* Fichas Técnicas PDF */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fichas PDF</span>
            <div className="rounded-2xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {stats ? formatBytes(stats.docsSize) : '...'}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
              {stats?.docsCount ?? 0} documentos
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            Directorio <code className="font-mono text-[10px]">data/docs</code>
          </div>
        </div>

        {/* Fotos de Productos */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Imágenes</span>
            <div className="rounded-2xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {stats ? formatBytes(stats.imagesSize) : '...'}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
              {stats?.imagesCount ?? 0} fotos y renders
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            Directorio <code className="font-mono text-[10px]">data/images</code>
          </div>
        </div>

        {/* Distintivos & Sellos */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sellos Gráficos</span>
            <div className="rounded-2xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {stats ? formatBytes(stats.badgesSize) : '...'}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
              {stats?.badgesCount ?? 0} distintivos
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            Directorio <code className="font-mono text-[10px]">data/badges</code>
          </div>
        </div>

        {/* Total Migración */}
        <div className="rounded-3xl border border-emerald-300/80 bg-emerald-50/40 p-5 shadow-xs dark:border-emerald-800/80 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Paquete</span>
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <FolderArchive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-100">
              {stats ? formatBytes(stats.totalSize) : '...'}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
              {stats?.totalFiles ?? 0} archivos en total
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-400">
            Listo para exportar al NAS
          </div>
        </div>
      </div>

      {/* Acciones Principales: Dos Paneles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Exportación Detallada */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exportar Respaldo Completo (.ZIP)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Genera una copia física 100% autónoma de la aplicación
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Al exportar, el servidor consolida la base de datos SQLite (ejecutando un checkpoint de transacciones WAL) y empaqueta en un solo archivo comprimido:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Base de datos SQLite:</strong> Todos los modelos, precios en USD, inventario, variantes técnicas, usuarios y hashes de acceso.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Fichas Técnicas PDF:</strong> Los 60+ documentos PDF originales subidos y procesados.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Fotografías & Renders:</strong> Todas las imágenes asignadas a las fichas técnicas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sellos Gráficos & Logos:</strong> Badges personalizados (Color Maker, Nuevo Modelo, etc.).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Manifiesto de Integridad:</strong> Metadatos de fecha, versión y resumen de verificación.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-tiandy-700 hover:bg-tiandy-600 text-white p-3.5 text-xs font-bold transition shadow-sm active:scale-98 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Comprimiendo y preparando descarga...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Descargar Respaldo ({stats ? formatBytes(stats.totalSize) : 'ZIP'})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Restauración en el NAS / Nuevo Servidor */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Restaurar Respaldo (.ZIP)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Importa el paquete en este entorno o en el nuevo contenedor NAS
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Selecciona o arrastra el archivo <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.zip</code> generado previamente para restaurar el catálogo completo.
            </p>

            {/* Zona de Arrastre / Carga */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200 hover:border-tiandy-500 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Tamaño: {formatBytes(selectedFile.size)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Click para cambiar de archivo
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Haz click o arrastra tu archivo .zip aquí
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Soporta paquetes de respaldo completos de hasta 300 MB
                  </div>
                </div>
              )}
            </div>

            {/* Aviso de Seguridad */}
            <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Precaución de migración:</strong> La restauración reemplazará la base de datos actual con los datos del respaldo. El servidor creará automáticamente una copia preventiva local antes de procesarlo.
              </div>
            </div>

            {/* Resultado de Restauración */}
            {restoreResult && (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Restauración completada con éxito
                </div>
                <div className="text-[11px]">
                  {restoreResult.message}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedFile || isRestoring}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white p-3.5 text-xs font-bold transition shadow-sm active:scale-98 disabled:opacity-50"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Restaurando y reabriendo base de datos...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Restaurar Archivo Seleccionado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Guía Paso a Paso para Despliegue en el NAS */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-2 text-sm">
          <Server className="h-4 w-4 text-tiandy-700 dark:text-tiandy-400" />
          Guía de Despliegue y Migración al NAS (Synology, QNAP o Docker)
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Sigue estos pasos sencillos para migrar el sistema desde tu entorno de desarrollo al contenedor definitivo en el NAS:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-tiandy-100 text-tiandy-800 dark:bg-tiandy-950 dark:text-tiandy-300 font-bold text-xs flex items-center justify-center mb-2">
              1
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Exportar el ZIP
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Presiona <strong>Exportar Respaldo (.ZIP)</strong> en este panel para guardar todo el contenido consolidado.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-tiandy-100 text-tiandy-800 dark:bg-tiandy-950 dark:text-tiandy-300 font-bold text-xs flex items-center justify-center mb-2">
              2
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Iniciar en el NAS
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inicia el contenedor en el NAS con <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">docker compose up -d</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-tiandy-100 text-tiandy-800 dark:bg-tiandy-950 dark:text-tiandy-300 font-bold text-xs flex items-center justify-center mb-2">
              3
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Abrir Panel del NAS
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Accede a la IP de tu NAS en el navegador e ingresa al módulo de <strong>Respaldos y Migración</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-tiandy-100 text-tiandy-800 dark:bg-tiandy-950 dark:text-tiandy-300 font-bold text-xs flex items-center justify-center mb-2">
              4
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Restaurar y Listo
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sube el archivo <code className="font-mono text-[10px]">.zip</code>. El panel importará todo y quedará 100% operativo de inmediato.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Restauración */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Confirmar Restauración Total?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operación destructiva de reemplazo
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Estás a punto de restaurar el archivo <strong>{selectedFile?.name}</strong>. Esta acción reemplazará la base de datos actual y sincronizará todos los archivos multimedia.
            </p>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Seguridad garantizada:
              </div>
              <div>
                El sistema creará una copia preventiva local antes de procesar el archivo.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeRestore}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md active:scale-95"
              >
                Sí, Confirmar y Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};