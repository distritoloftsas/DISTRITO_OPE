package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.PedidoEstadoHistorial;

import java.time.OffsetDateTime;

public record HistorialEventoResponse(
        Long id,
        EstadoPedido estado,
        OffsetDateTime fecha,
        String empleadoNombre,
        String observacion
) {
    public static HistorialEventoResponse from(PedidoEstadoHistorial h) {
        return new HistorialEventoResponse(
                h.getId(),
                h.getEstado(),
                h.getFecha(),
                h.getEmpleado() != null ? h.getEmpleado().getNombre() : null,
                h.getObservacion()
        );
    }
}
