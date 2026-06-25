package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.TipoCicloLavadora;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequest(
        @NotNull EstadoPedido nuevoEstado,
        String observacion,
        Long maquinaId,
        TipoCicloLavadora tipoCicloLavadora
) {}
