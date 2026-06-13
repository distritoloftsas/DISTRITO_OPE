package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.TipoMaquina;
import com.distritoloft.maquina.Maquina;
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
        Boolean pagado,
        String observaciones,
        OffsetDateTime fechaRecepcion,
        OffsetDateTime fechaEntregaEstimada,
        OffsetDateTime fechaEntregaReal,
        MaquinaResumen lavadora,
        MaquinaResumen secadora
) {
    public record ClienteResumen(Long id, String nombre, String telefono) {}
    public record SedeResumen(Long id, String nombre) {}
    public record PlanResumen(Long id, String nombre, BigDecimal precio, Boolean incluyeDoblado, Boolean incluyeDomicilio) {}
    public record MaquinaResumen(Long id, TipoMaquina tipo, Short numero) {}

    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(
                p.getId(),
                p.getCodigoQr(),
                new ClienteResumen(p.getCliente().getId(), p.getCliente().getNombre(), p.getCliente().getTelefono()),
                new SedeResumen(p.getSede().getId(), p.getSede().getNombre()),
                new PlanResumen(
                        p.getPlan().getId(),
                        p.getPlan().getNombre(),
                        p.getPlan().getPrecio(),
                        p.getPlan().getIncluyeDoblado(),
                        p.getPlan().getIncluyeDomicilio()
                ),
                p.getEstado(),
                p.getTotal(),
                p.getPagado(),
                p.getObservaciones(),
                p.getFechaRecepcion(),
                p.getFechaEntregaEstimada(),
                p.getFechaEntregaReal(),
                resumen(p.getLavadora()),
                resumen(p.getSecadora())
        );
    }

    private static MaquinaResumen resumen(Maquina m) {
        if (m == null) return null;
        return new MaquinaResumen(m.getId(), m.getTipo(), m.getNumero());
    }
}
