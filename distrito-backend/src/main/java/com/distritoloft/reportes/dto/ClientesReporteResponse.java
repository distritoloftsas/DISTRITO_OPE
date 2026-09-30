package com.distritoloft.reportes.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Reporte de clientes por rango:
 * - nuevos: clientes que se crearon DENTRO del rango. Se listan los pedidos
 *   que hicieron en ese mismo rango.
 * - recurrentes: clientes que existian ANTES del rango pero pidieron durante el.
 * Un cliente nuevo del rango no aparece en recurrentes aunque haga varios pedidos.
 */
public record ClientesReporteResponse(
        LocalDate desde,
        LocalDate hasta,
        Long sedeId,
        String sedeNombre,
        List<LineaClienteServicio> nuevos,
        List<LineaClienteServicio> recurrentes
) {

    public record LineaClienteServicio(
            Long pedidoId,
            String codigoQr,
            String clienteNombre,
            String clienteTelefono,
            OffsetDateTime fechaServicio,
            String planNombre,
            OffsetDateTime fechaRegistroCliente
    ) {}
}
