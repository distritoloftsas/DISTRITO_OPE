package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.Pedido;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PedidoResponse(
        Long id,
        String codigoQr,
        ClienteResumen cliente,
        SedeResumen sede,
        PlanResumen plan,
        EstadoPedido estado,
        BigDecimal total,
        String observaciones,
        OffsetDateTime fechaRecepcion,
        OffsetDateTime fechaEntregaEstimada,
        OffsetDateTime fechaEntregaReal
) {
    public record ClienteResumen(Long id, String nombre, String telefono) {}
    public record SedeResumen(Long id, String nombre) {}
    public record PlanResumen(Long id, String nombre, BigDecimal precio) {}

    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(
                p.getId(),
                p.getCodigoQr(),
                new ClienteResumen(p.getCliente().getId(), p.getCliente().getNombre(), p.getCliente().getTelefono()),
                new SedeResumen(p.getSede().getId(), p.getSede().getNombre()),
                new PlanResumen(p.getPlan().getId(), p.getPlan().getNombre(), p.getPlan().getPrecio()),
                p.getEstado(),
                p.getTotal(),
                p.getObservaciones(),
                p.getFechaRecepcion(),
                p.getFechaEntregaEstimada(),
                p.getFechaEntregaReal()
        );
    }
}
