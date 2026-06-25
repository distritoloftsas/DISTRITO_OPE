import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { MetodoPago } from "../../types/pedido";

interface Payload {
  pedidoId: number;
  metodo: MetodoPago;
  monto: number;
  referencia?: string;
}

export interface PagoResponse {
  id: number;
  pedidoId: number;
  metodo: MetodoPago;
  monto: number;
  referencia: string | null;
  fecha: string;
  empleadoNombre: string | null;
}

export function useRegistrarPago() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ pedidoId, metodo, monto, referencia }: Payload) => {
      const { data } = await api.post<PagoResponse>(`/pedidos/${pedidoId}/pagos`, {
        metodo,
        monto,
        referencia,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pedidos"] }),
  });
}
