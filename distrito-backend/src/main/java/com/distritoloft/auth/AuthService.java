package com.distritoloft.auth;

import com.distritoloft.auth.dto.*;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.usuario.Usuario;
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

        return new AuthResponse(token, expirationMs, UsuarioResponse.from(guardado));
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

        return new AuthResponse(token, expirationMs, UsuarioResponse.from(usuario));
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
        return UsuarioResponse.from(u);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerActual(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));
        return UsuarioResponse.from(u);
    }
}
