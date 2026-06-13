package com.distritoloft.empleado.dto;

import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.usuario.Usuario;

import java.time.OffsetDateTime;

public record EmpleadoResponse(
        Long id,
        String email,
        String nombre,
        String telefono,
        RolUsuario rol,
        Boolean activo,
        Boolean mustChangePassword,
        SedeResumen sede,
        String cargo,
        OffsetDateTime ultimoLogin,
        OffsetDateTime creadoEn
) {
    public record SedeResumen(Long id, String nombre) {}

    public static EmpleadoResponse from(Usuario u) {
        SedeResumen sede = null;
        String cargo = null;
        if (u.getEmpleadoPerfil() != null && u.getEmpleadoPerfil().getSede() != null) {
            sede = new SedeResumen(
                    u.getEmpleadoPerfil().getSede().getId(),
                    u.getEmpleadoPerfil().getSede().getNombre()
            );
            cargo = u.getEmpleadoPerfil().getCargo();
        }
        return new EmpleadoResponse(
                u.getId(),
                u.getEmail(),
                u.getNombre(),
                u.getTelefono(),
                u.getRol(),
                u.getActivo(),
                u.getMustChangePassword(),
                sede,
                cargo,
                u.getUltimoLogin(),
                u.getCreadoEn()
        );
    }
}
