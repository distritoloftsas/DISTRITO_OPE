import { etiquetaEstado, type EstadoPedido, type PedidoResponse } from "../../types/pedido";

const FLUJO: EstadoPedido[] = ["RECIBIDO", "LAVANDO", "SECANDO", "DOBLANDO", "LISTO", "ENTREGADO"];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  RECIBIDO: "text-pink-700 bg-pink-50 border-pink-200",
  LAVANDO: "text-blue-700 bg-blue-50 border-blue-200",
  SECANDO: "text-amber-700 bg-amber-50 border-amber-200",
  DOBLANDO: "text-purple-700 bg-purple-50 border-purple-200",
  LISTO: "text-green-700 bg-green-50 border-green-200",
  ENTREGADO: "text-stone-700 bg-stone-100 border-stone-200",
  CANCELADO: "text-red-700 bg-red-50 border-red-200",
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

interface Props {
  pedido: PedidoResponse;
  onVer: () => void;
}

export function PedidoClienteCard({ pedido, onVer }: Props) {
  const incluyeDoblado = pedido.plan.incluyeDoblado;
  const flujoFiltrado = incluyeDoblado ? FLUJO : FLUJO.filter((e) => e !== "DOBLANDO");
  const indiceActual = flujoFiltrado.indexOf(pedido.estado);
  const cancelado = pedido.estado === "CANCELADO";
  const finalizado = pedido.estado === "ENTREGADO" || cancelado;

  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-5 mb-3">
      <header className="flex items-start justify-between mb-3 gap-2">
        <div>
          <p className="text-xs text-stone-500">Pedido</p>
          <p className="text-base font-medium">{pedido.codigoQr}</p>
          <p className="text-xs text-stone-500 mt-1">{pedido.plan.nombre}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${COLOR_ESTADO[pedido.estado]}`}
          >
            {etiquetaEstado(pedido.estado)}
          </span>
          <p className="text-sm font-medium mt-2">{formatoCOP.format(pedido.total)}</p>
          {pedido.estado === "RECIBIDO" && !pedido.pagado && (
            <p className="text-[10px] text-red-700 mt-0.5">Sin pagar</p>
          )}
        </div>
      </header>

      {!cancelado && (
        <ol className="flex gap-1 mb-3">
          {flujoFiltrado.map((e, i) => {
            const completado = i <= indiceActual;
            const actual = i === indiceActual && !finalizado;
            return (
              <li key={e} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    completado ? "bg-distrito-gold-dark" : "bg-stone-200"
                  } ${actual ? "animate-pulse" : ""}`}
                  title={etiquetaEstado(e)}
                />
                <p className="text-[9px] text-stone-500 mt-1 text-center hidden sm:block">
                  {etiquetaEstado(e).replace("Recibidos", "Recibido").replace("Listos", "Listo")}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex justify-between items-center text-[10px] text-stone-500">
        <span>Recibido: {formatoFecha.format(new Date(pedido.fechaRecepcion))}</span>
        {pedido.fechaEntregaEstimada && !finalizado && (
          <span>Entrega estimada: {formatoFecha.format(new Date(pedido.fechaEntregaEstimada))}</span>
        )}
        {pedido.fechaEntregaReal && (
          <span>Entregado: {formatoFecha.format(new Date(pedido.fechaEntregaReal))}</span>
        )}
      </div>

      <button
        onClick={onVer}
        className="mt-3 w-full text-xs border border-stone-300 py-2 rounded-lg hover:bg-stone-50"
      >
        Ver historial
      </button>
    </article>
  );
}
