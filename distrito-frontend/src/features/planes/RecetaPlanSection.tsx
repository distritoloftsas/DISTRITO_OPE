import { useEffect, useMemo, useState } from "react";
import { usePlanes } from "./usePlanes";
import {
  useCrearPlanConsumo,
  useEliminarPlanConsumo,
  usePlanConsumos,
  type FaseConsumo,
} from "./usePlanConsumo";
import { useInsumos } from "../insumos/useInsumos";
import { ETIQUETA_UNIDAD, type UnidadInsumo } from "../../types/insumo";

const formatoCantidad = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 });

/**
 * Devuelve las unidades a las que se puede convertir desde {@code base}.
 * Solo se permite conversion dentro del mismo dominio fisico
 * (volumen <-> volumen, peso <-> peso). El backend tambien valida.
 */
function unidadesCompatibles(base: UnidadInsumo): UnidadInsumo[] {
  if (base === "LITRO" || base === "MILILITRO") return ["LITRO", "MILILITRO"];
  if (base === "KILO" || base === "GRAMO") return ["KILO", "GRAMO"];
  return [base];
}

export function RecetaPlanSection() {
  const { data: planes } = usePlanes();
  const { data: insumos } = useInsumos();
  const [planId, setPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (planId === null && planes && planes.length > 0) {
      setPlanId(planes[0].id);
    }
  }, [planes, planId]);

  const { data: consumos, isLoading } = usePlanConsumos(planId);
  const crear = useCrearPlanConsumo();
  const eliminar = useEliminarPlanConsumo();

  const [insumoId, setInsumoId] = useState<string>("");
  const [fase, setFase] = useState<FaseConsumo>("LAVADO");
  const [cantidad, setCantidad] = useState<string>("");
  const [unidad, setUnidad] = useState<UnidadInsumo | "">("");
  const [error, setError] = useState<string | null>(null);

  const insumosActivos = (insumos ?? []).filter((i) => i.activo);
  const lineasLavado = (consumos ?? []).filter((c) => c.fase === "LAVADO");
  const lineasSecado = (consumos ?? []).filter((c) => c.fase === "SECADO");

  const insumoSeleccionado = useMemo(
    () => insumosActivos.find((i) => String(i.id) === insumoId),
    [insumoId, insumosActivos]
  );

  // Al cambiar de insumo, pre-seleccionar su unidad como default.
  useEffect(() => {
    if (insumoSeleccionado) {
      setUnidad(insumoSeleccionado.unidad);
    } else {
      setUnidad("");
    }
  }, [insumoSeleccionado]);

  const opcionesUnidad = insumoSeleccionado
    ? unidadesCompatibles(insumoSeleccionado.unidad)
    : [];

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!planId || !insumoId || !cantidad || !unidad) return;
    try {
      await crear.mutateAsync({
        planId,
        insumoId: Number(insumoId),
        fase,
        cantidad: Number(cantidad),
        unidad,
      });
      setInsumoId("");
      setCantidad("");
      setUnidad("");
    } catch (err) {
      const msg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
      setError(msg ?? "No se pudo agregar la línea.");
    }
  };

  return (
    <section>
      <h2 className="text-base font-medium mb-3">Recetas de consumo por plan</h2>
      <p className="text-xs text-stone-500 mb-4">
        Define cuánto se gasta de cada insumo por ciclo. El sistema descuenta
        automáticamente al pasar el pedido a LAVANDO o SECANDO. Si compras
        en litros pero usas en mililitros, escoge la unidad de la receta.
      </p>

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
        <label className="block text-xs text-stone-600 mb-1">Plan</label>
        <select
          value={planId ?? ""}
          onChange={(e) => setPlanId(Number(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
        >
          {(planes ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Cargando receta...</p>}

      {planId !== null && (
        <>
          <FaseBloque
            titulo="Fase LAVADO"
            lineas={lineasLavado}
            onEliminar={(id) => eliminar.mutate({ id, planId })}
          />
          <FaseBloque
            titulo="Fase SECADO"
            lineas={lineasSecado}
            onEliminar={(id) => eliminar.mutate({ id, planId })}
          />

          <form onSubmit={agregar} className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-medium mb-3">Agregar línea</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] text-stone-600 mb-1">Insumo</label>
                <select
                  value={insumoId}
                  onChange={(e) => setInsumoId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  <option value="">Selecciona...</option>
                  {insumosActivos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} (stock {formatoCantidad.format(i.stockActual)} {ETIQUETA_UNIDAD[i.unidad]})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">Fase</label>
                <select
                  value={fase}
                  onChange={(e) => setFase(e.target.value as FaseConsumo)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  <option value="LAVADO">Lavado</option>
                  <option value="SECADO">Secado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">Cantidad</label>
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
              <div>
                <label className="block text-[10px] text-stone-600 mb-1">Unidad</label>
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value as UnidadInsumo)}
                  required
                  disabled={!insumoSeleccionado}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg disabled:bg-stone-100"
                >
                  {!insumoSeleccionado && <option value="">--</option>}
                  {opcionesUnidad.map((u) => (
                    <option key={u} value={u}>
                      {ETIQUETA_UNIDAD[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={crear.isPending || !insumoSeleccionado}
                className="bg-distrito-black text-distrito-cream text-sm px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {crear.isPending ? "..." : "Agregar"}
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </form>
        </>
      )}
    </section>
  );
}

function FaseBloque({
  titulo,
  lineas,
  onEliminar,
}: {
  titulo: string;
  lineas: {
    id: number;
    insumoNombre: string;
    insumoUnidad: keyof typeof ETIQUETA_UNIDAD;
    cantidad: number;
    unidad: keyof typeof ETIQUETA_UNIDAD;
  }[];
  onEliminar: (id: number) => void;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-3">
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">{titulo}</p>
      {lineas.length === 0 ? (
        <p className="text-xs text-stone-400">Sin consumos definidos.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {lineas.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-2 text-sm">
              <span>{l.insumoNombre}</span>
              <span className="flex items-center gap-3">
                <span className="text-stone-700 font-medium">
                  {formatoCantidad.format(l.cantidad)} {ETIQUETA_UNIDAD[l.unidad]}
                </span>
                <button
                  onClick={() => onEliminar(l.id)}
                  className="text-[10px] px-2 py-1 border border-red-300 text-red-700 rounded"
                  title="Eliminar línea"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
