package com.distritoloft.cliente.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivarCuentaClienteRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 60) String password
) {}
