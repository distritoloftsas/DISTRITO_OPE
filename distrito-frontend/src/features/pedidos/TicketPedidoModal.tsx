import { QRCodeSVG } from "qrcode.react";
import type { PedidoResponse } from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  onClose: () => void;
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

export function TicketPedidoModal({ pedido, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ticket-overlay">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm flex flex-col">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start no-print">
          <h3 className="text-base font-medium">Ticket del pedido</h3>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <div className="p-6 ticket-printable">
          <div className="text-center mb-4">
            <p className="text-distrito-gold-dark font-medium tracking-widest text-xs">
              DISTRITO LOFT
            </p>
            <p className="text-[10px] text-stone-500">{pedido.sede.nombre}</p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 border border-stone-200 rounded">
              <QRCodeSVG value={urlSeguimiento(pedido.codigoQr)} size={180} level="M" />
            </div>
          </div>
          <p className="text-[9px] text-center text-stone-500 -mt-3 mb-3">
            Escanea para seguir tu pedido
          </p>

          <p className="text-center text-lg font-medium tracking-wider mb-4">
            {pedido.codigoQr}
          </p>

          <dl className="text-xs space-y-1.5 border-t border-stone-200 pt-3">
            <Linea label="Cliente" value={pedido.cliente.nombre} />
            {pedido.cliente.telefono && (
              <Linea label="Teléfono" value={pedido.cliente.telefono} />
            )}
            <Linea label="Plan" value={pedido.plan.nombre} />
            <Linea
              label="Recibido"
              value={formatoFecha.format(new Date(pedido.fechaRecepcion))}
            />
            {pedido.fechaEntregaEstimada && (
              <Linea
                label="Entrega estimada"
                value={formatoFecha.format(new Date(pedido.fechaEntregaEstimada))}
              />
            )}
          </dl>

          <div className="border-t border-stone-200 pt-3 mt-3 flex justify-between items-baseline">
            <span className="text-xs">Total</span>
            <span className="text-base font-medium">{formatoCOP.format(pedido.total)}</span>
          </div>

          <p className="text-[10px] text-center text-stone-500 mt-4">
            Presenta este ticket para recoger tu pedido.
          </p>
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg"
          >
            Imprimir
          </button>
        </footer>
      </div>
    </div>
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

function urlSeguimiento(codigoQr: string): string {
  if (typeof window === "undefined") return `/p/${codigoQr}`;
  return `${window.location.origin}/p/${codigoQr}`;
}
