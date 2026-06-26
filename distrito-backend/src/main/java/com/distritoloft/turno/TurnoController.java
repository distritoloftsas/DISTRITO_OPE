package com.distritoloft.turno;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.turno.dto.AbrirTurnoRequest;
import com.distritoloft.turno.dto.CerrarTurnoRequest;
import com.distritoloft.turno.dto.CrearGastoRequest;
import com.distritoloft.turno.dto.GastoResponse;
import com.distritoloft.turno.dto.TurnoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
public class TurnoController {

    private final TurnoService service;

    @PostMapping
    public ResponseEntity<TurnoResponse> abrir(@AuthenticationPrincipal CustomUserDetails principal,
                                               @Valid @RequestBody AbrirTurnoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.abrir(principal, req));
    }

    @GetMapping("/actual")
    public ResponseEntity<TurnoResponse> actual(@AuthenticationPrincipal CustomUserDetails principal) {
        return service.turnoActual(principal)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PatchMapping("/{id}/cerrar")
    public TurnoResponse cerrar(@AuthenticationPrincipal CustomUserDetails principal,
                                @PathVariable Long id,
                                @Valid @RequestBody CerrarTurnoRequest req) {
        return service.cerrar(principal, id, req);
    }

    @PostMapping("/{id}/gastos")
    public ResponseEntity<GastoResponse> registrarGasto(@AuthenticationPrincipal CustomUserDetails principal,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody CrearGastoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                service.registrarGasto(principal, id, req)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<TurnoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long sedeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime hasta) {
        return service.listarPorSedeEnRango(principal, sedeId, desde, hasta);
    }
}
