import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { ClienteResponse } from "../../types/cliente";

export function useListarClientes(q: string) {
  return useQuery({
    queryKey: ["clientes", "listar", q],
    queryFn: async () => {
      const { data } = await api.get<ClienteResponse[]>("/clientes", {
        params: q.trim() ? { q: q.trim() } : undefined,
      });
      return data;
    },
    staleTime: 1000 * 30,
  });
}

export function useConteoClientes() {
  return useQuery({
    queryKey: ["clientes", "conteo"],
    queryFn: async () => {
      const { data } = await api.get<{ total: number }>("/clientes/conteo");
      return data.total;
    },
  });
}

export interface ActualizarClientePayload {
  nombre: string;
  telefono: string;
  email?: string | null;
  direccionPrincipal?: string | null;
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ActualizarClientePayload }) => {
      const { data } = await api.patch<ClienteResponse>(`/clientes/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

export interface ActivarCuentaPayload {
  email: string;
  password: string;
}

export function useActivarCuentaCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ActivarCuentaPayload }) => {
      const { data } = await api.post<ClienteResponse>(`/clientes/${id}/cuenta`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}
