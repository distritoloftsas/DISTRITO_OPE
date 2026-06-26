export type UnidadInsumo =
  | "GRAMO"
  | "KILO"
  | "MILILITRO"
  | "LITRO"
  | "KILOVATIO_HORA"
  | "UNIDAD";

export type TipoMovimientoInsumo = "ENTRADA" | "CONSUMO" | "AJUSTE" | "BAJA";

export interface InsumoResponse {
  id: number;
  sedeId: number;
  sedeNombre: string;
  nombre: string;
  unidad: UnidadInsumo;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  valorInventario: number;
  stockBajo: boolean;
  activo: boolean;
}

export interface MovimientoResponse {
  id: number;
  tipo: TipoMovimientoInsumo;
  cantidad: number;
  costoUnitario: number | null;
  motivo: string | null;
  pedidoCodigo: string | null;
  empleadoNombre: string | null;
  fecha: string;
}

export const ETIQUETA_UNIDAD: Record<UnidadInsumo, string> = {
  GRAMO: "g",
  KILO: "kg",
  MILILITRO: "ml",
  LITRO: "L",
  KILOVATIO_HORA: "kWh",
  UNIDAD: "u",
};

export const ETIQUETA_UNIDAD_LARGA: Record<UnidadInsumo, string> = {
  GRAMO: "Gramos",
  KILO: "Kilos",
  MILILITRO: "Mililitros",
  LITRO: "Litros",
  KILOVATIO_HORA: "kWh",
  UNIDAD: "Unidades",
};

export const ETIQUETA_TIPO_MOV: Record<TipoMovimientoInsumo, string> = {
  ENTRADA: "Entrada",
  CONSUMO: "Consumo",
  AJUSTE: "Ajuste",
  BAJA: "Baja",
};
