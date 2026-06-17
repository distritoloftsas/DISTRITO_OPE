import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import type { EstadoPedido } from "../types/pedido";
import { usePageTitle } from "../lib/usePageTitle";

const FLUJO: EstadoPedido[] = ["RECIBIDO", "LAVANDO", "SECANDO", "DOBLANDO", "LISTO", "ENTREGADO"];

const COLOR_DOT: Record<EstadoPedido, string> = {
  RECIBIDO: "bg-pink-400",
  LAVANDO: "bg-blue-400",
  SECANDO: "bg-amber-400",
  DOBLANDO: "bg-purple-400",
  LISTO: "bg-green-500",
  ENTREGADO: "bg-stone-600",
  CANCELADO: "bg-red-500",
};

const LABEL: Record<EstadoPedido, string> = {
  RECIBIDO: "Recibido",
  LAVANDO: "Lavando",
  SECANDO: "Secando",
  DOBLANDO: "Doblando",
  LISTO: "Listo para recoger",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

interface PedidoPublico {
  codigoQr: string;
  sedeNombre: string;
  planNombre: string;
  incluyeDoblado: boolean;
  estado: EstadoPedido;
  total: number;
  pagado: boolean;
  fechaRecepcion: string;
  fechaEntregaEstimada: string | null;
  fechaEntregaReal: string | null;
  fechaInicioLavado: string | null;
  fechaInicioSecado: string | null;
  duracionLavadoMinutos: number;
  duracionSecadoMinutos: number;
  clienteIniciales: string;
}

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const baseApi = import.meta.env.VITE_API_URL || "/api";

export function SeguimientoPublicoPage() {
  const { codigo } = useParams<{ codigo: string }>();
  usePageTitle(codigo ? `Pedido ${codigo}` : "Seguimiento");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pedido-publico", codigo],
    queryFn: async () => {
      const { data } = await axios.get<PedidoPublico>(`${baseApi}/pedidos/publico/${codigo}`);
      return data;
    },
    enabled: !!codigo,
    refetchInterval: 30_000,
  });

  return (
    <div className="min-h-screen bg-distrito-cream flex flex-col">
      <header className="bg-distrito-black text-distrito-cream px-6 py-4 flex items-center gap-3">
        <span className="text-distrito-gold font-medium tracking-widest text-sm">DL</span>
        <div>
          <p className="text-sm font-medium leading-none">Distrito Loft</p>
          <p className="text-[10px] text-distrito-gold mt-1">Seguimiento de pedido</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-md w-full mx-auto">
        {isLoading && <p className="text-sm text-stone-500">Buscando tu pedido...</p>}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            <p className="font-medium">No encontramos este pedido</p>
            <p className="text-xs mt-1">
              Verifica el código <strong>{codigo}</strong>. Si el problema persiste, acércate al
              mostrador.
            </p>
          </div>
        )}

        {data && <Detalle pedido={data} />}

        <p className="text-center text-[10px] text-stone-500 mt-8">
          ¿Eres cliente? <Link to="/login" className="underline">Inicia sesión</Link> para ver
          todos tus pedidos e historial.
        </p>
      </main>
    </div>
  );
}

function Detalle({ pedido }: { pedido: PedidoPublico }) {
  const cancelado = pedido.estado === "CANCELADO";
  const finalizado = cancelado || pedido.estado === "ENTREGADO";

  const flujo = pedido.incluyeDoblado ? FLUJO : FLUJO.filter((e) => e !== "DOBLANDO");
  const idxActual = flujo.indexOf(pedido.estado);

  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <p className="text-xs text-stone-500">Código</p>
          <p className="text-lg font-medium tracking-wider">{pedido.codigoQr}</p>
          <p className="text-xs text-stone-500 mt-2">
            {pedido.sedeNombre} · {pedido.planNombre}
          </p>
        </div>
        <span
          className={`inline-block w-3 h-3 rounded-full ${COLOR_DOT[pedido.estado]} mt-2`}
          title={LABEL[pedido.estado]}
        />
      </div>

      <p className="text-2xl font-medium mb-1">{LABEL[pedido.estado]}</p>
      <p className="text-xs text-stone-500 mb-4">
        Cliente: {pedido.clienteIniciales || "—"} · {formatoCOP.format(pedido.total)}
        {!pedido.pagado && pedido.estado === "RECIBIDO" && (
          <span className="ml-2 text-red-700">Sin pagar</span>
        )}
      </p>

      {!cancelado && (
        <ol className="flex gap-1 mb-5">
          {flujo.map((e, i) => {
            const done = i <= idxActual;
            const actual = i === idxActual && !finalizado;
            return (
              <li key={e} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    done ? "bg-distrito-gold-dark" : "bg-stone-200"
                  } ${actual ? "animate-pulse" : ""}`}
                  title={LABEL[e]}
                />
                <p className="text-[9px] text-stone-500 mt-1 text-center">
                  {LABEL[e].split(" ")[0]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="text-xs space-y-1.5 border-t border-stone-200 pt-3">
        <Linea label="Recibido" value={formatoFecha.format(new Date(pedido.fechaRecepcion))} />
        {pedido.fechaEntregaEstimada && !finalizado && (
          <Linea
            label="Entrega estimada"
            value={formatoFecha.format(new Date(pedido.fechaEntregaEstimada))}
          />
        )}
        {pedido.fechaEntregaReal && (
          <Linea
            label="Entregado"
            value={formatoFecha.format(new Date(pedido.fechaEntregaReal))}
          />
        )}
      </dl>

      <p className="text-[10px] text-stone-400 mt-4 text-center">Actualiza solo</p>
    </article>
  );
}

function Linea({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
