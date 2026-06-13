export type EstadoPedido =
  | "RECIBIDO"
  | "LAVANDO"
  | "SECANDO"
  | "DOBLANDO"
  | "LISTO"
  | "ENTREGADO"
  | "CANCELADO";

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "DATAFONO";

export interface PedidoResponse {
  id: number;
  codigoQr: string;
  cliente: { id: number; nombre: string; telefono: string | null };
  sede: { id: number; nombre: string };
  plan: {
    id: number;
    nombre: string;
    precio: number;
    incluyeDoblado: boolean;
    incluyeDomicilio: boolean;
  };
  estado: EstadoPedido;
  total: number;
  pagado: boolean;
  observaciones: string | null;
  fechaRecepcion: string;
  fechaEntregaEstimada: string | null;
  fechaEntregaReal: string | null;
  lavadora: MaquinaRefResumen | null;
  secadora: MaquinaRefResumen | null;
}

export interface MaquinaRefResumen {
  id: number;
  tipo: "LAVADORA" | "SECADORA";
  numero: number;
}

export function siguienteEstado(p: PedidoResponse): EstadoPedido | null {
  switch (p.estado) {
    case "RECIBIDO":
      return "LAVANDO";
    case "LAVANDO":
      return "SECANDO";
    case "SECANDO":
      return p.plan.incluyeDoblado ? "DOBLANDO" : "LISTO";
    case "DOBLANDO":
      return "LISTO";
    case "LISTO":
      return "ENTREGADO";
    default:
      return null;
  }
}

export const ESTADOS_KANBAN: EstadoPedido[] = [
  "RECIBIDO",
  "LAVANDO",
  "SECANDO",
  "DOBLANDO",
  "LISTO",
];

export function etiquetaEstado(estado: EstadoPedido): string {
  const labels: Record<EstadoPedido, string> = {
    RECIBIDO: "Recibidos",
    LAVANDO: "Lavando",
    SECANDO: "Secando",
    DOBLANDO: "Doblando",
    LISTO: "Listos",
    ENTREGADO: "Entregados",
    CANCELADO: "Cancelados",
  };
  return labels[estado];
}
