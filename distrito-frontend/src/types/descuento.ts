export interface Descuento {
  id: number;
  codigo: string;
  etiqueta: string;
  porcentaje: number;
}

/** Color asociado a cada tipo de descuento para reportes y UI. */
export const COLOR_DESCUENTO: Record<string, string> = {
  ESTUDIANTE: "#3b82f6",   // azul
  POLICIA: "#0f172a",      // azul marino oscuro
  SALUD: "#10b981",        // verde
  RESIDENCIAL: "#f59e0b",  // ámbar
};
