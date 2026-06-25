import type { NavigateFunction } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { confirmar } from "./notify";

/**
 * Pide confirmacion al usuario antes de cerrar sesion y redirige a /login.
 */
export async function confirmarCerrarSesion(navigate: NavigateFunction) {
  const ok = await confirmar({
    titulo: "¿Cerrar sesión?",
    mensaje: "Tu sesión actual se cerrará. Tendrás que volver a iniciar sesión.",
    textoConfirmar: "Sí, cerrar sesión",
    textoCancelar: "Quedarme",
    tono: "danger",
  });
  if (!ok) return;
  useAuthStore.getState().clearSession();
  navigate("/login", { replace: true });
}
