import { useState } from "react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { notify, mensajeDeError } from "../../lib/notify";

/**
 * Botón visible solo para SUPER_ADMIN que dispara el envío inmediato
 * del resumen diario (en vez de esperar al cron de las 7 PM).
 */
export function EnviarResumenBoton() {
  const usuario = useAuthStore((s) => s.usuario);
  const [enviando, setEnviando] = useState(false);

  if (!usuario || usuario.rol !== "SUPER_ADMIN") return null;

  const enviar = async () => {
    setEnviando(true);
    try {
      await api.post("/notificaciones/resumen-diario/enviar");
      notify.exito(
        "Correo enviado. Revisa la bandeja (y el spam las primeras veces).",
        "Resumen diario"
      );
    } catch (err) {
      notify.error(mensajeDeError(err, "No se pudo enviar el resumen."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h3 className="text-sm font-medium">Resumen diario por correo</h3>
        <p className="text-[11px] text-stone-500 mt-0.5">
          Se envía automáticamente todos los días a las 7:00 PM. También puedes dispararlo ahora para probar.
        </p>
      </div>
      <button
        onClick={enviar}
        disabled={enviando}
        className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Enviar resumen de hoy"}
      </button>
    </div>
  );
}
