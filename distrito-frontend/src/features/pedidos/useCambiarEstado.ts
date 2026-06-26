import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { notify, mensajeDeError } from "../../lib/notify";
import { etiquetaEstado, type EstadoPedido, type PedidoResponse, type TipoCicloLavadora } from "../../types/pedido";

interface Payload {
  pedidoId: number;
  nuevoEstado: EstadoPedido;
  observacion?: string;
  maquinaId?: number;
  tipoCicloLavadora?: TipoCicloLavadora;
}

export function useCambiarEstado() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pedidoId,
      nuevoEstado,
      observacion,
      maquinaId,
      tipoCicloLavadora,
    }: Payload) => {
      const { data } = await api.patch<PedidoResponse>(`/pedidos/${pedidoId}/estado`, {
        nuevoEstado,
        observacion,
        maquinaId,
        tipoCicloLavadora,
      });
      return data;
    },
    onSuccess: (pedido) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["maquinas"] });
      notify.exito(
        `${pedido.codigoQr} ahora está en ${etiquetaEstado(pedido.estado)}.`,
        "Estado actualizado"
      );
    },
    onError: (err) => {
      notify.error(mensajeDeError(err, "No se pudo cambiar el estado del pedido."));
    },
  });
}
