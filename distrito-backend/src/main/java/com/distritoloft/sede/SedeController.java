package com.distritoloft.sede;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.sede.dto.CrearSedeRequest;
import com.distritoloft.sede.dto.SedeResumenAdminResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final SedeService service;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<SedeResumenAdminResponse> kpisAdmin(@AuthenticationPrincipal CustomUserDetails principal) {
        return service.listarConKpis(principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SedeCreadaResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CrearSedeRequest req) {
        Sede s = service.crear(principal, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new SedeCreadaResponse(s.getId(), s.getNombre(), s.getCiudad(), s.getActiva())
        );
    }

    @PatchMapping("/{id}/activa")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public SedeCreadaResponse cambiarActiva(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestBody @NotNull CambioActivaRequest req) {
        Sede s = service.cambiarActiva(principal, id, req.activa());
        return new SedeCreadaResponse(s.getId(), s.getNombre(), s.getCiudad(), s.getActiva());
    }

    @GetMapping("/mi-sede")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE','EMPLEADO','SUPER_ADMIN')")
    public MiSedeResponse miSede(@AuthenticationPrincipal CustomUserDetails principal) {
        return service.miSede(principal);
    }

    @PatchMapping("/{id}/tolerancia")
    @PreAuthorize("@permisoChecker.tiene('GESTIONAR_TOLERANCIA')")
    public MiSedeResponse actualizarTolerancia(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody ToleranciaRequest req) {
        return service.actualizarTolerancia(principal, id, req.pre(), req.post());
    }

    public record SedeCreadaResponse(Long id, String nombre, String ciudad, Boolean activa) {}
    public record CambioActivaRequest(@NotNull Boolean activa) {}
    public record MiSedeResponse(Long id, String nombre, Integer toleranciaPreLavadoMinutos, Integer toleranciaPostLavadoMinutos) {}
    public record ToleranciaRequest(
            @NotNull @jakarta.validation.constraints.Min(0) Integer pre,
            @NotNull @jakarta.validation.constraints.Min(0) Integer post) {}
}
