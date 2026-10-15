package com.distritoloft.notificaciones;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Cliente HTTP para la API de Resend (https://resend.com). Usa el puerto 443
 * (HTTPS) que NO esta bloqueado por Railway, a diferencia del SMTP tradicional.
 *
 * Se activa cuando RESEND_API_KEY esta configurada; si no, el EmailService
 * cae al JavaMailSender (SMTP) de Spring, que no funciona en Railway pero
 * sirve para desarrollo local.
 */
@Slf4j
@Service
public class ResendEmailClient {

    private static final String ENDPOINT = "https://api.resend.com/emails";

    private final RestTemplate rest = new RestTemplate();
    private final String apiKey;

    public ResendEmailClient(@Value("${distrito.notificaciones.resend-api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Envia un correo HTML por Resend. Retorna un String descriptivo del
     * resultado (ENVIADO: ... o ERROR_RESEND: ...).
     */
    public String enviarHtml(String from, String[] destinatarios, String asunto, String html) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", from);
        body.put("to", destinatarios);
        body.put("subject", asunto);
        body.put("html", html);

        try {
            ResponseEntity<Map> resp = rest.exchange(ENDPOINT,
                    org.springframework.http.HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);
            Object id = resp.getBody() != null ? resp.getBody().get("id") : null;
            log.info("Resend envio OK a {} destinatario(s), id={}", destinatarios.length, id);
            return "ENVIADO (Resend id=" + id + ") a " + destinatarios.length
                    + " destinatario(s): " + String.join(", ", destinatarios);
        } catch (RestClientResponseException e) {
            String bodyStr = e.getResponseBodyAsString();
            log.error("Resend fallo {}: {}", e.getStatusCode(), bodyStr);
            return "ERROR_RESEND (" + e.getStatusCode() + "): " + bodyStr;
        } catch (RuntimeException e) {
            log.error("Resend fallo: {}", e.getMessage());
            return "ERROR_RESEND: " + e.getMessage();
        }
    }
}
