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
