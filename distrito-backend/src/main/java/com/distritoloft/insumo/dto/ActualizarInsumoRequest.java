package com.distritoloft.insumo.dto;

import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ActualizarInsumoRequest(
        @PositiveOrZero BigDecimal stockMinimo,
        @PositiveOrZero BigDecimal costoUnitario,
        Boolean activo
) {}
