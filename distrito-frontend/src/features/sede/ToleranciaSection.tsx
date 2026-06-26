import { useEffect, useState } from "react";
import { useMiSede, useActualizarTolerancia } from "./useMiSede";

export function ToleranciaSection() {
  const { data, isLoading } = useMiSede();
  const actualizar = useActualizarTolerancia(data?.id);
  const [pre, setPre] = useState("");
  const [post, setPost] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setPre(String(data.toleranciaPreLavadoMinutos));
      setPost(String(data.toleranciaPostLavadoMinutos));
    }
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    await actualizar.mutateAsync({ pre: Number(pre), post: Number(post) });
    setOkMsg("Tolerancia actualizada.");
  };

  if (isLoading) return <p className="text-sm text-stone-500">Cargando tolerancia...</p>;
  if (!data) return null;

  return (
    <section className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-base font-medium mb-1">Tolerancia operativa de la sede</h3>
      <p className="text-xs text-stone-500 mb-4">
        Minutos extra que el sistema suma al countdown para reflejar el tiempo
        real entre que la empleada manipula la ropa y arranca/termina cada ciclo.
      </p>

      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Pre-lavado (carga de ropa)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="60"
              value={pre}
              onChange={(e) => setPre(e.target.value)}
              required
              className="w-24 px-3 py-2 text-sm border border-stone-300 rounded-lg"
            />
            <span className="text-xs text-stone-500">min</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Post-lavado (cambio a secadora)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="60"
              value={post}
              onChange={(e) => setPost(e.target.value)}
              required
              className="w-24 px-3 py-2 text-sm border border-stone-300 rounded-lg"
            />
            <span className="text-xs text-stone-500">min</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={actualizar.isPending}
          className="bg-distrito-black text-distrito-cream text-sm py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {actualizar.isPending ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {okMsg && <p className="text-xs text-green-700 mt-3">{okMsg}</p>}
      {actualizar.isError && (
        <p className="text-xs text-red-600 mt-3">
          {(actualizar.error as { response?: { data?: { mensaje?: string } } })?.response?.data
            ?.mensaje ?? "No se pudo guardar."}
        </p>
      )}
    </section>
  );
}
