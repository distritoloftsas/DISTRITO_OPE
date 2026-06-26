import { useState } from "react";
import { useCambiarEstado } from "./useCambiarEstado";
import { useEscape } from "../../lib/useEscape";
import type { PedidoResponse } from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  onClose: () => void;
  onCancelado: () => void;
}

export function CancelarModal({ pedido, onClose, onCancelado }: Props) {
  useEscape(onClose);
  const [motivo, setMotivo] = useState("");
  const cambiar = useCambiarEstado();

  const submit = async () => {
    if (!motivo.trim()) return;
    try {
      await cambiar.mutateAsync({
        pedidoId: pedido.id,
        nuevoEstado: "CANCELADO",
        observacion: motivo,
      });
      onCancelado();
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(cambiar.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-base font-medium">Cancelar pedido</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {pedido.codigoQr} · {pedido.cliente.nombre}
          </p>
        </header>

        <div className="p-6 space-y-3">
          <p className="text-sm text-stone-700">
            ¿Por qué se está cancelando este pedido?
          </p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo obligatorio..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
          />

          {errorMsg && (
            <p className="text-xs text-red-600">{errorMsg}</p>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            No cancelar
          </button>
          <button
            onClick={submit}
            disabled={!motivo.trim() || cambiar.isPending}
            className="flex-[2] bg-red-700 text-white text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {cambiar.isPending ? "Cancelando..." : "Cancelar pedido"}
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
