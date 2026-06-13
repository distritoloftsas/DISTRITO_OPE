package com.distritoloft.auth.dto;

import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.usuario.Usuario;

public record UsuarioResponse(
        Long id,
        String email,
        String nombre,
        RolUsuario rol,
        Long sedeId,
        String sedeNombre,
        Boolean mustChangePassword,
        Boolean activo
) {
    public static UsuarioResponse from(Usuario u) {
        Long sedeId = null;
        String sedeNombre = null;
        if (u.getEmpleadoPerfil() != null && u.getEmpleadoPerfil().getSede() != null) {
            sedeId = u.getEmpleadoPerfil().getSede().getId();
            sedeNombre = u.getEmpleadoPerfil().getSede().getNombre();
        }

        return new UsuarioResponse(
                u.getId(),
                u.getEmail(),
                u.getNombre(),
                u.getRol(),
                sedeId,
                sedeNombre,
                u.getMustChangePassword(),
                u.getActivo()
        );
    }
}
