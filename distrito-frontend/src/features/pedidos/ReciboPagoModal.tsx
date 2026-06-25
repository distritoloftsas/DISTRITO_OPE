import { useEscape } from "../../lib/useEscape";
import type { MetodoPago, PedidoResponse } from "../../types/pedido";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DATAFONO: "Datáfono",
};

export interface ReciboPago {
  id: number;
  metodo: MetodoPago;
  monto: number;
  referencia?: string | null;
  fecha: string;
  empleadoNombre?: string | null;
}

interface Props {
  pedido: PedidoResponse;
  pago: ReciboPago;
  onClose: () => void;
}

export function ReciboPagoModal({ pedido, pago, onClose }: Props) {
  useEscape(onClose);

  const imprimir = () => window.print();

  return (
    <div className="ticket-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="ticket-printable bg-white rounded-2xl border border-stone-200 w-full max-w-sm">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center no-print">
          <h3 className="text-base font-medium">Recibo de pago</h3>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <div className="p-6 print:p-4" id="recibo-printable">
          <div className="text-center mb-4 pb-4 border-b border-dashed border-stone-300">
            <p className="text-lg font-medium tracking-wider">DISTRITO LOFT</p>
            <p className="text-xs text-stone-600 mt-0.5">{pedido.sede.nombre}</p>
            <p className="text-[10px] text-stone-500 mt-2">Recibo de pago</p>
            <p className="text-[10px] text-stone-500">
              {formatoFechaHora.format(new Date(pago.fecha))}
            </p>
          </div>

          <div className="text-xs space-y-1.5 mb-4">
            <Linea etiqueta="Recibo No." valor={`#${pago.id}`} />
            <Linea etiqueta="Pedido" valor={pedido.codigoQr} />
            <Linea etiqueta="Cliente" valor={pedido.cliente.nombre} />
            <Linea etiqueta="Plan" valor={pedido.plan.nombre} />
            {pago.empleadoNombre && (
              <Linea etiqueta="Atendió" valor={pago.empleadoNombre} />
            )}
          </div>

          <div className="border-t border-dashed border-stone-300 pt-3 mb-3 text-xs space-y-1.5">
            <Linea etiqueta="Método" valor={METODO_LABEL[pago.metodo]} />
            {pago.referencia && (
              <Linea etiqueta="Referencia" valor={pago.referencia} />
            )}
          </div>

          <div className="border-t border-stone-800 pt-3 mb-4 flex justify-between items-baseline">
            <span className="text-sm font-medium">TOTAL PAGADO</span>
            <span className="text-xl font-medium">{formatoCOP.format(pago.monto)}</span>
          </div>

          <div className="text-center text-[10px] text-stone-500 mt-6 pt-4 border-t border-dashed border-stone-300">
            <p>Gracias por confiar en Distrito Loft.</p>
            <p className="mt-1">
              Sigue tu pedido en {window.location.origin}/p/{pedido.codigoQr}
            </p>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cerrar
          </button>
          <button
            onClick={imprimir}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg"
          >
            🖨 Imprimir
          </button>
        </footer>
      </div>
    </div>
  );
}

function Linea({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-stone-500">{etiqueta}</span>
      <span className="text-right break-words">{valor}</span>
    </div>
  );
}
