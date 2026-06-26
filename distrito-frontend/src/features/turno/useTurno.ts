import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { notify, mensajeDeError } from "../../lib/notify";

export interface GastoResponse {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  empleadoNombre: string | null;
}

export interface TurnoResponse {
  id: number;
  sedeId: number;
  sedeNombre: string;
  empleadoId: number;
  empleadoNombre: string;
  fechaApertura: string;
  efectivoApertura: number;
  fechaCierre: string | null;
  efectivoCierreDeclarado: number | null;
  efectivoEsperado: number | null;
  diferencia: number | null;
  observaciones: string | null;
  efectivoCobradoEnTurno: number;
  totalGastosEnTurno: number;
  gastos: GastoResponse[];
}

export function useTurnoActual() {
  return useQuery({
    queryKey: ["turno", "actual"],
    queryFn: async () => {
      const res = await api.get<TurnoResponse | "">("/turnos/actual", {
        validateStatus: (s) => s === 200 || s === 204,
      });
      if (res.status === 204) return null;
      return res.data as TurnoResponse;
    },
    refetchInterval: 1000 * 60,
  });
}

export function useAbrirTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (efectivoApertura: number) => {
      const { data } = await api.post<TurnoResponse>("/turnos", { efectivoApertura });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turno"] });
      notify.exito("Turno abierto. ¡Buena jornada!");
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudo abrir el turno.")),
  });
}

export function useCerrarTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: number;
      efectivoCierreDeclarado: number;
      observaciones?: string;
    }) => {
      const { data } = await api.patch<TurnoResponse>(`/turnos/${vars.id}/cerrar`, {
        efectivoCierreDeclarado: vars.efectivoCierreDeclarado,
        observaciones: vars.observaciones,
      });
      return data;
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["turno"] });
      const dif = Number(t.diferencia ?? 0);
      if (Math.abs(dif) < 1) notify.exito("Turno cerrado. La caja cuadra.");
      else if (dif < 0) notify.error(`Turno cerrado con faltante de $${Math.abs(dif).toLocaleString("es-CO")}.`);
      else notify.info(`Turno cerrado con sobrante de $${dif.toLocaleString("es-CO")}.`);
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudo cerrar el turno.")),
  });
}

export function useRegistrarGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { turnoId: number; concepto: string; monto: number }) => {
      const { data } = await api.post<GastoResponse>(`/turnos/${vars.turnoId}/gastos`, {
        concepto: vars.concepto,
        monto: vars.monto,
      });
      return data;
    },
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["turno"] });
      notify.exito(`Gasto registrado: ${g.concepto} - $${g.monto.toLocaleString("es-CO")}.`);
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudo registrar el gasto.")),
  });
}
