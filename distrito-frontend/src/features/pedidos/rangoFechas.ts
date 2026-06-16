export type RangoCerrados = "hoy" | "7d" | "30d" | "todo";

export const ETIQUETA_RANGO: Record<RangoCerrados, string> = {
  hoy: "Hoy",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  todo: "Todo el tiempo",
};

export function rangoIso(r: RangoCerrados): { desde?: string; hasta?: string } {
  if (r === "todo") return {};

  const ahora = new Date();
  const hasta = new Date(ahora);
  hasta.setHours(23, 59, 59, 999);

  const desde = new Date(ahora);
  if (r === "hoy") {
    desde.setHours(0, 0, 0, 0);
  } else if (r === "7d") {
    desde.setDate(desde.getDate() - 7);
    desde.setHours(0, 0, 0, 0);
  } else {
    desde.setDate(desde.getDate() - 30);
    desde.setHours(0, 0, 0, 0);
  }

  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}
