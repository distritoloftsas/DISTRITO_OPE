import { useEffect } from "react";

/**
 * Llama onClose cuando se presiona Escape.
 * Solo se registra mientras el componente esta montado.
 */
export function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}
