package com.distritoloft.reportes;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.reportes.dto.CierreCajaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService service;

    @GetMapping("/cierre-caja")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public CierreCajaResponse cierreCaja(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId) {
        return service.cierreCaja(principal, fecha, sedeId);
    }
}
