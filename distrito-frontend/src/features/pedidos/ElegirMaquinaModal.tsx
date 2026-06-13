import { useMaquinas } from "../maquinas/useMaquinas";
import { useCambiarEstado } from "./useCambiarEstado";
import type { TipoMaquina } from "../../types/maquina";
import type { EstadoPedido, PedidoResponse } from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  siguiente: EstadoPedido;
  tipo: TipoMaquina;
  onClose: () => void;
  onAvanzado: () => void;
}

export function ElegirMaquinaModal({ pedido, siguiente, tipo, onClose, onAvanzado }: Props) {
  const { data: maquinas, isLoading } = useMaquinas();
  const cambiar = useCambiarEstado();

  const candidatas = (maquinas ?? []).filter((m) => m.tipo === tipo);

  const elegir = async (maquinaId: number) => {
    try {
      await cambiar.mutateAsync({
        pedidoId: pedido.id,
        nuevoEstado: siguiente,
        maquinaId,
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

        <div className="p-6 space-y-3">
          {isLoading && <p className="text-xs text-stone-500">Cargando máquinas...</p>}

          <div className="grid grid-cols-3 gap-3">
            {candidatas.map((m) => {
              const libre = m.estado === "LIBRE";
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => libre && elegir(m.id)}
                  disabled={!libre || cambiar.isPending}
                  className={`border rounded-xl py-4 text-center transition ${
                    libre
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
                  <p className="text-xs uppercase tracking-wide">{tipo === "LAVADORA" ? "Lav" : "Sec"}</p>
                  <p className="text-2xl font-medium">{m.numero}</p>
                  <p className="text-[10px] mt-1">
                    {libre ? "Libre" : m.estado === "OCUPADA" ? m.pedido?.codigoQr ?? "Ocupada" : "Mant."}
                  </p>
                </button>
              );
            })}
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
