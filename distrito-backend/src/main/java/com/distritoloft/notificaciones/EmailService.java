package com.distritoloft.notificaciones;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final ResendEmailClient resendClient;
    private final String from;
    private final String fromName;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        ResendEmailClient resendClient,
                        @Value("${distrito.notificaciones.from:}") String from,
                        @Value("${distrito.notificaciones.from-name:Distrito Loft}") String fromName) {
        this.mailSenderProvider = mailSenderProvider;
        this.resendClient = resendClient;
        this.from = from;
        this.fromName = fromName;
    }

    /**
     * Envia un correo HTML a varios destinatarios. Si SMTP no esta configurado
     * (no hay JavaMailSender) o falla el envio, loguea y continua. El scheduler
     * no debe caerse por errores de correo. Devuelve una descripcion del
     * resultado util para debug desde la UI.
     */
    public String enviarHtml(String[] destinatarios, String asunto, String html) {
        if (destinatarios == null || destinatarios.length == 0) {
            log.warn("Email no enviado: sin destinatarios ({}).", asunto);
            return "SIN_DESTINATARIOS";
        }
        if (from == null || from.isBlank()) {
            log.warn("distrito.notificaciones.from no configurado. No se envio: {}", asunto);
            return "FROM_VACIO (configura NOTIFICACIONES_FROM en Railway)";
        }

        // Preferir Resend (HTTP 443, no bloqueado por Railway) sobre SMTP.
        if (resendClient.isConfigured()) {
            String fromHeader = (fromName != null && !fromName.isBlank())
                    ? fromName + " <" + from + ">"
                    : from;
            return resendClient.enviarHtml(fromHeader, destinatarios, asunto, html);
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("Ni Resend ni SMTP configurados. No se envio: {}", asunto);
            return "NINGUN_PROVEEDOR_CONFIGURADO (configura RESEND_API_KEY o SMTP_*)";
        }
        try {
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(from, fromName);
            helper.setTo(destinatarios);
            helper.setSubject(asunto);
            helper.setText(html, true);
            sender.send(mime);
            log.info("Correo enviado a {} destinatario(s): {}", destinatarios.length, asunto);
            return "ENVIADO a " + destinatarios.length + " destinatario(s): "
                    + String.join(", ", destinatarios);
        } catch (jakarta.mail.MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando correo \"{}\": {}", asunto, e.getMessage());
            return "ERROR_MIME: " + e.getMessage();
        } catch (org.springframework.mail.MailException e) {
            log.error("Error SMTP enviando correo \"{}\": {}", asunto, e.getMessage());
            return "ERROR_SMTP: " + e.getMessage();
        }
    }
}
