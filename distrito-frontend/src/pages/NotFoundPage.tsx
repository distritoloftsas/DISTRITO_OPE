import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { rutaInicialPorRol } from "../types/auth";
import { usePageTitle } from "../lib/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Página no encontrada");
  const usuario = useAuthStore((s) => s.usuario);
  const destino = usuario ? rutaInicialPorRol(usuario.rol) : "/login";

  return (
    <div className="min-h-screen bg-distrito-cream flex items-center justify-center p-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-distrito-black text-distrito-gold flex items-center justify-center text-xl font-medium tracking-widest mx-auto mb-4">
          DL
        </div>
        <h1 className="text-5xl font-medium text-distrito-black mb-2">404</h1>
        <p className="text-sm text-stone-600 mb-6">
          No encontramos esta página.
        </p>
        <Link
          to={destino}
          className="inline-block bg-distrito-black text-distrito-cream text-sm px-5 py-2 rounded-lg"
        >
          {usuario ? "Ir a mi inicio" : "Ir al login"}
        </Link>
      </div>
    </div>
  );
}
