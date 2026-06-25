package com.distritoloft.auth;

import com.distritoloft.auth.dto.*;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.usuario.ClientePerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioPermisoRepository;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioPermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${distrito.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${distrito.setup.super-admin-email}")
    private String superAdminEmail;

    @Transactional
    public AuthResponse setupPrimerAdmin(SetupRequest req) {
        if (usuarioRepository.count() > 0) {
            throw new ReglaNegocioException("El setup inicial ya fue ejecutado.");
        }

        Usuario admin = new Usuario();
        admin.setEmail(superAdminEmail);
        admin.setNombre(req.nombre());
        admin.setTelefono(req.telefono());
        admin.setPasswordHash(passwordEncoder.encode(req.password()));
        admin.setRol(RolUsuario.SUPER_ADMIN);
        admin.setActivo(true);
        admin.setUltimoLogin(OffsetDateTime.now());

        Usuario guardado = usuarioRepository.save(admin);
        String token = jwtService.generarToken(guardado);

        return new AuthResponse(token, expirationMs, UsuarioResponse.from(guardado, permisoRepository.findByUsuarioId(guardado.getId())));
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (BadCredentialsException ex) {
            throw new ReglaNegocioException("Email o contraseña incorrectos.");
        }

        Usuario usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

        usuario.setUltimoLogin(OffsetDateTime.now());
        String token = jwtService.generarToken(usuario);

        return new AuthResponse(token, expirationMs, UsuarioResponse.from(usuario, permisoRepository.findByUsuarioId(usuario.getId())));
    }

    @Transactional
    public AuthResponse registrarCliente(RegistroClienteRequest req) {
        // Si ya existe un cliente rápido con ese teléfono (sin email ni password)
        // hacemos "upgrade" agregándole email + password y un ClientePerfil si no lo tenía.
        Usuario usuario = usuarioRepository.findByTelefono(req.telefono()).orElse(null);

        if (usuario != null) {
            if (usuario.getRol() != RolUsuario.CLIENTE) {
                throw new ReglaNegocioException("Ese teléfono ya está registrado para otro tipo de cuenta.");
            }
            if (usuario.getEmail() != null && usuario.getPasswordHash() != null) {
                throw new ReglaNegocioException("Ese teléfono ya tiene una cuenta activa. Inicia sesión.");
            }
            if (usuarioRepository.existsByEmail(req.email())) {
                throw new ReglaNegocioException("Ya existe un usuario con ese email.");
            }
            usuario.setEmail(req.email());
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
            usuario.setNombre(req.nombre());
        } else {
            if (usuarioRepository.existsByEmail(req.email())) {
                throw new ReglaNegocioException("Ya existe un usuario con ese email.");
            }
            usuario = new Usuario();
            usuario.setEmail(req.email());
            usuario.setNombre(req.nombre());
            usuario.setTelefono(req.telefono());
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
            usuario.setRol(RolUsuario.CLIENTE);
            usuario.setActivo(true);
            usuario.setMustChangePassword(false);
        }

        if (usuario.getClientePerfil() == null) {
            ClientePerfil perfil = new ClientePerfil();
            perfil.setUsuario(usuario);
            usuario.setClientePerfil(perfil);
        }

        Usuario guardado = usuarioRepository.save(usuario);
        guardado.setUltimoLogin(OffsetDateTime.now());

        String token = jwtService.generarToken(guardado);
        return new AuthResponse(token, expirationMs, UsuarioResponse.from(guardado, permisoRepository.findByUsuarioId(guardado.getId())));
    }

    @Transactional
    public UsuarioResponse cambiarPassword(Long usuarioId, CambiarPasswordRequest req) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

        if (!passwordEncoder.matches(req.passwordActual(), u.getPasswordHash())) {
            throw new ReglaNegocioException("La contraseña actual no es correcta.");
        }
        if (passwordEncoder.matches(req.passwordNueva(), u.getPasswordHash())) {
            throw new ReglaNegocioException("La nueva contraseña debe ser distinta a la actual.");
        }

        u.setPasswordHash(passwordEncoder.encode(req.passwordNueva()));
        u.setMustChangePassword(false);
        return UsuarioResponse.from(u, permisoRepository.findByUsuarioId(u.getId()));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerActual(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));
        return UsuarioResponse.from(u, permisoRepository.findByUsuarioId(u.getId()));
    }
}
