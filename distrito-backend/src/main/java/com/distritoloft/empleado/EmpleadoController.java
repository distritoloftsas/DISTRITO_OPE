package com.distritoloft.empleado;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.Permiso;
import com.distritoloft.empleado.dto.CrearEmpleadoRequest;
import com.distritoloft.empleado.dto.EmpleadoResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService service;

    @PostMapping
    public ResponseEntity<EmpleadoResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CrearEmpleadoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(principal, req));
    }

    @GetMapping
    public List<EmpleadoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long sedeId) {
        return service.listar(principal, sedeId);
    }

    @PatchMapping("/{id}/activo")
    public EmpleadoResponse cambiarActivo(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestBody @NotNull CambioActivoRequest req) {
        return service.cambiarActivo(principal, id, req.activo());
    }

    @PatchMapping("/{id}/permisos")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public EmpleadoResponse actualizarPermisos(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestBody @NotNull PermisosRequest req) {
        Set<Permiso> permisos = req.permisos() == null
                ? EnumSet.noneOf(Permiso.class)
                : EnumSet.copyOf(req.permisos());
        return service.actualizarPermisos(principal, id, permisos);
    }

    public record CambioActivoRequest(@NotNull Boolean activo) {}
    public record PermisosRequest(@NotNull Set<Permiso> permisos) {}
}
