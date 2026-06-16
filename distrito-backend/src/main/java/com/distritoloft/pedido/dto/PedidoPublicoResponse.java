package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.Pedido;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Vista pública del pedido (para QR de seguimiento). Sin datos sensibles.
 */
public record PedidoPublicoResponse(
        String codigoQr,
        String sedeNombre,
        String planNombre,
        Boolean incluyeDoblado,
        EstadoPedido estado,
        BigDecimal total,
        Boolean pagado,
        OffsetDateTime fechaRecepcion,
        OffsetDateTime fechaEntregaEstimada,
        OffsetDateTime fechaEntregaReal,
        OffsetDateTime fechaInicioLavado,
        OffsetDateTime fechaInicioSecado,
        Integer duracionLavadoMinutos,
        Integer duracionSecadoMinutos,
        String clienteIniciales
) {
    public static PedidoPublicoResponse from(Pedido p) {
        return new PedidoPublicoResponse(
                p.getCodigoQr(),
                p.getSede().getNombre(),
                p.getPlan().getNombre(),
                p.getPlan().getIncluyeDoblado(),
                p.getEstado(),
                p.getTotal(),
                p.getPagado(),
                p.getFechaRecepcion(),
                p.getFechaEntregaEstimada(),
                p.getFechaEntregaReal(),
                p.getFechaInicioLavado(),
                p.getFechaInicioSecado(),
                p.getPlan().getDuracionLavadoMinutos(),
                p.getPlan().getDuracionSecadoMinutos(),
                iniciales(p.getCliente().getNombre())
        );
    }

    private static String iniciales(String nombre) {
        if (nombre == null || nombre.isBlank()) return "";
        String[] partes = nombre.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : partes) {
            if (!p.isEmpty()) sb.append(Character.toUpperCase(p.charAt(0))).append('.');
            if (sb.length() >= 4) break;
        }
        return sb.toString();
    }
}
