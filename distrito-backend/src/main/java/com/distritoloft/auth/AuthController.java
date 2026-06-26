package com.distritoloft.auth;

import com.distritoloft.auth.dto.*;
import com.distritoloft.common.exception.DemasiadosIntentosException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimiter rateLimiter;

    // Limites por IP por minuto. Suficientes para uso normal, agresivos
    // contra brute force y bots.
    private static final int LOGIN_MAX_POR_MINUTO = 10;
    private static final int REGISTRO_MAX_POR_MINUTO = 5;
    private static final int SETUP_MAX_POR_MINUTO = 3;

    @PostMapping("/setup")
    public ResponseEntity<AuthResponse> setup(@Valid @RequestBody SetupRequest req, HttpServletRequest http) {
        protegerRate("setup", clienteIp(http), SETUP_MAX_POR_MINUTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.setupPrimerAdmin(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        protegerRate("login", clienteIp(http), LOGIN_MAX_POR_MINUTO);
        return authService.login(req);
    }

    @PostMapping("/registro-cliente")
    public ResponseEntity<AuthResponse> registroCliente(@Valid @RequestBody RegistroClienteRequest req, HttpServletRequest http) {
        protegerRate("registro", clienteIp(http), REGISTRO_MAX_POR_MINUTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrarCliente(req));
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal CustomUserDetails principal) {
        return authService.obtenerActual(principal.getUsuario().getId());
    }

    @PostMapping("/cambiar-password")
    public UsuarioResponse cambiarPassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CambiarPasswordRequest req) {
        return authService.cambiarPassword(principal.getUsuario().getId(), req);
    }

    private void protegerRate(String accion, String ip, int max) {
        if (!rateLimiter.allow(accion + ":" + ip, max, Duration.ofMinutes(1))) {
            throw new DemasiadosIntentosException(
                    "Demasiados intentos. Espera un minuto antes de volver a intentar."
            );
        }
    }

    /**
     * Detras de Cloudflare/Railway la IP real viene en X-Forwarded-For.
     * El header tiene una lista; la primera es el cliente original.
     */
    private static String clienteIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) {
            int coma = fwd.indexOf(',');
            return (coma > 0 ? fwd.substring(0, coma) : fwd).trim();
        }
        return req.getRemoteAddr();
    }
}
