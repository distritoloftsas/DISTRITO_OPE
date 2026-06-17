import { useState } from "react";
import { useRegistrarMovimiento } from "./useInsumos";
import { useEscape } from "../../lib/useEscape";
import {
  ETIQUETA_UNIDAD,
  type InsumoResponse,
  type TipoMovimientoInsumo,
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

export function MovimientoInsumoModal({ insumo, onClose, onRegistrado }: Props) {
  useEscape(onClose);
  const [tipo, setTipo] = useState<TipoMovimientoInsumo>("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState(String(insumo.costoUnitario));
  const [motivo, setMotivo] = useState("");

  const registrar = useRegistrarMovimiento();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrar.mutateAsync({
        insumoId: insumo.id,
        tipo,
        cantidad: Number(cantidad),
        costoUnitario: tipo === "ENTRADA" ? Number(costoUnitario) : undefined,
        motivo: motivo || undefined,
      });
      onRegistrado();
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(registrar.error);
  const unidad = ETIQUETA_UNIDAD[insumo.unidad];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">Movimiento de inventario</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {insumo.nombre} · Stock actual {insumo.stockActual} {unidad}
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

          <div>
            <label className="block text-xs text-stone-600 mb-1">Cantidad ({unidad})</label>
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
                Costo por {unidad} (COP)
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
