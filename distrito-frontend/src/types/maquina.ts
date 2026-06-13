export type TipoMaquina = "LAVADORA" | "SECADORA";
export type EstadoMaquina = "LIBRE" | "OCUPADA" | "MANTENIMIENTO";

export interface MaquinaResponse {
  id: number;
  tipo: TipoMaquina;
  numero: number;
  estado: EstadoMaquina;
  pedido: { id: number; codigoQr: string; cliente: string } | null;
}

export function tipoParaSiguienteEstado(estado: string): TipoMaquina | null {
  if (estado === "LAVANDO") return "LAVADORA";
  if (estado === "SECANDO") return "SECADORA";
  return null;
}
