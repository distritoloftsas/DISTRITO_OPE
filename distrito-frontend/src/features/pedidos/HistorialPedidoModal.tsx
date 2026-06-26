import { useHistorialPedido, type HistorialEvento } from "./useHistorial";
import { etiquetaEstado, type EstadoPedido, type PedidoResponse } from "../../types/pedido";
import { useEscape } from "../../lib/useEscape";

interface Props {
  pedido: PedidoResponse;
  onClose: () => void;
}

const COLOR_DOT: Record<EstadoPedido, string> = {
  RECIBIDO: "bg-pink-400",
  LAVANDO: "bg-blue-400",
  SECANDO: "bg-amber-400",
  DOBLANDO: "bg-purple-400",
  LISTO: "bg-green-500",
  ENTREGADO: "bg-stone-600",
  CANCELADO: "bg-red-500",
};

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function HistorialPedidoModal({ pedido, onClose }: Props) {
  useEscape(onClose);
  const { data, isLoading, isError } = useHistorialPedido(pedido.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">Historial del pedido</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {pedido.codigoQr} · {pedido.cliente.nombre}
            </p>
            <p className="text-[10px] text-stone-500">
              {pedido.plan.nombre} · {etiquetaEstado(pedido.estado)}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">×</button>
        </header>

        <div className="p-6 overflow-y-auto">
          {isLoading && <p className="text-xs text-stone-500">Cargando historial...</p>}
          {isError && <p className="text-xs text-red-600">No se pudo cargar el historial.</p>}
          {data && data.length === 0 && (
            <p className="text-xs text-stone-500">Sin eventos registrados.</p>
          )}
          {data && data.length > 0 && <Timeline eventos={data} />}
        </div>

        <footer className="px-6 py-3 border-t border-stone-200">
          <button
            onClick={onClose}
            className="w-full border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}

function Timeline({ eventos }: { eventos: HistorialEvento[] }) {
  return (
    <ol className="relative ml-3 border-l-2 border-stone-200 space-y-5">
      {eventos.map((e) => (
        <li key={e.id} className="pl-5 relative">
          <span
            className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-2 ring-white ${COLOR_DOT[e.estado]}`}
          />
          <p className="text-sm font-medium">{etiquetaEstado(e.estado)}</p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {formatoFecha.format(new Date(e.fecha))}
            {e.empleadoNombre && ` · ${e.empleadoNombre}`}
          </p>
          {e.observacion && (
            <p className="text-xs text-stone-700 mt-1 bg-stone-50 border border-stone-200 rounded px-2 py-1">
              {e.observacion}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
