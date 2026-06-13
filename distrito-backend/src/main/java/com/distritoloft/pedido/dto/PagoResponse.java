package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.pedido.Pago;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PagoResponse(
        Long id,
        Long pedidoId,
        MetodoPago metodo,
        BigDecimal monto,
        String referencia,
        OffsetDateTime fecha,
        String empleadoNombre
) {
    public static PagoResponse from(Pago p) {
        return new PagoResponse(
                p.getId(),
                p.getPedido().getId(),
                p.getMetodo(),
                p.getMonto(),
                p.getReferencia(),
                p.getFecha(),
                p.getEmpleado() != null ? p.getEmpleado().getNombre() : null
        );
    }
}
