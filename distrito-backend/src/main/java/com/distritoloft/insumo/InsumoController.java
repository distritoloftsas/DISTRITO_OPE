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
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public List<InsumoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long sedeId) {
        return service.listar(principal, sedeId);
    }

    @GetMapping("/stock-bajo")
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public List<InsumoResponse> stockBajo(@AuthenticationPrincipal CustomUserDetails principal) {
        return service.stockBajoDeMiSede(principal);
    }

    @PostMapping
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public ResponseEntity<InsumoResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CrearInsumoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(principal, req));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public InsumoResponse actualizar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarInsumoRequest req) {
        return service.actualizar(principal, id, req);
    }

    @PostMapping("/{id}/movimientos")
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public ResponseEntity<InsumoResponse> registrarMovimiento(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody CrearMovimientoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                service.registrarMovimiento(principal, id, req)
        );
    }

    @GetMapping("/{id}/historial")
    @PreAuthorize("@permisoChecker.tiene('VER_INVENTARIO')")
    public List<MovimientoResponse> historial(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        return service.historial(principal, id);
    }
}
