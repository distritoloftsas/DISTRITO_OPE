import type { NavigateFunction } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Pide confirmacion al usuario antes de cerrar sesion y redirige a /login.
 */
export function confirmarCerrarSesion(navigate: NavigateFunction) {
  if (!window.confirm("¿Cerrar sesión?")) return;
  useAuthStore.getState().clearSession();
  navigate("/login", { replace: true });
}
