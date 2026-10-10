import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  User, 
  Clock, 
  Mail,
  Shield
} from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  nombre: string;
  email: string | null;
  rol: 'SUPERADMIN' | 'ADMIN' | string;
  activo: boolean;
  ultimo_login: string | null;
  created_at?: string;
}

interface AdminUsersModuleProps {
  currentUser: any;
}

export const AdminUsersModule: React.FC<AdminUsersModuleProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal Crear Usuario
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Editar Usuario / Reset Password
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<string>('ADMIN');

  const token = localStorage.getItem('tiandy_admin_token') || '';

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || 'Error al cargar usuarios.');
      }
    } catch (err: any) {
      setError(`Error de comunicación: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Crear Usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      setError('Usuario, contraseña y nombre son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          nombre: newName.trim(),
          email: newEmail.trim() || undefined,
          rol: newRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(`Usuario ${newUsername} creado con éxito.`);
        setIsCreateModalOpen(false);
        setNewUsername('');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('ADMIN');
        loadUsers();
      } else {
        setError(data.error || 'No se pudo crear el usuario.');
      }
    } catch (err: any) {
      setError(`Error al crear usuario: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar Edición
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: editName.trim(),
          email: editEmail.trim() || null,
          rol: editRole,
          password: editPassword.trim() ? editPassword.trim() : undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(`Usuario ${editingUser.username} actualizado con éxito.`);
        setEditingUser(null);
        setEditPassword('');
        loadUsers();
      } else {
        setError(data.error || 'No se pudo actualizar el usuario.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar Usuario
  const handleDeleteUser = async (userToDelete: AdminUser) => {
    if (userToDelete.id === currentUser?.id) {
      alert('No puedes eliminar tu propia cuenta activa de administrador.');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario administrador "${userToDelete.username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(`Usuario ${userToDelete.username} eliminado.`);
        loadUsers();
      } else {
        setError(data.error || 'Error al eliminar usuario.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            Control de Acceso y Operadores
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Usuarios Administradores ({users.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestiona permisos, añade operadores técnicos y administra credenciales seguras cifradas con Scrypt.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
        >
          <UserPlus className="h-4 w-4" />
          Añadir Nuevo Administrador
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-3">Nombre Completo</th>
                  <th className="py-3.5 px-3">Email</th>
                  <th className="py-3.5 px-3">Rol / Nivel</th>
                  <th className="py-3.5 px-3">Último Acceso</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Usuario */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {u.username}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Tu Sesión
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nombre */}
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {u.nombre}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {u.email || <span className="italic text-slate-400">Sin email</span>}
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          u.rol === 'SUPERADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}>
                          <Shield className="h-3 w-3" />
                          {u.rol}
                        </span>
                      </td>

                      {/* Último Login */}
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-ES') : 'Primer ingreso pendiente'}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditName(u.nombre);
                              setEditEmail(u.email || '');
                              setEditRole(u.rol);
                              setEditPassword('');
                            }}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Editar usuario o contraseña"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR USUARIO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nuevo Usuario Administrador
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de Usuario (Login)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  placeholder="ej. operador1"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="ej. Juan Pérez"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña de Acceso
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ej. operador@empresa.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Rol y Privilegios
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ADMIN">ADMIN (Operador de catálogo y precios)</option>
                  <option value="SUPERADMIN">SUPERADMIN (Acceso total y control de usuarios)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Crear Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Editar Administrador: {editingUser.username}
              </h3>
              <button onClick={() => setEditingUser(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Cambiar Contraseña (dejar vacío para mantener actual)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nueva contraseña..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Rol y Privilegios
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
