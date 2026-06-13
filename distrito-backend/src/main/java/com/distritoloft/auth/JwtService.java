package com.distritoloft.auth;

import com.distritoloft.usuario.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
@Slf4j
public class JwtService {

    @Value("${distrito.jwt.secret}")
    private String secret;

    @Value("${distrito.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key;

    @PostConstruct
    void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("distrito.jwt.secret debe tener al menos 32 bytes (256 bits) para HS256.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String generarToken(Usuario usuario) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claims(Map.of(
                        "email", usuario.getEmail(),
                        "rol", usuario.getRol().name()
                ))
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public Claims validarYExtraer(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extraerUsuarioId(String token) {
        return Long.valueOf(validarYExtraer(token).getSubject());
    }
}
