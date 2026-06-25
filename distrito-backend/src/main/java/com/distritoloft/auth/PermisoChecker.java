package com.distritoloft.auth;

import com.distritoloft.common.enums.Permiso;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.usuario.UsuarioPermisoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Evaluador de permisos atomicos para usar dentro de @PreAuthorize.
 * Ejemplo:  @PreAuthorize("@permisoChecker.tiene('VER_REPORTES_VENTAS')")
 *
 * El SUPER_ADMIN siempre pasa. Para el resto consulta la tabla
 * usuario_permiso. Los clientes no tienen permisos operativos.
 */
@Component("permisoChecker")
@RequiredArgsConstructor
public class PermisoChecker {

    private final UsuarioPermisoRepository permisoRepository;

    public boolean tiene(String nombrePermiso) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            return false;
        }
        if (principal.getUsuario().getRol() == RolUsuario.SUPER_ADMIN) {
            return true;
        }
        if (principal.getUsuario().getRol() == RolUsuario.CLIENTE) {
            return false;
        }
        Permiso permiso;
        try {
            permiso = Permiso.valueOf(nombrePermiso);
        } catch (IllegalArgumentException ex) {
            return false;
        }
        Set<Permiso> permisos = permisoRepository.findByUsuarioId(principal.getUsuario().getId());
        return permisos.contains(permiso);
    }

    /** Combinacion AND para endpoints que exigen mas de uno. */
    public boolean tieneTodos(String... nombres) {
        for (String n : nombres) {
            if (!tiene(n)) return false;
        }
        return true;
    }
}
