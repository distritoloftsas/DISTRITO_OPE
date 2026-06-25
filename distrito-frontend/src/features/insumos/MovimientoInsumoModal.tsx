import { useMemo, useState } from "react";
import { useRegistrarMovimiento } from "./useInsumos";
import { useEscape } from "../../lib/useEscape";
import {
  ETIQUETA_UNIDAD,
  type InsumoResponse,
  type TipoMovimientoInsumo,
  type UnidadInsumo,
} from "../../types/insumo";

interface Props {
  insumo: InsumoResponse;
  onClose: () => void;
  onRegistrado: () => void;
}

const TIPOS: { value: TipoMovimientoInsumo; label: string; hint: string }[] = [
  { value: "ENTRADA", label: "Entrada", hint: "Compra o reposición" },
  { value: "AJUSTE", label: "Ajuste", hint: "Corrección al alza" },
  { value: "BAJA", label: "Baja", hint: "Descarte, vencido o dañado" },
];

const UNIDAD_MAYOR: Partial<Record<UnidadInsumo, { unidad: UnidadInsumo; factor: number }>> = {
  MILILITRO: { unidad: "LITRO", factor: 1000 },
  GRAMO: { unidad: "KILO", factor: 1000 },
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCantidad = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 4 });

export function MovimientoInsumoModal({ insumo, onClose, onRegistrado }: Props) {
  useEscape(onClose);
  const [tipo, setTipo] = useState<TipoMovimientoInsumo>("ENTRADA");
  const [motivo, setMotivo] = useState("");

  // ENTRADA: "compra" (cantidad+total) o "detallado" (cantidad+costo unitario)
  const [modoEntrada, setModoEntrada] = useState<"compra" | "detallado">("compra");
  const [cantidadCompra, setCantidadCompra] = useState("");
  const [unidadCompra, setUnidadCompra] = useState<UnidadInsumo>(insumo.unidad);
  const [costoTotal, setCostoTotal] = useState("");

  // Detallado / AJUSTE / BAJA
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState(String(insumo.costoUnitario));

  const registrar = useRegistrarMovimiento();
  const unidadBase = ETIQUETA_UNIDAD[insumo.unidad];
  const mayor = UNIDAD_MAYOR[insumo.unidad];

  const factor = unidadCompra === insumo.unidad ? 1 : mayor?.factor ?? 1;
  const cantidadEnBase = useMemo(() => {
    const n = Number(cantidadCompra);
    return Number.isFinite(n) ? n * factor : 0;
  }, [cantidadCompra, factor]);

  const costoUnitarioCalc = useMemo(() => {
    const total = Number(costoTotal);
    if (!Number.isFinite(total) || cantidadEnBase <= 0) return 0;
    return total / cantidadEnBase;
  }, [costoTotal, cantidadEnBase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tipo === "ENTRADA" && modoEntrada === "compra") {
        await registrar.mutateAsync({
          insumoId: insumo.id,
          tipo: "ENTRADA",
          cantidad: cantidadEnBase,
          costoUnitario: costoUnitarioCalc,
          motivo: motivo || undefined,
        });
      } else {
        await registrar.mutateAsync({
          insumoId: insumo.id,
          tipo,
          cantidad: Number(cantidad),
          costoUnitario: tipo === "ENTRADA" ? Number(costoUnitario) : undefined,
          motivo: motivo || undefined,
        });
      }
      onRegistrado();
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(registrar.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">Movimiento de inventario</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {insumo.nombre} · Stock actual {insumo.stockActual} {unidadBase}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <div>
            <label className="block text-xs text-stone-600 mb-2">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTipo(t.value)}
                  className={`text-xs py-2 px-1 rounded border text-center ${
                    tipo === t.value
                      ? "border-distrito-gold-dark bg-distrito-cream"
                      : "border-stone-300"
                  }`}
                  title={t.hint}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tipo === "ENTRADA" && (
            <div className="flex gap-1 text-[11px] border border-stone-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setModoEntrada("compra")}
                className={`flex-1 py-1.5 rounded ${
                  modoEntrada === "compra" ? "bg-distrito-cream font-medium" : "text-stone-500"
                }`}
              >
                Por compra (recomendado)
              </button>
              <button
                type="button"
                onClick={() => setModoEntrada("detallado")}
                className={`flex-1 py-1.5 rounded ${
                  modoEntrada === "detallado" ? "bg-distrito-cream font-medium" : "text-stone-500"
                }`}
              >
                Detallado
              </button>
            </div>
          )}

          {tipo === "ENTRADA" && modoEntrada === "compra" ? (
            <>
              <div>
                <label className="block text-xs text-stone-600 mb-1">Cantidad comprada</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={cantidadCompra}
                    onChange={(e) => setCantidadCompra(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg"
                    placeholder="Ej: 5"
                  />
                  {mayor ? (
                    <select
                      value={unidadCompra}
                      onChange={(e) => setUnidadCompra(e.target.value as UnidadInsumo)}
                      className="px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                    >
                      <option value={mayor.unidad}>{ETIQUETA_UNIDAD[mayor.unidad]}</option>
                      <option value={insumo.unidad}>{unidadBase}</option>
                    </select>
                  ) : (
                    <span className="px-3 py-2 text-sm text-stone-500 border border-stone-200 rounded-lg bg-stone-50">
                      {unidadBase}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  Costo total pagado (COP)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={costoTotal}
                  onChange={(e) => setCostoTotal(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  placeholder="Ej: 50000"
                />
              </div>

              {cantidadEnBase > 0 && Number(costoTotal) > 0 && (
                <div className="bg-distrito-cream/60 border border-distrito-gold/40 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Ingresa al inventario:</span>
                    <span className="font-medium">
                      {formatoCantidad.format(cantidadEnBase)} {unidadBase}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Costo por {unidadBase}:</span>
                    <span className="font-medium">{formatoCOP.format(costoUnitarioCalc)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  Cantidad ({unidadBase})
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>

              {tipo === "ENTRADA" && (
                <div>
                  <label className="block text-xs text-stone-600 mb-1">
                    Costo por {unidadBase} (COP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costoUnitario}
                    onChange={(e) => setCostoUnitario(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Se usa para recalcular el costo del inventario.
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs text-stone-600 mb-1">Motivo (opcional)</label>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              placeholder={
                tipo === "BAJA"
                  ? "Vencido, dañado, etc."
                  : tipo === "AJUSTE"
                  ? "Recuento físico, etc."
                  : "Compra a proveedor"
              }
            />
          </div>

          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={registrar.isPending}
              className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
            >
              {registrar.isPending ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
