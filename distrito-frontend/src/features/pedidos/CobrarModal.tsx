import { useState } from "react";
import { useRegistrarPago } from "./useRegistrarPago";
import type { MetodoPago, PedidoResponse } from "../../types/pedido";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface Props {
  pedido: PedidoResponse;
  onClose: () => void;
  onCobrado: () => void;
}

const metodos: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "DATAFONO", label: "Datáfono" },
];

export function CobrarModal({ pedido, onClose, onCobrado }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>("EFECTIVO");
  const [referencia, setReferencia] = useState("");
  const registrar = useRegistrarPago();

  const submit = async () => {
    try {
      await registrar.mutateAsync({
        pedidoId: pedido.id,
        metodo,
        monto: pedido.total,
        referencia: referencia || undefined,
      });
      onCobrado();
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(registrar.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-medium">Cobrar pedido</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {pedido.codigoQr} · {pedido.cliente.nombre}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="bg-distrito-cream rounded-lg p-4 text-center">
            <p className="text-xs text-stone-500">Total a cobrar</p>
            <p className="text-2xl font-medium mt-1">{formatoCOP.format(pedido.total)}</p>
          </div>

          <div>
            <label className="block text-xs text-stone-600 mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {metodos.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMetodo(m.value)}
                  className={`text-xs py-2 rounded-md border ${
                    metodo === m.value
                      ? "border-distrito-gold-dark bg-distrito-cream"
                      : "border-stone-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {(metodo === "TRANSFERENCIA" || metodo === "DATAFONO") && (
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Referencia (opcional)
              </label>
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder={
                  metodo === "TRANSFERENCIA" ? "Número de transferencia" : "Voucher"
                }
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600">{errorMsg}</p>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={registrar.isPending}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {registrar.isPending ? "Cobrando..." : `Cobrar ${formatoCOP.format(pedido.total)}`}
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
