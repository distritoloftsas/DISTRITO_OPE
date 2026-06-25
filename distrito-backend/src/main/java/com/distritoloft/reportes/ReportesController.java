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

    // Permisos finos (PermisoChecker). El super admin siempre pasa.
    private static final String VER_CIERRE = "@permisoChecker.tiene('VER_CIERRE_CAJA')";
    private static final String VER_VENTAS = "@permisoChecker.tiene('VER_REPORTES_VENTAS')";
    private static final String VER_INSUMOS = "@permisoChecker.tiene('VER_REPORTES_INSUMOS')";
    private static final String EXP_CIERRE = "@permisoChecker.tieneTodos('VER_CIERRE_CAJA','EXPORTAR_REPORTES')";
    private static final String EXP_VENTAS = "@permisoChecker.tieneTodos('VER_REPORTES_VENTAS','EXPORTAR_REPORTES')";
    private static final String EXP_INSUMOS = "@permisoChecker.tieneTodos('VER_REPORTES_INSUMOS','EXPORTAR_REPORTES')";

    private final ReportesService service;
    private final ExcelExportService excelService;

    @GetMapping("/cierre-caja")
    @PreAuthorize(VER_CIERRE)
    public CierreCajaResponse cierreCaja(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId) {
        return service.cierreCaja(principal, fecha, sedeId);
    }

    @GetMapping(value = "/cierre-caja.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(EXP_CIERRE)
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
    @PreAuthorize(VER_INSUMOS)
    public ConsumoInsumosResponse consumoInsumos(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        return service.consumoInsumos(principal, desde, hasta, sedeId);
    }

    @GetMapping(value = "/consumo-insumos.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(EXP_INSUMOS)
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
    @PreAuthorize(VER_VENTAS)
    public VentasResponse ventas(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long sedeId) {
        return service.ventas(principal, desde, hasta, sedeId);
    }

    @GetMapping(value = "/ventas.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize(EXP_VENTAS)
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
