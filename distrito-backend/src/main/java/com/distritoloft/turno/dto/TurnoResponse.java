package com.distritoloft.turno.dto;

import com.distritoloft.turno.TurnoCaja;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record TurnoResponse(
        Long id,
        Long sedeId,
        String sedeNombre,
        Long empleadoId,
        String empleadoNombre,
        OffsetDateTime fechaApertura,
        BigDecimal efectivoApertura,
        OffsetDateTime fechaCierre,
        BigDecimal efectivoCierreDeclarado,
        BigDecimal efectivoEsperado,
        BigDecimal diferencia,
        String observaciones,
        // Datos en vivo si esta abierto
        BigDecimal efectivoCobradoEnTurno,
        BigDecimal totalGastosEnTurno,
        List<GastoResponse> gastos
) {
    public static TurnoResponse from(TurnoCaja t,
                                     BigDecimal efectivoCobrado,
                                     BigDecimal totalGastos,
                                     List<GastoResponse> gastos) {
        return new TurnoResponse(
                t.getId(),
                t.getSede().getId(),
                t.getSede().getNombre(),
                t.getEmpleado().getId(),
                t.getEmpleado().getNombre(),
                t.getFechaApertura(),
                t.getEfectivoApertura(),
                t.getFechaCierre(),
                t.getEfectivoCierreDeclarado(),
                t.getEfectivoEsperado(),
                t.getDiferencia(),
                t.getObservaciones(),
                efectivoCobrado,
                totalGastos,
                gastos
        );
    }
}
