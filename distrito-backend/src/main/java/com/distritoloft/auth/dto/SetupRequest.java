package com.distritoloft.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetupRequest(
        @NotBlank @Size(min = 2, max = 120) String nombre,
        @NotBlank @Size(min = 8, max = 100) String password,
        String telefono
) {}
