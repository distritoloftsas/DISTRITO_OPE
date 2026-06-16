package com.distritoloft.sede.dto;

import java.math.BigDecimal;

public record SedeResumenAdminResponse(
        Long id,
        String nombre,
        String ciudad,
        Boolean activa,
        long pedidosActivos,
        long pedidosHoy,
        BigDecimal ingresosHoy,
        long empleadosActivos,
        long maquinasLibres,
        long maquinasOcupadas,
        long maquinasMantenimiento
) {}
