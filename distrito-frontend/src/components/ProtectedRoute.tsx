import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { rutaInicialPorRol, type RolUsuario } from "../types/auth";

interface Props {
  roles: RolUsuario[];
  children: ReactNode;
}

export function ProtectedRoute({ roles, children }: Props) {
  const token = useAuthStore((s) => s.token);
  const usuario = useAuthStore((s) => s.usuario);
  const { isLoading, isError } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-stone-500">Cargando sesión...</p>
      </div>
    );
  }

  if (isError || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(usuario.rol)) {
    return <Navigate to={rutaInicialPorRol(usuario.rol)} replace />;
  }

  return <>{children}</>;
}
