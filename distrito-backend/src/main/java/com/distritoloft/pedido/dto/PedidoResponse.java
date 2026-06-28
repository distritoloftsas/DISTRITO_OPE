package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.TipoCicloLavadora;
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
        BigDecimal costoDomicilio,
        String direccionEntrega,
        Boolean pagado,
        String observaciones,
        OffsetDateTime fechaRecepcion,
        OffsetDateTime fechaEntregaEstimada,
        OffsetDateTime fechaEntregaReal,
        OffsetDateTime fechaInicioLavado,
        OffsetDateTime fechaInicioSecado,
        MaquinaResumen lavadora,
        MaquinaResumen secadora,
        TipoCicloLavadora tipoCicloLavadora,
        Integer duracionLavadoCicloMinutos
) {
    public record ClienteResumen(Long id, String nombre, String telefono) {}
    public record SedeResumen(
            Long id,
            String nombre,
            Integer toleranciaPreLavadoMinutos,
            Integer toleranciaPostLavadoMinutos
    ) {}
    public record PlanResumen(
            Long id,
            String nombre,
            BigDecimal precio,
            Boolean incluyeDoblado,
            Boolean incluyeDomicilio,
            Integer duracionLavadoMinutos,
            Integer duracionSecadoMinutos
    ) {}
    public record MaquinaResumen(Long id, TipoMaquina tipo, Short numero) {}

    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(
                p.getId(),
                p.getCodigoQr(),
                new ClienteResumen(p.getCliente().getId(), p.getCliente().getNombre(), p.getCliente().getTelefono()),
                new SedeResumen(
                        p.getSede().getId(),
                        p.getSede().getNombre(),
                        p.getSede().getToleranciaPreLavadoMinutos(),
                        p.getSede().getToleranciaPostLavadoMinutos()
                ),
                new PlanResumen(
                        p.getPlan().getId(),
                        p.getPlan().getNombre(),
                        p.getPlan().getPrecio(),
                        p.getPlan().getIncluyeDoblado(),
                        p.getPlan().getIncluyeDomicilio(),
                        p.getPlan().getDuracionLavadoMinutos(),
                        p.getPlan().getDuracionSecadoMinutos()
                ),
                p.getEstado(),
                p.getTotal(),
                p.getCostoDomicilio(),
                p.getDireccionEntrega(),
                p.getPagado(),
                p.getObservaciones(),
                p.getFechaRecepcion(),
                p.getFechaEntregaEstimada(),
                p.getFechaEntregaReal(),
                p.getFechaInicioLavado(),
                p.getFechaInicioSecado(),
                resumen(p.getLavadora()),
                resumen(p.getSecadora()),
                p.getTipoCicloLavadora(),
                p.getTipoCicloLavadora() != null ? p.getTipoCicloLavadora().getDuracionMinutos() : null
        );
    }

    private static MaquinaResumen resumen(Maquina m) {
        if (m == null) return null;
        return new MaquinaResumen(m.getId(), m.getTipo(), m.getNumero());
    }
}
