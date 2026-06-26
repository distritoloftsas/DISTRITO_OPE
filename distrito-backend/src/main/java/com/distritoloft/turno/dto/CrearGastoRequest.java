package com.distritoloft.turno.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CrearGastoRequest(
        @NotBlank @Size(min = 2, max = 160) String concepto,
        @NotNull @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
        BigDecimal monto
) {}
