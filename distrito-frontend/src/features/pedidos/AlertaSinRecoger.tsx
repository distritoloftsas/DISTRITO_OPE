import { usePedidos } from "./usePedidos";

const HORAS_ALERTA = 72;

export function AlertaSinRecoger() {
  const { data } = usePedidos({ estados: ["LISTO"] });

  if (!data) return null;

  const sinRecoger = data.filter((p) => {
    const horas = (Date.now() - new Date(p.fechaRecepcion).getTime()) / 3_600_000;
    return horas >= HORAS_ALERTA;
  });

  if (sinRecoger.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4 flex items-start gap-3">
      <span className="text-2xl leading-none">⚠</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          {sinRecoger.length} pedido{sinRecoger.length === 1 ? "" : "s"} sin recoger
          hace más de 3 días
        </p>
        <p className="text-xs text-amber-800 mt-0.5">
          {sinRecoger
            .slice(0, 4)
            .map((p) => p.codigoQr)
            .join(", ")}
          {sinRecoger.length > 4 ? ` y ${sinRecoger.length - 4} más` : ""}. Considera
          avisar al cliente por WhatsApp desde la tarjeta.
        </p>
      </div>
    </div>
  );
}
