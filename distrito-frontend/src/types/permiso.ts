export type Permiso =
  | "VER_OPERACION"
  | "VER_CLIENTES"
  | "VER_EQUIPO"
  | "VER_INVENTARIO"
  | "GESTIONAR_RECETAS"
  | "GESTIONAR_MAQUINAS"
  | "GESTIONAR_TOLERANCIA"
  | "VER_CIERRE_CAJA"
  | "VER_REPORTES_VENTAS"
  | "VER_REPORTES_INSUMOS"
  | "EXPORTAR_REPORTES";

export const TODOS_PERMISOS: Permiso[] = [
  "VER_OPERACION",
  "VER_CLIENTES",
  "VER_EQUIPO",
  "VER_INVENTARIO",
  "GESTIONAR_RECETAS",
  "GESTIONAR_MAQUINAS",
  "GESTIONAR_TOLERANCIA",
  "VER_CIERRE_CAJA",
  "VER_REPORTES_VENTAS",
  "VER_REPORTES_INSUMOS",
  "EXPORTAR_REPORTES",
];

export const ETIQUETA_PERMISO: Record<Permiso, string> = {
  VER_OPERACION: "Ver operación (tablero)",
  VER_CLIENTES: "Ver y editar clientes",
  VER_EQUIPO: "Ver equipo de la sede",
  VER_INVENTARIO: "Ver inventario de insumos",
  GESTIONAR_RECETAS: "Editar recetas por plan",
  GESTIONAR_MAQUINAS: "Mantenimiento de máquinas",
  GESTIONAR_TOLERANCIA: "Editar tolerancia de la sede",
  VER_CIERRE_CAJA: "Ver cierre de caja del día",
  VER_REPORTES_VENTAS: "Ver reporte de ventas",
  VER_REPORTES_INSUMOS: "Ver reporte de gasto en insumos",
  EXPORTAR_REPORTES: "Descargar Excel",
};
