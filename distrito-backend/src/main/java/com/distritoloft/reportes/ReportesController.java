package com.distritoloft.reportes;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.reportes.dto.CierreCajaResponse;
import com.distritoloft.reportes.dto.ConsumoInsumosResponse;
import com.distritoloft.reportes.dto.VentasResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Cierre de caja: lo necesita la empleada al final del turno para verificar
    // las ventas del dia. Ventas y consumo de insumos son data de gestion mas
    // sensible: solo gerente/super.
    private static final String CIERRE_ROLES =
            "hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')";
    private static final String GESTION_ROLES =
            "hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')";

    private final ReportesService service;
    private final ExcelExportService excelService;

    @GetMapping("/cierre-caja")
    @PreAuthorize(CIERRE_ROLES)
    public CierreCajaResponse cierreCaja(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId) {
        return service.cierreCaja(principal, fecha, sedeId);
    }

    @GetMapping(value = "/cierre-caja.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(CIERRE_ROLES)
    public ResponseEntity<byte[]> cierreCajaXlsx(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId) {
        CierreCajaResponse data = service.cierreCaja(principal, fecha, sedeId);
        byte[] bytes = excelService.cierreCajaXlsx(data);
        String filename = "cierre-caja-" + data.fecha() + ".xlsx";
        return xlsxResponse(filename, bytes);
    }

    @GetMapping("/consumo-insumos")
    @PreAuthorize(GESTION_ROLES)
    public ConsumoInsumosResponse consumoInsumos(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        return service.consumoInsumos(principal, desde, hasta, sedeId);
    }

    @GetMapping(value = "/consumo-insumos.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(GESTION_ROLES)
    public ResponseEntity<byte[]> consumoInsumosXlsx(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        ConsumoInsumosResponse data = service.consumoInsumos(principal, desde, hasta, sedeId);
        byte[] bytes = excelService.consumoInsumosXlsx(data);
        String filename = "gasto-insumos-" + data.desde() + "_" + data.hasta() + ".xlsx";
        return xlsxResponse(filename, bytes);
    }

    @GetMapping("/ventas")
    @PreAuthorize(GESTION_ROLES)
    public VentasResponse ventas(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        return service.ventas(principal, desde, hasta, sedeId);
    }

    @GetMapping(value = "/ventas.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(GESTION_ROLES)
    public ResponseEntity<byte[]> ventasXlsx(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        VentasResponse data = service.ventas(principal, desde, hasta, sedeId);
        byte[] bytes = excelService.ventasXlsx(data);
        String filename = "ventas-" + data.desde() + "_" + data.hasta() + ".xlsx";
        return xlsxResponse(filename, bytes);
    }

    private ResponseEntity<byte[]> xlsxResponse(String filename, byte[] bytes) {
        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }
}
