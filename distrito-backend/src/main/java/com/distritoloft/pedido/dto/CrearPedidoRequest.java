package com.distritoloft.pedido.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record CrearPedidoRequest(
        @NotNull Long clienteId,
        @NotNull Long planId,
        String observaciones,
        OffsetDateTime fechaEntregaEstimada
) {}
