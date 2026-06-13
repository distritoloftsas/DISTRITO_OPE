package com.distritoloft.cliente.dto;

import com.distritoloft.usuario.Usuario;

public record ClienteResponse(
        Long id,
        String nombre,
        String telefono,
        String email,
        String direccionPrincipal,
        Integer lavadosAcumulados,
        boolean conPortal
) {
    public static ClienteResponse from(Usuario u) {
        Integer lavados = (u.getClientePerfil() != null) ? u.getClientePerfil().getLavadosAcumulados() : 0;
        String direccion = (u.getClientePerfil() != null) ? u.getClientePerfil().getDireccionPrincipal() : null;
        boolean conPortal = u.getEmail() != null && u.getPasswordHash() != null;

        return new ClienteResponse(
                u.getId(),
                u.getNombre(),
                u.getTelefono(),
                u.getEmail(),
                direccion,
                lavados,
                conPortal
        );
    }
}
