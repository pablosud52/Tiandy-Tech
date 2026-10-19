import React, { useState } from 'react';
import { 
  CloudUpload, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ExternalLink, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  totalProducts: number;
}

interface PublishResponse {
  success: boolean;
  message: string;
  timestamp: string;
  stats?: {
    productos: number;
    badges: number;
  };
  cloudflareStatus?: 'deployed' | 'built_only' | 'error';
  cloudflareDetails?: string;
  missingEnv?: string[];
  deploymentUrl?: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  totalProducts
}) => {
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [result, setResult] = useState<PublishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        }
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Error al ejecutar la publicación');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al publicar');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tiandy-100 dark:bg-tiandy-950/80 text-tiandy-700 dark:text-tiandy-400 flex items-center justify-center">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Publicar Catálogo en Cloudflare
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronización y despliegue del catálogo técnico en la web pública
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Card de Garantía de Aislamiento y Privacidad */}
          <div className="rounded-xl p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-tiandy-700 dark:text-tiandy-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-bold block text-tiandy-950 dark:text-tiandy-100">
                Aislamiento Total del Panel de Control
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Esta acción compila y publica <strong>únicamente la vista web del catálogo</strong>. El botón <strong>"Panel AD"</strong>, las rutas de administración, contraseñas y la base de datos interna SQLite quedan <strong>estrictamente excluidas</strong> del código público.
              </p>
            </div>
          </div>

          {/* Resumen de elementos a publicar */}
          {!result && !error && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Resumen de actualización:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Modelos activos:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">{totalProducts}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Precios y Stock:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Actualizados</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Al confirmar, se generará una compilación optimizada para el CDN global de Cloudflare Pages con carga ultra-rápida.
              </p>
            </div>
          )}

          {/* Estado de Progreso durante la publicación */}
          {isPublishing && (
            <div className="p-5 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-tiandy-400 animate-spin" />
              <div className="text-center space-y-1">
                <div className="text-sm font-bold">Procesando y publicando catálogo...</div>
                <div className="text-xs text-slate-400">
                  Generando snapshot de datos, compilando frontend público y empaquetando para Cloudflare Pages.
                </div>
              </div>
            </div>
          )}

          {/* Resultado exitoso */}
          {result && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                result.cloudflareStatus === 'deployed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm">
                    {result.message}
                  </div>
                  <p className="opacity-90">{result.cloudflareDetails}</p>
                  {result.deploymentUrl && (
                    <a
                      href={result.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-tiandy-700 dark:text-tiandy-300 font-bold hover:underline"
                    >
                      <span>Ver web en vivo ({result.deploymentUrl})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Guía informativa si faltan credenciales en .env */}
              {result.missingEnv && result.missingEnv.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <HelpCircle className="w-4 h-4 text-tiandy-600" />
                    <span>Para activar el despliegue automático con 1 clic:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Agrega estas líneas a tu archivo <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">.env</code> en el servidor/NAS:
                  </p>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <code>CLOUDFLARE_PROJECT_NAME="tiandy-tech"</code>
                      <button
                        onClick={() => handleCopy('CLOUDFLARE_PROJECT_NAME="tiandy-tech"', 'project')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Copiar"
                      >
                        {copiedKey === 'project' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code>CLOUDFLARE_API_TOKEN="tu_token_de_cloudflare"</code>
                      <button
                        onClick={() => handleCopy('CLOUDFLARE_API_TOKEN=""', 'token')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400"
                        title="Copiar"
                      >
                        {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Los archivos listos para subir manualmente ya se encuentran compilados en la carpeta <code className="font-mono">dist/public</code>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold block">No se pudo completar la publicación</span>
                <p className="text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Botones de Confirmación y Cancelación */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-tiandy-700 hover:bg-tiandy-600 active:scale-98 rounded-xl shadow-md shadow-tiandy-700/20 transition-all disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Aceptar y Publicar Ahora</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
