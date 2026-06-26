package com.distritoloft.auth;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Rate limiter en memoria por clave (tipicamente IP + endpoint).
 *
 * Diseno:
 * - Ventana deslizante con timestamps en cola.
 * - Por cada peticion: limpia los expirados y revisa si ya hay {@code max} en
 *   la ventana. Si no, anota el timestamp actual y permite.
 * - Multi-thread safe via ConcurrentLinkedDeque + bloqueo por clave.
 *
 * Limites en una sola instancia. Si crecemos a multi-instancia hay que
 * migrar a Redis con el mismo contrato.
 */
@Component
public class RateLimiter {

    private final ConcurrentHashMap<String, Deque<Long>> bucket = new ConcurrentHashMap<>();

    public boolean allow(String key, int max, Duration window) {
        long now = System.currentTimeMillis();
        long cutoff = now - window.toMillis();
        Deque<Long> times = bucket.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && times.peekFirst() < cutoff) {
                times.pollFirst();
            }
            if (times.size() >= max) {
                return false;
            }
            times.addLast(now);
            return true;
        }
    }
}
