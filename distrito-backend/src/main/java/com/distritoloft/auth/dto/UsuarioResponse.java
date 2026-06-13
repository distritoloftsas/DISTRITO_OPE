package com.distritoloft.auth.dto;

import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.usuario.Usuario;

public record UsuarioResponse(
        Long id,
        String email,
        String nombre,
        RolUsuario rol,
        Long sedeId,
        Boolean mustChangePassword,
        Boolean activo
) {
    public static UsuarioResponse from(Usuario u) {
        Long sedeId = (u.getEmpleadoPerfil() != null && u.getEmpleadoPerfil().getSede() != null)
                ? u.getEmpleadoPerfil().getSede().getId()
                : null;

        return new UsuarioResponse(
                u.getId(),
                u.getEmail(),
                u.getNombre(),
                u.getRol(),
                sedeId,
                u.getMustChangePassword(),
                u.getActivo()
        );
    }
}
