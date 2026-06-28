package com.distritoloft.plan.dto;

import com.distritoloft.common.enums.FaseConsumo;
import com.distritoloft.common.enums.UnidadInsumo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CrearPlanConsumoRequest(
        @NotNull Long insumoId,
        @NotNull FaseConsumo fase,
        @NotNull @Positive BigDecimal cantidad,
        @NotNull UnidadInsumo unidad
) {}
