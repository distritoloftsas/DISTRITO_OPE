package com.distritoloft.turno.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CerrarTurnoRequest(
        @NotNull @DecimalMin(value = "0", message = "El efectivo declarado no puede ser negativo")
        BigDecimal efectivoCierreDeclarado,
        String observaciones
) {}
