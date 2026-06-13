package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequest(
        @NotNull EstadoPedido nuevoEstado,
        String observacion
) {}
