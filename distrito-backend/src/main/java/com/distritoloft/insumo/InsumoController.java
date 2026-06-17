package com.distritoloft.insumo;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.insumo.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<InsumoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long sedeId) {
        return service.listar(principal, sedeId);
    }

    @GetMapping("/stock-bajo")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<InsumoResponse> stockBajo(@AuthenticationPrincipal CustomUserDetails principal) {
        return service.stockBajoDeMiSede(principal);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<InsumoResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CrearInsumoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(principal, req));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public InsumoResponse actualizar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarInsumoRequest req) {
        return service.actualizar(principal, id, req);
    }

    @PostMapping("/{id}/movimientos")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<InsumoResponse> registrarMovimiento(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody CrearMovimientoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                service.registrarMovimiento(principal, id, req)
        );
    }

    @GetMapping("/{id}/historial")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<MovimientoResponse> historial(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        return service.historial(principal, id);
    }
}
