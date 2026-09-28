package com.distritoloft.reportes.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Consolidado del rango de fechas para un solo reporte con todo:
 * tabla de pedidos, totales, descuentos por tipo, pagos por metodo y reembolsos.
 * Los colores viven en el frontend/Excel; este DTO solo envia datos.
 */
public record ConsolidadoResponse(
        LocalDate desde,
        LocalDate hasta,
        Long sedeId,
        String sedeNombre,
        Totales totales,
        List<LineaPedido> pedidos,
        List<LineaDescuento> descuentosPorTipo,
        List<LineaPagoMetodo> pagosPorMetodo,
        List<LineaReembolso> reembolsos
) {

    public record Totales(
            int cantidadPedidos,
            int cantidadPedidosCancelados,
            BigDecimal subtotalBruto,
            BigDecimal totalDescuentos,
            BigDecimal totalDomicilios,
            BigDecimal totalFacturado,
            BigDecimal ticketPromedio,
            BigDecimal totalReembolsos
    ) {}

    public record LineaPedido(
            Long id,
            String codigoQr,
            OffsetDateTime fechaRecepcion,
            String cliente,
            String planNombre,
            EstadoPedido estado,
            BigDecimal subtotal,
            String descuentoCodigo,
            String descuentoEtiqueta,
            BigDecimal montoDescuento,
            BigDecimal costoDomicilio,
            BigDecimal total,
            Boolean pagado,
            /** null si no tuvo pagos, "MIXTO" si tuvo mas de uno. */
            String metodoPago
    ) {}

    public record LineaDescuento(
            String codigo,
            String etiqueta,
            int cantidadPedidos,
            BigDecimal montoDescontado
    ) {}

    public record LineaPagoMetodo(
            MetodoPago metodo,
            int cantidadPagos,
            BigDecimal monto
    ) {}

    public record LineaReembolso(
            Long pedidoId,
            String codigoQr,
            OffsetDateTime fechaCancelacion,
            String cliente,
            String planNombre,
            BigDecimal montoReembolsado
    ) {}
}
