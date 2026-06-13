package com.distritoloft.maquina;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.maquina.dto.MaquinaResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maquinas")
@RequiredArgsConstructor
public class MaquinaController {

    private final MaquinaService service;

    @GetMapping
    public List<MaquinaResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long sedeId) {
        return service.listarDeMiSede(principal, sedeId);
    }

    @PatchMapping("/{id}/estado")
    public MaquinaResponse cambiarEstado(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @RequestBody @NotNull CambioEstadoMaquinaRequest req) {
        return service.cambiarEstado(principal, id, req.estado());
    }

    public record CambioEstadoMaquinaRequest(@NotNull EstadoMaquina estado) {}
}
