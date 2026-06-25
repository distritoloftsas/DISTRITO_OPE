import type { Permiso } from "./permiso";

export type RolUsuario = "CLIENTE" | "EMPLEADO" | "GERENTE_SEDE" | "SUPER_ADMIN";

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
  sedeId: number | null;
  sedeNombre: string | null;
  mustChangePassword: boolean;
  activo: boolean;
  permisos?: Permiso[];
}

export function tienePermiso(usuario: Usuario | null, permiso: Permiso): boolean {
  if (!usuario) return false;
  if (usuario.rol === "SUPER_ADMIN") return true; // tiene todo siempre
  return Array.isArray(usuario.permisos) && usuario.permisos.includes(permiso);
}

export interface AuthResponse {
  token: string;
  expiresInMs: number;
  usuario: Usuario;
}

export function rutaInicialPorRol(rol: RolUsuario): string {
  switch (rol) {
    case "CLIENTE":
      return "/cliente";
    case "EMPLEADO":
      return "/empleado";
    case "GERENTE_SEDE":
      return "/gerente";
    case "SUPER_ADMIN":
      return "/admin";
  }
}

export function etiquetaRol(rol: RolUsuario): string {
  switch (rol) {
    case "CLIENTE":
      return "Cliente";
    case "EMPLEADO":
      return "Empleado";
    case "GERENTE_SEDE":
      return "Gerente de sede";
    case "SUPER_ADMIN":
      return "Super Admin";
  }
}
