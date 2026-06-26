package com.distritoloft.insumo.dto;

import com.distritoloft.common.enums.TipoMovimientoInsumo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CrearMovimientoRequest(
        @NotNull TipoMovimientoInsumo tipo,
        @NotNull @Positive BigDecimal cantidad,
        @PositiveOrZero BigDecimal costoUnitario,
        String motivo
) {}
