package com.distritoloft.turno.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AbrirTurnoRequest(
        @NotNull @DecimalMin(value = "0", message = "El efectivo de apertura no puede ser negativo")
        BigDecimal efectivoApertura
) {}
