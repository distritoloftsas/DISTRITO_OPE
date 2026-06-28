import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { notify, mensajeDeError } from "../../lib/notify";
import type { PedidoResponse } from "../../types/pedido";

interface CrearPedidoPayload {
  clienteId: number;
  planId: number;
  observaciones?: string;
  fechaEntregaEstimada?: string;
  direccionEntrega?: string;
  costoDomicilio?: number;
}

export function useCrearPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CrearPedidoPayload) => {
      const { data } = await api.post<PedidoResponse>("/pedidos", payload);
      return data;
    },
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      notify.exito(`Pedido ${pedido.codigoQr} creado.`, "Pedido registrado");
    },
    onError: (err) => {
      notify.error(mensajeDeError(err, "No se pudo crear el pedido."));
    },
  });
}
