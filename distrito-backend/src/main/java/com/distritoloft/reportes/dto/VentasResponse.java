package com.distritoloft.reportes.dto;

import com.distritoloft.common.enums.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record VentasResponse(
        LocalDate desde,
        LocalDate hasta,
        Long sedeId,
        String sedeNombre,
        BigDecimal totalVentas,
        long totalLavadas,
        List<LineaVenta> lineas
) {
    public record LineaVenta(
            Long pedidoId,
            String codigoQr,
            OffsetDateTime fechaRecepcion,
            String clienteNombre,
            String planNombre,
            BigDecimal total,
            Boolean pagado,
            EstadoPedido estado
    ) {}
}
