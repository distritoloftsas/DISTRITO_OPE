import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido, MetodoPago } from "../../types/pedido";

export interface CierreCajaResponse {
  fecha: string;
  sede: { id: number; nombre: string };
  totalIngresos: number;
  totalPagos: number;
  porMetodo: Record<MetodoPago, { cantidad: number; total: number }>;
  pedidosPorEstado: Record<EstadoPedido, number>;
  lavadosEntregados: number;
  pagos: Array<{
    id: number;
    fecha: string;
    metodo: MetodoPago;
    monto: number;
    referencia: string | null;
    empleadoNombre: string | null;
    pedidoCodigo: string;
    clienteNombre: string;
  }>;
}

export function useCierreCaja(fecha: string) {
  return useQuery({
    queryKey: ["cierre-caja", fecha],
    queryFn: async () => {
      const { data } = await api.get<CierreCajaResponse>("/reportes/cierre-caja", {
        params: { fecha },
      });
      return data;
    },
  });
}
