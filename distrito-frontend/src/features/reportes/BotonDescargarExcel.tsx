import { useAuthStore } from "../../store/authStore";
import { tienePermiso } from "../../types/auth";
import { descargarXlsx } from "../../lib/descargarBlob";

interface Props {
  url: string;
  params: Record<string, unknown>;
  filename: string;
}

export function BotonDescargarExcel({ url, params, filename }: Props) {
  const usuario = useAuthStore((s) => s.usuario);
  if (!tienePermiso(usuario, "EXPORTAR_REPORTES")) return null;

  return (
    <button
      type="button"
      onClick={() => descargarXlsx(url, params, filename)}
      className="text-xs px-3 py-1.5 border border-distrito-gold-dark text-distrito-black rounded-md hover:bg-distrito-cream"
    >
      ↓ Excel
    </button>
  );
}
