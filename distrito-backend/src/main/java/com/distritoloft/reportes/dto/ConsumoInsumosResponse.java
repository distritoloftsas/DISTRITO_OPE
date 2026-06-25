package com.distritoloft.reportes.dto;

import com.distritoloft.common.enums.UnidadInsumo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ConsumoInsumosResponse(
        LocalDate desde,
        LocalDate hasta,
        Long sedeId,
        String sedeNombre,
        BigDecimal costoTotal,
        long pedidosAfectados,
        List<LineaInsumo> lineas
) {
    public record LineaInsumo(
            Long insumoId,
            String insumoNombre,
            UnidadInsumo unidad,
            BigDecimal cantidadTotal,
            BigDecimal costoTotal,
            long movimientos,
            long pedidosAfectados
    ) {}
}
