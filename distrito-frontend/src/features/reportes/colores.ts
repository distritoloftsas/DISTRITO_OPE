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
