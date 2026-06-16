package com.distritoloft.sede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearSedeRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank String direccion,
        @NotBlank @Size(max = 80) String ciudad,
        @Size(max = 20) String telefono
) {}
