package com.distritoloft.common.enums;

/**
 * Tipos de ciclo de lavadora que ofrecen los equipos (Speed Queen).
 * Las duraciones reales son fijas por máquina, no por plan del cliente.
 * La empleada elige el ciclo al iniciar la lavada según la suciedad/material.
 */
public enum TipoCicloLavadora {
    SENCILLO(30),
    INTERMEDIO(36),
    DELUXE(43);

    private final int duracionMinutos;

    TipoCicloLavadora(int duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public int getDuracionMinutos() {
        return duracionMinutos;
    }
}
