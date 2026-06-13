package com.distritoloft.auth;

import com.distritoloft.auth.dto.*;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.sede.Sede;
import com.distritoloft.sede.SedeRepository;
import com.distritoloft.usuario.EmpleadoPerfil;
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
    private final SedeRepository sedeRepository;
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
    public UsuarioResponse registrarEmpleado(RegistroEmpleadoRequest req) {
        if (req.rol() != RolUsuario.EMPLEADO && req.rol() != RolUsuario.GERENTE_SEDE) {
            throw new ReglaNegocioException("Solo se pueden registrar usuarios con rol EMPLEADO o GERENTE_SEDE por esta vía.");
        }

        if (usuarioRepository.existsByEmail(req.email())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email.");
        }

        Sede sede = sedeRepository.findById(req.sedeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + req.sedeId()));

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setNombre(req.nombre());
        usuario.setTelefono(req.telefono());
        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setRol(req.rol());
        usuario.setActivo(true);

        EmpleadoPerfil perfil = new EmpleadoPerfil();
        perfil.setUsuario(usuario);
        perfil.setSede(sede);
        perfil.setCargo(req.cargo());
        usuario.setEmpleadoPerfil(perfil);

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponse.from(guardado);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerActual(Long usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));
        return UsuarioResponse.from(u);
    }
}
