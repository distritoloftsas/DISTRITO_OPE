package com.distritoloft.pedido.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CrearPedidoRequest(
        @NotNull Long clienteId,
        @NotNull Long planId,
        String observaciones,
        OffsetDateTime fechaEntregaEstimada,
        /** Solo se exige cuando el plan.incluyeDomicilio = true. */
        String direccionEntrega,
        /** Costo del domicilio. 0 o null si el plan no incluye domicilio. */
        @PositiveOrZero BigDecimal costoDomicilio
) {}
