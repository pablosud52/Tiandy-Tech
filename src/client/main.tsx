import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('tiandy_cotizacion');
      localStorage.removeItem('tiandy_admin_token');
      localStorage.removeItem('tiandy_admin_user');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 text-3xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Se produjo un error al cargar la interfaz
            </h1>
            <p className="text-sm text-slate-400 mb-4">
              La plataforma interceptó un error de ejecución en el navegador.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 rounded-xl p-3 text-left font-mono text-xs text-rose-300 border border-rose-900/50 mb-6 overflow-x-auto max-h-36">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-tiandy-600 hover:bg-tiandy-500 text-white font-semibold text-xs transition"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition"
              >
                Limpiar datos locales y reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
