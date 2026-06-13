package com.distritoloft.auth;

import com.distritoloft.auth.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/setup")
    public ResponseEntity<AuthResponse> setup(@Valid @RequestBody SetupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.setupPrimerAdmin(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
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
}
