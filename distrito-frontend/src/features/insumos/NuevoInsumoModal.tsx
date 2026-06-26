import { useState } from "react";
import { useCrearInsumo } from "./useInsumos";
import { useEscape } from "../../lib/useEscape";
import { ETIQUETA_UNIDAD_LARGA, type UnidadInsumo } from "../../types/insumo";

interface Props {
  onClose: () => void;
  onCreado: (nombre: string) => void;
}

const UNIDADES: UnidadInsumo[] = [
  "GRAMO",
  "KILO",
  "MILILITRO",
  "LITRO",
  "KILOVATIO_HORA",
  "UNIDAD",
];

export function NuevoInsumoModal({ onClose, onCreado }: Props) {
  useEscape(onClose);
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState<UnidadInsumo>("MILILITRO");
  const [stockInicial, setStockInicial] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("0");
  const [costoUnitario, setCostoUnitario] = useState("0");

  const crear = useCrearInsumo();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear.mutateAsync({
        nombre,
        unidad,
        stockInicial: Number(stockInicial),
        stockMinimo: Number(stockMinimo),
        costoUnitario: Number(costoUnitario),
      });
      onCreado(nombre);
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(crear.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-base font-medium">Nuevo insumo</h3>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <Campo label="Nombre" value={nombre} onChange={setNombre} required />

          <div>
            <label className="block text-xs text-stone-600 mb-1">Unidad</label>
            <select
              value={unidad}
              onChange={(e) => setUnidad(e.target.value as UnidadInsumo)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {ETIQUETA_UNIDAD_LARGA[u]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo
              label="Stock inicial"
              value={stockInicial}
              onChange={setStockInicial}
              type="number"
              step="0.001"
              min="0"
            />
            <Campo
              label="Stock mínimo"
              value={stockMinimo}
              onChange={setStockMinimo}
              type="number"
              step="0.001"
              min="0"
            />
          </div>

          <Campo
            label="Costo por unidad (COP)"
            value={costoUnitario}
            onChange={setCostoUnitario}
            type="number"
            step="0.01"
            min="0"
          />

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
              disabled={crear.isPending}
              className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
            >
              {crear.isPending ? "Creando..." : "Crear insumo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  required,
  type = "text",
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-stone-600 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
      />
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
