package com.distritoloft.insumo.dto;

import com.distritoloft.common.enums.UnidadInsumo;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CrearInsumoRequest(
        @NotBlank @Size(max = 80) String nombre,
        @NotNull UnidadInsumo unidad,
        @NotNull @PositiveOrZero BigDecimal stockInicial,
        @NotNull @PositiveOrZero BigDecimal stockMinimo,
        @NotNull @PositiveOrZero BigDecimal costoUnitario,
        Long sedeId
) {}
