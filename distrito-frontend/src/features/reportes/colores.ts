// Paleta consistente para graficas de reportes.
// Combina la identidad de Distrito (dorado/negro/crema) con tonos de soporte.
export const COLORES = {
  dorado: "#C9A96E",
  doradoOscuro: "#A88046",
  negro: "#2B2926",
  crema: "#F4EFE6",
  verde: "#16a34a",
  rojo: "#dc2626",
  ambar: "#d97706",
  azul: "#2563eb",
  morado: "#7c3aed",
  gris: "#6b7280",
} as const;

export const PALETA_GRAFICAS = [
  COLORES.dorado,
  COLORES.azul,
  COLORES.verde,
  COLORES.morado,
  COLORES.ambar,
  COLORES.rojo,
  COLORES.doradoOscuro,
  COLORES.gris,
];

export function colorPorIndex(i: number): string {
  return PALETA_GRAFICAS[i % PALETA_GRAFICAS.length];
}

/** Colores de fondo (suaves) para filas de la tabla del consolidado por plan. */
export function bgPlan(nombre: string): string {
  const n = nombre?.toLowerCase() ?? "";
  if (n.includes("domicilio")) return "bg-amber-50";
  if (n.includes("doblado")) return "bg-emerald-50";
  if (n.includes("lavado") && n.includes("secado")) return "bg-sky-50";
  return "bg-stone-50";
}

/** Badges (fondo + texto) para descuentos por código. */
export function badgeDescuento(codigo: string | null): string {
  if (!codigo) return "bg-stone-100 text-stone-500";
  switch (codigo) {
    case "ESTUDIANTE": return "bg-sky-100 text-sky-800";
    case "POLICIA": return "bg-indigo-100 text-indigo-800";
    case "SALUD": return "bg-emerald-100 text-emerald-800";
    case "RESIDENCIAL": return "bg-amber-100 text-amber-800";
    default: return "bg-stone-100 text-stone-700";
  }
}

/** Badges para métodos de pago. */
export function badgeMetodo(metodo: string | null): string {
  if (!metodo) return "bg-stone-100 text-stone-500";
  switch (metodo) {
    case "EFECTIVO": return "bg-emerald-100 text-emerald-800";
    case "TRANSFERENCIA": return "bg-sky-100 text-sky-800";
    case "DATAFONO": return "bg-amber-100 text-amber-800";
    case "MIXTO": return "bg-violet-100 text-violet-800";
    default: return "bg-stone-100 text-stone-700";
  }
}

export function etiquetaMetodo(codigo: string | null): string {
  if (!codigo) return "—";
  switch (codigo) {
    case "EFECTIVO": return "Efectivo";
    case "TRANSFERENCIA": return "Transferencia";
    case "DATAFONO": return "Datáfono";
    case "MIXTO": return "Mixto";
    default: return codigo;
  }
}
