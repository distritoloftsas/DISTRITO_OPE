package com.distritoloft.common.enums;

/**
 * Permisos atomicos que controlan que vistas y acciones puede usar un
 * empleado o gerente. El SUPER_ADMIN siempre los tiene todos por logica
 * de codigo (no se persisten para el).
 */
public enum Permiso {
    VER_OPERACION,          // Tablero Kanban + maquinas (base)
    VER_CLIENTES,           // Buscar y editar clientes
    VER_EQUIPO,             // Lista de empleados de la sede
    VER_INVENTARIO,         // Insumos: stock, entradas, ajustes, historial
    GESTIONAR_RECETAS,      // Editar receta de consumo por plan
    GESTIONAR_MAQUINAS,     // Cambiar estado de maquinas (mantenimiento)
    GESTIONAR_TOLERANCIA,   // Editar tolerancia operativa de la sede
    VER_CIERRE_CAJA,        // Ver el cierre del dia
    VER_REPORTES_VENTAS,    // Reporte de ventas
    VER_REPORTES_INSUMOS,   // Reporte de gasto en insumos
    EXPORTAR_REPORTES;      // Boton "Descargar Excel"

    public static final java.util.Set<Permiso> DEFAULTS_EMPLEADO =
            java.util.EnumSet.of(VER_OPERACION, VER_CLIENTES, VER_CIERRE_CAJA);

    public static final java.util.Set<Permiso> DEFAULTS_GERENTE =
            java.util.EnumSet.allOf(Permiso.class);
}
