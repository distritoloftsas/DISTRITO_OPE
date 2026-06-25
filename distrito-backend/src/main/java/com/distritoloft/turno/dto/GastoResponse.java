package com.distritoloft.turno.dto;

import com.distritoloft.turno.GastoCaja;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record GastoResponse(
        Long id,
        String concepto,
        BigDecimal monto,
        OffsetDateTime fecha,
        String empleadoNombre
) {
    public static GastoResponse from(GastoCaja g) {
        return new GastoResponse(
                g.getId(),
                g.getConcepto(),
                g.getMonto(),
                g.getFecha(),
                g.getEmpleado() != null ? g.getEmpleado().getNombre() : null
        );
    }
}
