package com.distritoloft.auth.dto;

public record AuthResponse(
        String token,
        long expiresInMs,
        UsuarioResponse usuario
) {}
