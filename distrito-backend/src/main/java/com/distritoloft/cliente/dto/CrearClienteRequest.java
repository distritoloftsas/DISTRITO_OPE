package com.distritoloft.cliente.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearClienteRequest(
        @NotBlank @Size(min = 2, max = 120) String nombre,
        @NotBlank @Size(min = 7, max = 20) String telefono,
        @Email String email,
        String direccionPrincipal
) {}
