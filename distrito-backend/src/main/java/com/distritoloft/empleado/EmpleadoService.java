package com.distritoloft.empleado;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.empleado.dto.CrearEmpleadoRequest;
import com.distritoloft.empleado.dto.EmpleadoResponse;
import com.distritoloft.sede.Sede;
import com.distritoloft.sede.SedeRepository;
import com.distritoloft.usuario.EmpleadoPerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final UsuarioRepository usuarioRepository;
    private final SedeRepository sedeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmpleadoResponse crear(CustomUserDetails principal, CrearEmpleadoRequest req) {
        Usuario quienCrea = cargarUsuarioActual(principal);

        if (quienCrea.getRol() != RolUsuario.SUPER_ADMIN
                && quienCrea.getRol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden crear empleados.");
        }

        if (req.rol() != RolUsuario.EMPLEADO && req.rol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("Solo se pueden crear usuarios con rol EMPLEADO o GERENTE_SEDE.");
        }

        // Gerente solo puede crear EMPLEADO (no otros gerentes)
        if (quienCrea.getRol() == RolUsuario.GERENTE_SEDE && req.rol() != RolUsuario.EMPLEADO) {
            throw new ReglaNegocioException("Como gerente solo puedes crear empleados.");
        }

        Long sedeIdResuelta = resolverSedeDestino(quienCrea, req.sedeId());
        Sede sede = sedeRepository.findById(sedeIdResuelta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeIdResuelta));

        if (usuarioRepository.existsByEmail(req.email())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email.");
        }
        if (req.telefono() != null && !req.telefono().isBlank()
                && usuarioRepository.existsByTelefono(req.telefono())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese teléfono.");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setNombre(req.nombre());
        usuario.setTelefono(blankToNull(req.telefono()));
        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setRol(req.rol());
        usuario.setActivo(true);
        usuario.setMustChangePassword(true);

        EmpleadoPerfil perfil = new EmpleadoPerfil();
        perfil.setUsuario(usuario);
        perfil.setSede(sede);
        perfil.setCargo(blankToNull(req.cargo()));
        usuario.setEmpleadoPerfil(perfil);

        Usuario guardado = usuarioRepository.save(usuario);
        return EmpleadoResponse.from(guardado);
    }

    @Transactional(readOnly = true)
    public List<EmpleadoResponse> listar(CustomUserDetails principal, Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);

        if (actual.getRol() != RolUsuario.SUPER_ADMIN
                && actual.getRol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("No tienes permisos para listar empleados.");
        }

        Long sedeId = actual.getRol() == RolUsuario.GERENTE_SEDE
                ? sedeDelEmpleado(actual).getId()
                : sedeIdParam;

        return usuarioRepository.listarEmpleados(
                List.of(RolUsuario.EMPLEADO, RolUsuario.GERENTE_SEDE),
                sedeId
        ).stream().map(EmpleadoResponse::from).toList();
    }

    @Transactional
    public EmpleadoResponse cambiarActivo(CustomUserDetails principal, Long empleadoId, boolean activo) {
        Usuario quienCambia = cargarUsuarioActual(principal);

        if (quienCambia.getRol() != RolUsuario.SUPER_ADMIN
                && quienCambia.getRol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden cambiar el estado de un empleado.");
        }

        Usuario objetivo = usuarioRepository.findById(empleadoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado no encontrado: " + empleadoId));

        if (objetivo.getRol() != RolUsuario.EMPLEADO && objetivo.getRol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("Este usuario no es un empleado.");
        }

        if (objetivo.getId().equals(quienCambia.getId())) {
            throw new ReglaNegocioException("No puedes desactivarte a ti mismo.");
        }

        if (quienCambia.getRol() == RolUsuario.GERENTE_SEDE) {
            // Gerente no puede tocar otros gerentes ni empleados de otra sede
            if (objetivo.getRol() == RolUsuario.GERENTE_SEDE) {
                throw new ReglaNegocioException("Como gerente no puedes cambiar el estado de otro gerente.");
            }
            Sede sedeGerente = sedeDelEmpleado(quienCambia);
            Sede sedeObjetivo = objetivo.getEmpleadoPerfil() != null ? objetivo.getEmpleadoPerfil().getSede() : null;
            if (sedeObjetivo == null || !sedeGerente.getId().equals(sedeObjetivo.getId())) {
                throw new ReglaNegocioException("No puedes operar sobre empleados de otra sede.");
            }
        }

        objetivo.setActivo(activo);
        return EmpleadoResponse.from(objetivo);
    }

    private Long resolverSedeDestino(Usuario quienCrea, Long sedeIdRequest) {
        if (quienCrea.getRol() == RolUsuario.GERENTE_SEDE) {
            // Siempre fuerza la sede del gerente, ignora la del request.
            return sedeDelEmpleado(quienCrea).getId();
        }
        if (sedeIdRequest == null) {
            throw new ReglaNegocioException("Debes indicar la sede del nuevo empleado.");
        }
        return sedeIdRequest;
    }

    private Sede sedeDelEmpleado(Usuario u) {
        if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
            throw new ReglaNegocioException("El usuario actual no tiene sede asignada.");
        }
        return u.getEmpleadoPerfil().getSede();
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
