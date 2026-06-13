package com.distritoloft.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(RecursoNoEncontradoException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.of(404, "Not Found", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(ReglaNegocioException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                ErrorResponse.of(422, "Unprocessable Entity", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ErrorResponse.FieldError> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorResponse.FieldError(e.getField(), e.getDefaultMessage()))
                .toList();

        return ResponseEntity.badRequest().body(
                ErrorResponse.withFieldErrors(400, "Bad Request", "Datos invalidos en la solicitud", req.getRequestURI(), errores)
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return ResponseEntity.badRequest().body(
                ErrorResponse.of(400, "Bad Request", ex.getMessage(), req.getRequestURI())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex, HttpServletRequest req) {
        log.error("Error no manejado en {}", req.getRequestURI(), ex);
        return ResponseEntity.internalServerError().body(
                ErrorResponse.of(500, "Internal Server Error", "Ocurrio un error inesperado", req.getRequestURI())
        );
    }
}
