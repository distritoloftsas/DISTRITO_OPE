package com.distritoloft.common.exception;

import java.time.OffsetDateTime;
import java.util.List;

public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String mensaje,
        String path,
        List<FieldError> camposInvalidos
) {
    public record FieldError(String campo, String mensaje) {}

    public static ErrorResponse of(int status, String error, String mensaje, String path) {
        return new ErrorResponse(OffsetDateTime.now(), status, error, mensaje, path, null);
    }

    public static ErrorResponse withFieldErrors(int status, String error, String mensaje, String path, List<FieldError> camposInvalidos) {
        return new ErrorResponse(OffsetDateTime.now(), status, error, mensaje, path, camposInvalidos);
    }
}
