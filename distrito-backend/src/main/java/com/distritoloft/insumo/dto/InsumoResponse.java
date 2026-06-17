package com.distritoloft.insumo.dto;

import com.distritoloft.common.enums.UnidadInsumo;
import com.distritoloft.insumo.Insumo;

import java.math.BigDecimal;

public record InsumoResponse(
        Long id,
        Long sedeId,
        String sedeNombre,
        String nombre,
        UnidadInsumo unidad,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        BigDecimal costoUnitario,
        BigDecimal valorInventario,
        Boolean stockBajo,
        Boolean activo
) {
    public static InsumoResponse from(Insumo i) {
        BigDecimal valor = i.getStockActual().multiply(i.getCostoUnitario());
        boolean bajo = i.getStockActual().compareTo(i.getStockMinimo()) <= 0;
        return new InsumoResponse(
                i.getId(),
                i.getSede().getId(),
                i.getSede().getNombre(),
                i.getNombre(),
                i.getUnidad(),
                i.getStockActual(),
                i.getStockMinimo(),
                i.getCostoUnitario(),
                valor,
                bajo,
                i.getActivo()
        );
    }
}
