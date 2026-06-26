package com.distritoloft.insumo.dto;

import com.distritoloft.common.enums.TipoMovimientoInsumo;
import com.distritoloft.insumo.MovimientoInsumo;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record MovimientoResponse(
        Long id,
        TipoMovimientoInsumo tipo,
        BigDecimal cantidad,
        BigDecimal costoUnitario,
        String motivo,
        String pedidoCodigo,
        String empleadoNombre,
        OffsetDateTime fecha
) {
    public static MovimientoResponse from(MovimientoInsumo m) {
        return new MovimientoResponse(
                m.getId(),
                m.getTipo(),
                m.getCantidad(),
                m.getCostoUnitario(),
                m.getMotivo(),
                m.getPedido() != null ? m.getPedido().getCodigoQr() : null,
                m.getEmpleado() != null ? m.getEmpleado().getNombre() : null,
                m.getFecha()
        );
    }
}
