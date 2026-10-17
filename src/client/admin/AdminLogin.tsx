import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  onBackToCatalog: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToCatalog }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('tiandy_admin_token', data.token);
        sessionStorage.setItem('tiandy_admin_user', JSON.stringify(data.user));
        localStorage.removeItem('tiandy_admin_token');
        localStorage.removeItem('tiandy_admin_user');
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
    } catch (err: any) {
      setError(`Error de comunicación con el servidor: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultCredentials = () => {
    setUsername('admin');
    setPassword('admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Contenedor */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-slate-900/90 transition-all">
          {/* Header Superior con Gradiente Tiandy */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-8 py-8 text-white relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              SISTEMA DE GESTIÓN BACKOFFICE
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Tiandy Tech
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/40 text-emerald-100 border border-emerald-400/30">
                ADMIN
              </span>
            </h1>
            <p className="mt-1 text-xs text-emerald-100/90 leading-relaxed">
              Ingreso restringido para administradores y operadores autorizados del catálogo.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Usuario */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Usuario
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Ingresar al Backoffice
                </>
              )}
            </button>

            {/* Ayudante de credenciales para evaluación local */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Credenciales iniciales:
                </span>
                <button
                  type="button"
                  onClick={handleUseDefaultCredentials}
                  className="text-[11px] font-bold text-emerald-700 underline dark:text-emerald-300 hover:text-emerald-800"
                >
                  Autocompletar
                </button>
              </div>
              <div className="mt-1 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                Usuario: <span className="font-bold">admin</span> | Clave: <span className="font-bold">admin</span>
              </div>
            </div>

            {/* Volver al Catálogo Público */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al Catálogo Público
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
