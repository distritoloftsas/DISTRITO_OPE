import { useState } from "react";
import { usePedidos } from "./usePedidos";
import { useCambiarEstado } from "./useCambiarEstado";
import { CobrarModal } from "./CobrarModal";
import { CancelarModal } from "./CancelarModal";
import { abrirWhatsapp } from "./whatsappAvisar";
import { ElegirMaquinaModal } from "./ElegirMaquinaModal";
import { HistorialPedidoModal } from "./HistorialPedidoModal";
import { TicketPedidoModal } from "./TicketPedidoModal";
import { CicloCountdown } from "./CicloCountdown";
import { tipoParaSiguienteEstado } from "../../types/maquina";
import {
  ESTADOS_KANBAN,
  ETIQUETA_CICLO,
  etiquetaEstado,
  siguienteEstado,
  type EstadoPedido,
  type PedidoResponse,
} from "../../types/pedido";
import {
  ETIQUETA_RANGO,
  rangoIso,
  type RangoCerrados,
} from "./rangoFechas";

interface ElegirMaquinaState {
  pedido: PedidoResponse;
  siguiente: EstadoPedido;
  tipo: "LAVADORA" | "SECADORA";
}

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

interface KanbanBoardProps {
  estados?: EstadoPedido[];
}

export function KanbanBoard({ estados = ESTADOS_KANBAN }: KanbanBoardProps = {}) {
  const esCerrados = estados.every((e) => e === "ENTREGADO" || e === "CANCELADO");
  const [rango, setRango] = useState<RangoCerrados>("30d");
  const { desde, hasta } = esCerrados ? rangoIso(rango) : {};
  const { data, isLoading, isError, error } = usePedidos({ estados, desde, hasta });
  const [cobrarPedido, setCobrarPedido] = useState<PedidoResponse | null>(null);
  const [cancelarPedido, setCancelarPedido] = useState<PedidoResponse | null>(null);
  const [elegirMaquina, setElegirMaquina] = useState<ElegirMaquinaState | null>(null);
  const [verPedido, setVerPedido] = useState<PedidoResponse | null>(null);
  const [ticketPedido, setTicketPedido] = useState<PedidoResponse | null>(null);

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
    <>
      {esCerrados && (
        <div className="flex items-center justify-end mb-3 gap-2">
          <label className="text-xs text-stone-600">Rango:</label>
          <select
            value={rango}
            onChange={(e) => setRango(e.target.value as RangoCerrados)}
            className="text-xs px-2 py-1.5 border border-stone-300 rounded-md bg-white"
          >
            {(Object.keys(ETIQUETA_RANGO) as RangoCerrados[]).map((r) => (
              <option key={r} value={r}>
                {ETIQUETA_RANGO[r]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
          estados.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-2"
        }`}
      >
        {estados.map((estado) => {
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
                pedidos.map((p) => (
                  <PedidoCard
                    key={p.id}
                    pedido={p}
                    onCobrar={() => setCobrarPedido(p)}
                    onCancelar={() => setCancelarPedido(p)}
                    onVer={() => setVerPedido(p)}
                    onTicket={() => setTicketPedido(p)}
                    onPedirMaquina={(siguiente, tipo) =>
                      setElegirMaquina({ pedido: p, siguiente, tipo })
                    }
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      {cobrarPedido && (
        <CobrarModal
          pedido={cobrarPedido}
          onClose={() => setCobrarPedido(null)}
          onCobrado={() => setCobrarPedido(null)}
        />
      )}

      {cancelarPedido && (
        <CancelarModal
          pedido={cancelarPedido}
          onClose={() => setCancelarPedido(null)}
          onCancelado={() => setCancelarPedido(null)}
        />
      )}

      {elegirMaquina && (
        <ElegirMaquinaModal
          pedido={elegirMaquina.pedido}
          siguiente={elegirMaquina.siguiente}
          tipo={elegirMaquina.tipo}
          onClose={() => setElegirMaquina(null)}
          onAvanzado={() => setElegirMaquina(null)}
        />
      )}

      {verPedido && (
        <HistorialPedidoModal
          pedido={verPedido}
          onClose={() => setVerPedido(null)}
        />
      )}

      {ticketPedido && (
        <TicketPedidoModal
          pedido={ticketPedido}
          onClose={() => setTicketPedido(null)}
        />
      )}
    </>
  );
}

function PedidoCard({
  pedido,
  onCobrar,
  onCancelar,
  onVer,
  onTicket,
  onPedirMaquina,
}: {
  pedido: PedidoResponse;
  onCobrar: () => void;
  onCancelar: () => void;
  onVer: () => void;
  onTicket: () => void;
  onPedirMaquina: (siguiente: EstadoPedido, tipo: "LAVADORA" | "SECADORA") => void;
}) {
  const colorClasses = COLOR_POR_ESTADO[pedido.estado];
  const cambiar = useCambiarEstado();
  const siguiente = siguienteEstado(pedido);

  const puedeAvanzar = siguiente !== null;
  const bloqueadoPorPago = pedido.estado === "RECIBIDO" && !pedido.pagado;

  const avanzar = () => {
    if (!siguiente) return;
    const tipoNecesario = tipoParaSiguienteEstado(siguiente);
    if (tipoNecesario) {
      onPedirMaquina(siguiente, tipoNecesario);
      return;
    }
    cambiar.mutate({ pedidoId: pedido.id, nuevoEstado: siguiente });
  };

  const maquinaActual =
    pedido.estado === "LAVANDO"
      ? pedido.lavadora
      : pedido.estado === "SECANDO"
      ? pedido.secadora
      : null;

  const horasDesdeActualizacion =
    (Date.now() - new Date(pedido.fechaRecepcion).getTime()) / 3_600_000;
  const sinRecogerHaceMucho =
    pedido.estado === "LISTO" && horasDesdeActualizacion >= 72;
  const sinRecoger24h =
    pedido.estado === "LISTO" && !sinRecogerHaceMucho && horasDesdeActualizacion >= 24;

  const extra = sinRecogerHaceMucho
    ? "ring-2 ring-amber-500 ring-offset-1"
    : sinRecoger24h
    ? "ring-1 ring-amber-300"
    : "";

  return (
    <div className={`border rounded-lg p-2.5 mb-2 ${colorClasses} ${extra}`}>
      {sinRecogerHaceMucho && (
        <p className="text-[10px] text-amber-900 bg-amber-100 -m-2.5 mb-2 px-2 py-1 rounded-t-md font-medium">
          ⚠ Sin recoger hace +{Math.floor(horasDesdeActualizacion / 24)}d
        </p>
      )}
      <div className="flex justify-between items-start mb-1">
        <button
          onClick={onVer}
          className="text-[11px] font-medium hover:underline"
          title="Ver historial"
        >
          {pedido.codigoQr}
        </button>
        {pedido.estado === "RECIBIDO" && (
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
              pedido.pagado
                ? "bg-green-200 text-green-900"
                : "bg-red-200 text-red-900"
            }`}
          >
            {pedido.pagado ? "Pagado" : "Sin pagar"}
          </span>
        )}
      </div>

      <p className="text-xs truncate">{pedido.cliente.nombre}</p>
      <p className="text-[10px] opacity-80 truncate">{pedido.plan.nombre}</p>
      {maquinaActual && (
        <p className="text-[10px] font-medium mt-0.5">
          {maquinaActual.tipo === "LAVADORA" ? "Lav" : "Sec"} {maquinaActual.numero}
          {pedido.tipoCicloLavadora && maquinaActual.tipo === "LAVADORA" && (
            <span className="opacity-70"> · {ETIQUETA_CICLO[pedido.tipoCicloLavadora]}</span>
          )}
        </p>
      )}
      <CicloCountdown pedido={pedido} className="mt-0.5" />
      <p className="text-[10px] opacity-70 mt-1 mb-2">{formatoCOP.format(pedido.total)}</p>

      <div className="flex gap-1">
        {pedido.estado === "RECIBIDO" && !pedido.pagado && (
          <button
            onClick={onCobrar}
            className="flex-1 bg-distrito-black text-distrito-cream text-[10px] py-1 rounded"
          >
            Cobrar
          </button>
        )}

        {puedeAvanzar && (
          <button
            onClick={avanzar}
            disabled={bloqueadoPorPago || cambiar.isPending}
            className="flex-1 bg-white border border-current text-[10px] py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            title={bloqueadoPorPago ? "Falta cobrar el pedido" : undefined}
          >
            Avanzar →
          </button>
        )}

        {pedido.cliente.telefono && (
          <button
            onClick={() => abrirWhatsapp(pedido)}
            className="text-[10px] py-1 px-2 text-green-700 border border-green-400 rounded bg-white"
            title="Avisar por WhatsApp"
          >
            WA
          </button>
        )}

        <button
          onClick={onTicket}
          className="text-[10px] py-1 px-2 border border-current rounded bg-white"
          title="Ver ticket / QR"
        >
          ⌗
        </button>

        <button
          onClick={onCancelar}
          className="text-[10px] py-1 px-2 text-red-700 border border-red-300 rounded bg-white"
          title="Cancelar"
        >
          ✗
        </button>
      </div>
    </div>
  );
}
