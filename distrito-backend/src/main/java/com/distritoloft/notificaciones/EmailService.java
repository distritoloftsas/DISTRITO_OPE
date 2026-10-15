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
    private final String from;
    private final String fromName;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${distrito.notificaciones.from:}") String from,
                        @Value("${distrito.notificaciones.from-name:Distrito Loft}") String fromName) {
        this.mailSenderProvider = mailSenderProvider;
        this.from = from;
        this.fromName = fromName;
    }

    /**
     * Envia un correo HTML a varios destinatarios. Si SMTP no esta configurado
     * (no hay JavaMailSender) o falla el envio, loguea y continua. El scheduler
     * no debe caerse por errores de correo.
     */
    public void enviarHtml(String[] destinatarios, String asunto, String html) {
        if (destinatarios == null || destinatarios.length == 0) {
            log.warn("Email no enviado: sin destinatarios ({}).", asunto);
            return;
        }
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("SMTP no configurado (JavaMailSender ausente). No se envio: {}", asunto);
            return;
        }
        if (from == null || from.isBlank()) {
            log.warn("distrito.notificaciones.from no configurado. No se envio: {}", asunto);
            return;
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
        } catch (jakarta.mail.MessagingException | UnsupportedEncodingException e) {
            log.error("Error enviando correo \"{}\": {}", asunto, e.getMessage());
        } catch (org.springframework.mail.MailException e) {
            log.error("Error SMTP enviando correo \"{}\": {}", asunto, e.getMessage());
        }
    }
}
