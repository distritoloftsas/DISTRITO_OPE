package com.distritoloft.plan.dto;

import com.distritoloft.common.enums.FaseConsumo;
import com.distritoloft.common.enums.UnidadInsumo;
import com.distritoloft.plan.PlanConsumo;

import java.math.BigDecimal;

public record PlanConsumoResponse(
        Long id,
        Long planId,
        Long insumoId,
        String insumoNombre,
        UnidadInsumo insumoUnidad,
        Long sedeId,
        String sedeNombre,
        FaseConsumo fase,
        BigDecimal cantidad,
        UnidadInsumo unidad
) {
    public static PlanConsumoResponse from(PlanConsumo pc) {
        return new PlanConsumoResponse(
                pc.getId(),
                pc.getPlan().getId(),
                pc.getInsumo().getId(),
                pc.getInsumo().getNombre(),
                pc.getInsumo().getUnidad(),
                pc.getInsumo().getSede().getId(),
                pc.getInsumo().getSede().getNombre(),
                pc.getFase(),
                pc.getCantidad(),
                pc.getUnidad()
        );
    }
}
