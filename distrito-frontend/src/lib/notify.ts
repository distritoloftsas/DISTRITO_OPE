import { create } from "zustand";

export type ToastTipo = "success" | "error" | "info";

export interface Toast {
  id: number;
  tipo: ToastTipo;
  titulo?: string;
  mensaje: string;
  /** ms hasta auto-cierre; 0 = manual */
  duracion?: number;
}

interface NotifyState {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => number;
  dismiss: (id: number) => void;
  // Confirm modal
  confirmOpts: ConfirmOpts | null;
  confirmResolver: ((value: boolean) => void) | null;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  resolveConfirm: (value: boolean) => void;
}

export interface ConfirmOpts {
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** "danger" cambia el botón de confirmar a rojo. */
  tono?: "primary" | "danger";
}

let siguienteId = 1;

export const useNotifyStore = create<NotifyState>((set, get) => ({
  toasts: [],
  show: (t) => {
    const id = siguienteId++;
    const toast: Toast = { duracion: 3500, ...t, id };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (toast.duracion && toast.duracion > 0) {
      setTimeout(() => get().dismiss(id), toast.duracion);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  confirmOpts: null,
  confirmResolver: null,
  confirm: (opts) =>
    new Promise<boolean>((resolve) => {
      set({ confirmOpts: opts, confirmResolver: resolve });
    }),
  resolveConfirm: (value) => {
    const resolver = get().confirmResolver;
    if (resolver) resolver(value);
    set({ confirmOpts: null, confirmResolver: null });
  },
}));

// Helpers ergonomicos
export const notify = {
  exito: (mensaje: string, titulo?: string) =>
    useNotifyStore.getState().show({ tipo: "success", mensaje, titulo }),
  error: (mensaje: string, titulo?: string) =>
    useNotifyStore.getState().show({
      tipo: "error",
      mensaje,
      titulo,
      duracion: 5500,
    }),
  info: (mensaje: string, titulo?: string) =>
    useNotifyStore.getState().show({ tipo: "info", mensaje, titulo }),
};

export const confirmar = (opts: ConfirmOpts) =>
  useNotifyStore.getState().confirm(opts);

/** Extrae el mensaje legible de un error de axios o cualquier excepción. */
export function mensajeDeError(err: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (!err) return fallback;
  const apiMsg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  if (apiMsg) return apiMsg;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
