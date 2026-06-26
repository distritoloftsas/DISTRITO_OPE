import { useHistorialInsumo } from "./useInsumos";
import { useEscape } from "../../lib/useEscape";
import {
  ETIQUETA_TIPO_MOV,
  ETIQUETA_UNIDAD,
  type InsumoResponse,
  type MovimientoResponse,
  type TipoMovimientoInsumo,
} from "../../types/insumo";

interface Props {
  insumo: InsumoResponse;
  onClose: () => void;
}

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCantidad = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 });

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const COLOR: Record<TipoMovimientoInsumo, string> = {
  ENTRADA: "text-green-700",
  CONSUMO: "text-blue-700",
  AJUSTE: "text-amber-700",
  BAJA: "text-red-700",
};

const SIGNO: Record<TipoMovimientoInsumo, string> = {
  ENTRADA: "+",
  AJUSTE: "+",
  CONSUMO: "−",
  BAJA: "−",
};

export function HistorialInsumoModal({ insumo, onClose }: Props) {
  useEscape(onClose);
  const { data, isLoading } = useHistorialInsumo(insumo.id);
  const u = ETIQUETA_UNIDAD[insumo.unidad];

  const totales = calcularTotales(data ?? []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">Historial · {insumo.nombre}</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {insumo.sedeNombre} · Stock {formatoCantidad.format(insumo.stockActual)} {u}
              · Costo actual {formatoCOP.format(insumo.costoUnitario)} / {u}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
          <Tarjeta titulo="Total ingresado" valor={`${formatoCantidad.format(totales.cantidadEntrada)} ${u}`}
                   sub={formatoCOP.format(totales.costoEntrada)} />
          <Tarjeta titulo="Total consumido" valor={`${formatoCantidad.format(totales.cantidadConsumo)} ${u}`}
                   sub={formatoCOP.format(totales.costoConsumo)} />
          <Tarjeta titulo="Total bajas" valor={`${formatoCantidad.format(totales.cantidadBaja)} ${u}`}
                   sub={formatoCOP.format(totales.costoBaja)} />
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading && <p className="text-sm text-stone-500 p-6">Cargando historial...</p>}
          {data && data.length === 0 && (
            <p className="text-sm text-stone-500 p-6">Sin movimientos registrados.</p>
          )}
          {data && data.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                  <th className="text-right px-4 py-2">Cantidad</th>
                  <th className="text-right px-4 py-2">Costo u.</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-left px-4 py-2">Pedido</th>
                  <th className="text-left px-4 py-2">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => {
                  const total = (m.costoUnitario ?? 0) * m.cantidad;
                  return (
                    <tr key={m.id} className="border-t border-stone-100">
                      <td className="px-4 py-2 text-xs text-stone-600">
                        {formatoFecha.format(new Date(m.fecha))}
                      </td>
                      <td className={`px-4 py-2 text-xs font-medium ${COLOR[m.tipo]}`}>
                        {ETIQUETA_TIPO_MOV[m.tipo]}
                      </td>
                      <td className={`px-4 py-2 text-xs text-right font-medium ${COLOR[m.tipo]}`}>
                        {SIGNO[m.tipo]} {formatoCantidad.format(m.cantidad)} {u}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-stone-600">
                        {m.costoUnitario != null ? formatoCOP.format(m.costoUnitario) : "—"}
                      </td>
                      <td className="px-4 py-2 text-xs text-right font-medium">
                        {m.costoUnitario != null ? formatoCOP.format(total) : "—"}
                      </td>
                      <td className="px-4 py-2 text-xs">{m.pedidoCodigo ?? "—"}</td>
                      <td className="px-4 py-2 text-[11px] text-stone-600">
                        {m.motivo ?? ""}
                        {m.empleadoNombre && (
                          <p className="text-[10px] text-stone-400">por {m.empleadoNombre}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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

function Tarjeta({ titulo, valor, sub }: { titulo: string; valor: string; sub: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{titulo}</p>
      <p className="text-sm font-medium">{valor}</p>
      <p className="text-[10px] text-stone-500">{sub}</p>
    </div>
  );
}

interface Totales {
  cantidadEntrada: number;
  costoEntrada: number;
  cantidadConsumo: number;
  costoConsumo: number;
  cantidadBaja: number;
  costoBaja: number;
}

function calcularTotales(items: MovimientoResponse[]): Totales {
  const t: Totales = {
    cantidadEntrada: 0,
    costoEntrada: 0,
    cantidadConsumo: 0,
    costoConsumo: 0,
    cantidadBaja: 0,
    costoBaja: 0,
  };
  for (const m of items) {
    const costo = (m.costoUnitario ?? 0) * m.cantidad;
    if (m.tipo === "ENTRADA") {
      t.cantidadEntrada += m.cantidad;
      t.costoEntrada += costo;
    } else if (m.tipo === "CONSUMO") {
      t.cantidadConsumo += m.cantidad;
      t.costoConsumo += costo;
    } else if (m.tipo === "BAJA") {
      t.cantidadBaja += m.cantidad;
      t.costoBaja += costo;
    }
  }
  return t;
}
