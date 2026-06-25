import { useState } from "react";
import { useMaquinas } from "../maquinas/useMaquinas";
import { useCambiarEstado } from "./useCambiarEstado";
import { useEscape } from "../../lib/useEscape";
import type { TipoMaquina } from "../../types/maquina";
import {
  DURACION_CICLO,
  ETIQUETA_CICLO,
  type EstadoPedido,
  type PedidoResponse,
  type TipoCicloLavadora,
} from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  siguiente: EstadoPedido;
  tipo: TipoMaquina;
  onClose: () => void;
  onAvanzado: () => void;
}

const CICLOS: TipoCicloLavadora[] = ["SENCILLO", "INTERMEDIO", "DELUXE"];

export function ElegirMaquinaModal({ pedido, siguiente, tipo, onClose, onAvanzado }: Props) {
  useEscape(onClose);
  const { data: maquinas, isLoading } = useMaquinas();
  const cambiar = useCambiarEstado();

  const pedirCiclo = tipo === "LAVADORA" && siguiente === "LAVANDO";
  const [ciclo, setCiclo] = useState<TipoCicloLavadora | null>(null);

  const candidatas = (maquinas ?? []).filter((m) => m.tipo === tipo);

  const elegir = async (maquinaId: number) => {
    if (pedirCiclo && !ciclo) return;
    try {
      await cambiar.mutateAsync({
        pedidoId: pedido.id,
        nuevoEstado: siguiente,
        maquinaId,
        tipoCicloLavadora: pedirCiclo ? (ciclo ?? undefined) : undefined,
      });
      onAvanzado();
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(cambiar.error);
  const etiquetaTipo = tipo === "LAVADORA" ? "lavadora" : "secadora";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-base font-medium">Elegir {etiquetaTipo}</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {pedido.codigoQr} · {pedido.cliente.nombre}
          </p>
        </header>

        <div className="p-6 space-y-4">
          {pedirCiclo && (
            <div>
              <p className="text-xs text-stone-600 mb-2">Tipo de ciclo:</p>
              <div className="grid grid-cols-3 gap-2">
                {CICLOS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCiclo(c)}
                    className={`border rounded-lg py-2 text-center transition ${
                      ciclo === c
                        ? "border-distrito-gold-dark bg-distrito-cream font-medium"
                        : "border-stone-300 hover:border-distrito-gold-dark"
                    }`}
                  >
                    <p className="text-xs">{ETIQUETA_CICLO[c]}</p>
                    <p className="text-[10px] text-stone-500">{DURACION_CICLO[c]} min</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && <p className="text-xs text-stone-500">Cargando máquinas...</p>}

          <div>
            {pedirCiclo && (
              <p className="text-xs text-stone-600 mb-2">
                {ciclo ? "Elige la máquina:" : "Primero elige un ciclo."}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {candidatas.map((m) => {
                const libre = m.estado === "LIBRE";
                const disabled = !libre || cambiar.isPending || (pedirCiclo && !ciclo);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => libre && elegir(m.id)}
                    disabled={disabled}
                    className={`border rounded-xl py-4 text-center transition ${
                      libre && (!pedirCiclo || ciclo)
                        ? "border-stone-300 hover:border-distrito-gold-dark hover:bg-distrito-cream"
                        : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                    }`}
                    title={
                      !libre && m.pedido
                        ? `Ocupada por ${m.pedido.codigoQr}`
                        : !libre
                        ? m.estado
                        : undefined
                    }
                  >
                    <p className="text-xs uppercase tracking-wide">
                      {tipo === "LAVADORA" ? "Lav" : "Sec"}
                    </p>
                    <p className="text-2xl font-medium">{m.numero}</p>
                    <p className="text-[10px] mt-1">
                      {libre
                        ? "Libre"
                        : m.estado === "OCUPADA"
                        ? m.pedido?.codigoQr ?? "Ocupada"
                        : "Mant."}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {candidatas.length > 0 && candidatas.every((m) => m.estado !== "LIBRE") && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              No hay {etiquetaTipo}s disponibles. Espera a que se libere alguna.
            </p>
          )}

          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
