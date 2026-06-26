package com.distritoloft.auth.dto;

import jakarta.validation.constraints.*;

public record RegistroClienteRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 2, max = 120) String nombre,
        @NotBlank @Size(max = 20) String telefono,
        @AssertTrue(message = "Debes aceptar la política de tratamiento de datos.")
        Boolean aceptaHabeasData
) {}
