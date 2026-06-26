package com.distritoloft.common.exception;

/**
 * Lanzada cuando un cliente excede el rate limit de un endpoint.
 * Mapea a HTTP 429.
 */
public class DemasiadosIntentosException extends RuntimeException {
    public DemasiadosIntentosException(String mensaje) {
        super(mensaje);
    }
}
