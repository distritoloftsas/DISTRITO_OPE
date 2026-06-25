package com.distritoloft.plan;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.plan.dto.CrearPlanConsumoRequest;
import com.distritoloft.plan.dto.PlanConsumoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
@RequiredArgsConstructor
public class PlanConsumoController {

    private final PlanConsumoService service;

    @GetMapping("/{planId}/consumos")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<PlanConsumoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long planId) {
        return service.listar(principal, planId);
    }

    @PostMapping("/{planId}/consumos")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<PlanConsumoResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long planId,
            @Valid @RequestBody CrearPlanConsumoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(principal, planId, req));
    }

    @DeleteMapping("/consumos/{id}")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<Void> eliminar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        service.eliminar(principal, id);
        return ResponseEntity.noContent().build();
    }
}
