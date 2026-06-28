package com.distritoloft.common.enums;

import java.math.BigDecimal;
import java.math.RoundingMode;

public enum UnidadInsumo {
    GRAMO,
    KILO,
    MILILITRO,
    LITRO,
    KILOVATIO_HORA,
    UNIDAD;

    /**
     * Devuelve true si las dos unidades pueden convertirse entre si
     * (mismo dominio fisico: volumen / peso / unidad / energia).
     */
    public static boolean sonCompatibles(UnidadInsumo a, UnidadInsumo b) {
        if (a == b) return true;
        if (esVolumen(a) && esVolumen(b)) return true;
        if (esPeso(a) && esPeso(b)) return true;
        return false;
    }

    /**
     * Convierte {@code cantidad} de la unidad {@code desde} a la unidad
     * {@code hacia}. Lanza IllegalArgumentException si las unidades no
     * son compatibles (ej. ml -> g).
     */
    public static BigDecimal convertir(BigDecimal cantidad, UnidadInsumo desde, UnidadInsumo hacia) {
        if (desde == hacia) return cantidad;
        if (!sonCompatibles(desde, hacia)) {
            throw new IllegalArgumentException(
                    "Unidades incompatibles: " + desde + " -> " + hacia);
        }
        BigDecimal factor = factorBase(desde).divide(factorBase(hacia), 10, RoundingMode.HALF_UP);
        // Redondeamos a 6 decimales para evitar arrastrar error infinito.
        return cantidad.multiply(factor).setScale(6, RoundingMode.HALF_UP);
    }

    /** Factor a la unidad base del dominio (ml para volumen, g para peso). */
    private static BigDecimal factorBase(UnidadInsumo u) {
        return switch (u) {
            case LITRO -> BigDecimal.valueOf(1000);
            case MILILITRO -> BigDecimal.ONE;
            case KILO -> BigDecimal.valueOf(1000);
            case GRAMO -> BigDecimal.ONE;
            case UNIDAD, KILOVATIO_HORA -> BigDecimal.ONE;
        };
    }

    private static boolean esVolumen(UnidadInsumo u) {
        return u == LITRO || u == MILILITRO;
    }

    private static boolean esPeso(UnidadInsumo u) {
        return u == GRAMO || u == KILO;
    }
}
