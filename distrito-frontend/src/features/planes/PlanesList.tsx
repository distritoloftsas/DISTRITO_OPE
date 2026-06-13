import { usePlanes } from "./usePlanes";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function PlanesList() {
  const { data, isLoading, isError, error } = usePlanes();

  if (isLoading) {
    return (
      <p className="text-sm text-stone-500 text-center py-6">
        Cargando planes...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <p className="font-medium">Error al cargar planes</p>
        <p className="text-xs mt-1">{(error as Error)?.message ?? "Error desconocido"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {data?.map((plan) => (
        <div
          key={plan.id}
          className="bg-white border border-stone-200 rounded-xl p-4 text-left"
        >
          <p className="text-xs text-distrito-gold-dark font-medium uppercase tracking-wider mb-1">
            Plan {plan.orden}
          </p>
          <h3 className="text-sm font-medium mb-2">{plan.nombre}</h3>
          <p className="text-xl font-medium text-distrito-black mb-3">
            {formatoCOP.format(plan.precio)}
          </p>
          <ul className="text-xs text-stone-600 space-y-1">
            <li>✓ Hasta {plan.kilosMaxCiclo} kg por ciclo</li>
            <li>{plan.incluyeDoblado ? "✓" : "·"} Doblado</li>
            <li>{plan.incluyeDomicilio ? "✓" : "·"} Domicilio</li>
          </ul>
        </div>
      ))}
    </div>
  );
}
