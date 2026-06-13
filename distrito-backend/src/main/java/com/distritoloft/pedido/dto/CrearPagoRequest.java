package com.distritoloft.pedido.dto;

import com.distritoloft.common.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CrearPagoRequest(
        @NotNull MetodoPago metodo,
        @NotNull @Positive BigDecimal monto,
        String referencia
) {}
