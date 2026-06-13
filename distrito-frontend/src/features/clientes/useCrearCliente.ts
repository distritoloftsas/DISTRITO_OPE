import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { ClienteResponse } from "../../types/cliente";

interface CrearClientePayload {
  nombre: string;
  telefono: string;
  email?: string;
  direccionPrincipal?: string;
}

export function useCrearCliente() {
  return useMutation({
    mutationFn: async (payload: CrearClientePayload) => {
      const { data } = await api.post<ClienteResponse>("/clientes", payload);
      return data;
    },
  });
}
