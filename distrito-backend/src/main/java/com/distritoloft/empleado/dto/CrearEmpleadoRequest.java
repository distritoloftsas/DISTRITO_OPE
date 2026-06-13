package com.distritoloft.empleado.dto;

import com.distritoloft.common.enums.RolUsuario;
import jakarta.validation.constraints.*;

public record CrearEmpleadoRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 2, max = 120) String nombre,
        String telefono,
        Long sedeId,
        String cargo,
        @NotNull RolUsuario rol
) {}
