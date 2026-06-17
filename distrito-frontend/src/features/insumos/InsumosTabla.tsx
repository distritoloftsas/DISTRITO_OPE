import { useState } from "react";
import { useInsumos } from "./useInsumos";
import { MovimientoInsumoModal } from "./MovimientoInsumoModal";
import { ETIQUETA_UNIDAD, type InsumoResponse } from "../../types/insumo";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCantidad = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 3,
});

export function InsumosTabla() {
  const { data, isLoading, isError } = useInsumos();
  const [movimiento, setMovimiento] = useState<InsumoResponse | null>(null);

  if (isLoading) return <p className="text-sm text-stone-500">Cargando insumos...</p>;
  if (isError) return <p className="text-sm text-red-600">No se pudieron cargar los insumos.</p>;

  const insumos = data ?? [];
  const valorTotal = insumos.reduce((acc, i) => acc + i.valorInventario, 0);

  if (insumos.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
        Aún no hay insumos registrados.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Insumo</th>
              <th className="text-right px-4 py-2">Stock</th>
              <th className="text-right px-4 py-2">Mínimo</th>
              <th className="text-right px-4 py-2">Costo/u</th>
              <th className="text-right px-4 py-2">Valor</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((i) => {
              const u = ETIQUETA_UNIDAD[i.unidad];
              return (
                <tr key={i.id} className="border-t border-stone-100">
                  <td className="px-4 py-2">
                    <p className={`font-medium ${!i.activo ? "text-stone-400" : ""}`}>
                      {i.nombre}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {i.sedeNombre}
                      {!i.activo && " · inactivo"}
                    </p>
                  </td>
                  <td className="px-4 py-2 text-xs text-right">
                    <span className={i.stockBajo ? "text-red-700 font-medium" : ""}>
                      {formatoCantidad.format(i.stockActual)} {u}
                    </span>
                    {i.stockBajo && (
                      <p className="text-[9px] text-red-600">Stock bajo</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-right text-stone-600">
                    {formatoCantidad.format(i.stockMinimo)} {u}
                  </td>
                  <td className="px-4 py-2 text-xs text-right text-stone-600">
                    {formatoCOP.format(i.costoUnitario)}
                  </td>
                  <td className="px-4 py-2 text-xs text-right font-medium">
                    {formatoCOP.format(i.valorInventario)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setMovimiento(i)}
                      className="text-xs px-2 py-1 border border-stone-300 rounded"
                    >
                      Movimiento
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-stone-50 text-xs">
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right text-stone-600">
                Valor total del inventario
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatoCOP.format(valorTotal)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {movimiento && (
        <MovimientoInsumoModal
          insumo={movimiento}
          onClose={() => setMovimiento(null)}
          onRegistrado={() => setMovimiento(null)}
        />
      )}
    </>
  );
}
