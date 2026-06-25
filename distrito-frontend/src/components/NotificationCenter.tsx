import { useEffect } from "react";
import { useNotifyStore } from "../lib/notify";

const ESTILOS = {
  success: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-900",
    icon: "✓",
    iconBg: "bg-green-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-900",
    icon: "!",
    iconBg: "bg-red-500",
  },
  info: {
    bg: "bg-stone-50",
    border: "border-stone-300",
    text: "text-stone-900",
    icon: "i",
    iconBg: "bg-distrito-gold-dark",
  },
};

export function NotificationCenter() {
  const toasts = useNotifyStore((s) => s.toasts);
  const dismiss = useNotifyStore((s) => s.dismiss);
  const confirmOpts = useNotifyStore((s) => s.confirmOpts);
  const resolveConfirm = useNotifyStore((s) => s.resolveConfirm);

  // Esc cancela el confirm modal
  useEffect(() => {
    if (!confirmOpts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolveConfirm(false);
      if (e.key === "Enter") resolveConfirm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpts, resolveConfirm]);

  return (
    <>
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const s = ESTILOS[t.tipo];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto ${s.bg} ${s.border} border rounded-xl shadow-lg p-3 flex items-start gap-3 animate-slide-in`}
            >
              <span
                className={`${s.iconBg} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}
              >
                {s.icon}
              </span>
              <div className={`flex-1 ${s.text}`}>
                {t.titulo && <p className="text-sm font-medium">{t.titulo}</p>}
                <p className={`text-xs ${t.titulo ? "mt-0.5" : ""}`}>{t.mensaje}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className={`${s.text} text-stone-400 hover:text-stone-700 text-lg leading-none px-1`}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {confirmOpts && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4"
          onClick={() => resolveConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5">
              {confirmOpts.titulo && (
                <h3 className="text-base font-medium mb-1">{confirmOpts.titulo}</h3>
              )}
              <p className="text-sm text-stone-600">{confirmOpts.mensaje}</p>
            </div>
            <div className="px-6 py-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={() => resolveConfirm(false)}
                className="flex-1 border border-stone-300 text-sm py-2 rounded-lg hover:bg-stone-50"
              >
                {confirmOpts.textoCancelar ?? "Cancelar"}
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                autoFocus
                className={`flex-[2] text-distrito-cream text-sm py-2 rounded-lg ${
                  confirmOpts.tono === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-distrito-black hover:bg-stone-800"
                }`}
              >
                {confirmOpts.textoConfirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
