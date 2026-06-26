package com.distritoloft.usuario;

import com.distritoloft.common.enums.Permiso;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Persistencia de permisos por usuario. Se usa JDBC directo para el ENUM
 * de PostgreSQL: cuando intentamos via JPA, Hibernate intenta inferir el
 * tipo y falla con "could not determine bind value" para ENUM nativo.
 */
@Repository
@RequiredArgsConstructor
public class UsuarioPermisoRepository {

    private final JdbcTemplate jdbc;

    @PersistenceContext
    private EntityManager em;

    public Set<Permiso> findByUsuarioId(Long usuarioId) {
        List<String> nombres = jdbc.queryForList(
                "SELECT permiso::text FROM usuario_permiso WHERE usuario_id = ?",
                String.class,
                usuarioId
        );
        Set<Permiso> resultado = EnumSet.noneOf(Permiso.class);
        for (String n : nombres) {
            try {
                resultado.add(Permiso.valueOf(n));
            } catch (IllegalArgumentException ignored) {
                // Si el ENUM en la DB tiene mas permisos que el codigo Java
                // (despliegue parcial), los ignoramos en lugar de explotar.
            }
        }
        return resultado;
    }

    @Transactional
    public void reemplazar(Long usuarioId, Set<Permiso> permisos) {
        jdbc.update("DELETE FROM usuario_permiso WHERE usuario_id = ?", usuarioId);
        if (permisos == null || permisos.isEmpty()) return;

        for (Permiso p : permisos) {
            jdbc.update(
                    "INSERT INTO usuario_permiso (usuario_id, permiso) VALUES (?, ?::permiso_usuario)",
                    usuarioId,
                    p.name()
            );
        }
    }
}
