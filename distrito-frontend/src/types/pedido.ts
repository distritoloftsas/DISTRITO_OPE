export type EstadoPedido =
  | "RECIBIDO"
  | "LAVANDO"
  | "SECANDO"
  | "DOBLANDO"
  | "LISTO"
  | "ENTREGADO"
  | "CANCELADO";

export interface PedidoResponse {
  id: number;
  codigoQr: string;
  cliente: { id: number; nombre: string; telefono: string | null };
  sede: { id: number; nombre: string };
  plan: { id: number; nombre: string; precio: number };
  estado: EstadoPedido;
  total: number;
  observaciones: string | null;
  fechaRecepcion: string;
  fechaEntregaEstimada: string | null;
  fechaEntregaReal: string | null;
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
