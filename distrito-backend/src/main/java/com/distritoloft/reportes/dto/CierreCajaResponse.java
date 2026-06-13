package com.distritoloft.reportes.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record CierreCajaResponse(
        LocalDate fecha,
        SedeResumen sede,
        BigDecimal totalIngresos,
        int totalPagos,
        Map<MetodoPago, TotalPorMetodo> porMetodo,
        Map<EstadoPedido, Long> pedidosPorEstado,
        long lavadosEntregados,
        List<PagoDetalle> pagos
) {
    public record SedeResumen(Long id, String nombre) {}

    public record TotalPorMetodo(int cantidad, BigDecimal total) {}

    public record PagoDetalle(
            Long id,
            OffsetDateTime fecha,
            MetodoPago metodo,
            BigDecimal monto,
            String referencia,
            String empleadoNombre,
            String pedidoCodigo,
            String clienteNombre
    ) {}
}
