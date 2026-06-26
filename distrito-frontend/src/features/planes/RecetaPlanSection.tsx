import { useEffect, useState } from "react";
import { usePlanes } from "./usePlanes";
import {
  useCrearPlanConsumo,
  useEliminarPlanConsumo,
  usePlanConsumos,
  type FaseConsumo,
} from "./usePlanConsumo";
import { useInsumos } from "../insumos/useInsumos";
import { ETIQUETA_UNIDAD } from "../../types/insumo";

const formatoCantidad = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 });

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
  const [error, setError] = useState<string | null>(null);

  const insumosActivos = (insumos ?? []).filter((i) => i.activo);
  const lineasLavado = (consumos ?? []).filter((c) => c.fase === "LAVADO");
  const lineasSecado = (consumos ?? []).filter((c) => c.fase === "SECADO");

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!planId || !insumoId || !cantidad) return;
    try {
      await crear.mutateAsync({
        planId,
        insumoId: Number(insumoId),
        fase,
        cantidad: Number(cantidad),
      });
      setInsumoId("");
      setCantidad("");
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
        automáticamente al pasar el pedido a LAVANDO o SECANDO.
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
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
                      {i.nombre} ({ETIQUETA_UNIDAD[i.unidad]})
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
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={crear.isPending}
                  className="w-full bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
                >
                  {crear.isPending ? "..." : "Agregar"}
                </button>
              </div>
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
                  {formatoCantidad.format(l.cantidad)} {ETIQUETA_UNIDAD[l.insumoUnidad]}
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
