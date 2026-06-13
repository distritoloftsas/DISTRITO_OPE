export interface ClienteResponse {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  direccionPrincipal: string | null;
  lavadosAcumulados: number;
  conPortal: boolean;
}
