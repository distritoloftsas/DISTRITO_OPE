package com.distritoloft.auth.dto;

import com.distritoloft.common.enums.Permiso;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.usuario.Usuario;

import java.util.EnumSet;
import java.util.Set;

public record UsuarioResponse(
        Long id,
        String email,
        String nombre,
        RolUsuario rol,
        Long sedeId,
        String sedeNombre,
        Boolean mustChangePassword,
        Boolean activo,
        Set<Permiso> permisos
) {
    public static UsuarioResponse from(Usuario u, Set<Permiso> permisos) {
        Long sedeId = null;
        String sedeNombre = null;
        if (u.getEmpleadoPerfil() != null && u.getEmpleadoPerfil().getSede() != null) {
            sedeId = u.getEmpleadoPerfil().getSede().getId();
            sedeNombre = u.getEmpleadoPerfil().getSede().getNombre();
        }

        // El SUPER_ADMIN siempre los tiene todos.
        Set<Permiso> efectivos = u.getRol() == RolUsuario.SUPER_ADMIN
                ? EnumSet.allOf(Permiso.class)
                : (permisos != null ? permisos : Set.of());

        return new UsuarioResponse(
                u.getId(),
                u.getEmail(),
                u.getNombre(),
                u.getRol(),
                sedeId,
                sedeNombre,
                u.getMustChangePassword(),
                u.getActivo(),
                efectivos
        );
    }
}
