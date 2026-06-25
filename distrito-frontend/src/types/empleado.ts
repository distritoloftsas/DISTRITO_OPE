import type { RolUsuario } from "./auth";
import type { Permiso } from "./permiso";

export interface EmpleadoResponse {
  id: number;
  email: string;
  nombre: string;
  telefono: string | null;
  rol: RolUsuario;
  activo: boolean;
  mustChangePassword: boolean;
  sede: { id: number; nombre: string } | null;
  cargo: string | null;
  ultimoLogin: string | null;
  creadoEn: string;
  permisos: Permiso[];
}
