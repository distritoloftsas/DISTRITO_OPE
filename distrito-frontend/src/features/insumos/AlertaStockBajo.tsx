import { useInsumosStockBajo } from "./useInsumos";
import { ETIQUETA_UNIDAD } from "../../types/insumo";

export function AlertaStockBajo() {
  const { data } = useInsumosStockBajo();
  const items = data ?? [];

  if (items.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4 text-amber-900">
      <p className="text-xs font-medium mb-1">
        ⚠ {items.length} {items.length === 1 ? "insumo" : "insumos"} bajo mínimo
      </p>
      <p className="text-[11px]">
        {items.map((i) => (
          <span key={i.id} className="mr-3">
            {i.nombre} ({i.stockActual} {ETIQUETA_UNIDAD[i.unidad]})
          </span>
        ))}
      </p>
    </div>
  );
}
