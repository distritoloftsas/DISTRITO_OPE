import { usePedidos } from "./usePedidos";
import {
  ESTADOS_KANBAN,
  etiquetaEstado,
  type EstadoPedido,
  type PedidoResponse,
} from "../../types/pedido";

const COLOR_POR_ESTADO: Record<EstadoPedido, string> = {
  RECIBIDO: "bg-pink-50 border-pink-200 text-pink-900",
  LAVANDO: "bg-blue-50 border-blue-200 text-blue-900",
  SECANDO: "bg-amber-50 border-amber-200 text-amber-900",
  DOBLANDO: "bg-purple-50 border-purple-200 text-purple-900",
  LISTO: "bg-green-50 border-green-200 text-green-900",
  ENTREGADO: "bg-stone-100 border-stone-200 text-stone-700",
  CANCELADO: "bg-red-50 border-red-200 text-red-700",
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function KanbanBoard() {
  const { data, isLoading, isError, error } = usePedidos();

  if (isLoading) {
    return <p className="text-sm text-stone-500 text-center py-12">Cargando pedidos...</p>;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <p className="font-medium">Error al cargar pedidos</p>
        <p className="text-xs mt-1">{(error as Error)?.message ?? "Error desconocido"}</p>
      </div>
    );
  }

  const porEstado = (estado: EstadoPedido) =>
    (data ?? []).filter((p) => p.estado === estado);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {ESTADOS_KANBAN.map((estado) => {
        const pedidos = porEstado(estado);
        return (
          <div key={estado}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-medium text-distrito-black">
                {etiquetaEstado(estado)}
              </span>
              <span className="text-[10px] bg-distrito-cream text-stone-700 px-2 py-0.5 rounded-full">
                {pedidos.length}
              </span>
            </div>

            {pedidos.length === 0 ? (
              <div className="border border-dashed border-stone-200 rounded-lg p-4 text-center text-[11px] text-stone-400">
                Sin pedidos
              </div>
            ) : (
              pedidos.map((p) => <PedidoCard key={p.id} pedido={p} />)
            )}
          </div>
        );
      })}
    </div>
  );
}

function PedidoCard({ pedido }: { pedido: PedidoResponse }) {
  const colorClasses = COLOR_POR_ESTADO[pedido.estado];

  return (
    <div className={`border rounded-lg p-2.5 mb-2 ${colorClasses}`}>
      <p className="text-[11px] font-medium">{pedido.codigoQr}</p>
      <p className="text-xs mt-1 truncate">{pedido.cliente.nombre}</p>
      <p className="text-[10px] opacity-80 mt-0.5 truncate">{pedido.plan.nombre}</p>
      <p className="text-[10px] opacity-70 mt-1">{formatoCOP.format(pedido.total)}</p>
    </div>
  );
}
