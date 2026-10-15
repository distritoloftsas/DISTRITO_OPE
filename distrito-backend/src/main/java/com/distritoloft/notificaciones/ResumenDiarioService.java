package com.distritoloft.notificaciones;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.insumo.Insumo;
import com.distritoloft.insumo.InsumoRepository;
import com.distritoloft.pedido.Pago;
import com.distritoloft.pedido.PagoRepository;
import com.distritoloft.pedido.Pedido;
import com.distritoloft.pedido.PedidoRepository;
import com.distritoloft.sede.Sede;
import com.distritoloft.sede.SedeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumenDiarioService {

    private static final ZoneId ZONA = ZoneId.of("America/Bogota");
    private static final DateTimeFormatter FECHA_LARGA = DateTimeFormatter
            .ofPattern("EEEE d 'de' MMMM, yyyy", new Locale("es", "CO"));
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final InsumoRepository insumoRepository;
    private final SedeRepository sedeRepository;
    private final EmailService emailService;

    @Value("${distrito.notificaciones.resumen-diario.destinatarios:}")
    private String destinatariosCsv;

    @Value("${distrito.notificaciones.resumen-diario.habilitado:true}")
    private boolean habilitado;

    @Transactional(readOnly = true)
    public void enviarResumenDeHoy() {
        if (!habilitado) {
            log.info("Resumen diario deshabilitado (habilitado=false).");
            return;
        }
        LocalDate hoy = LocalDate.now(ZONA);
        enviarResumen(hoy);
    }

    @Transactional(readOnly = true)
    public void enviarResumen(LocalDate fecha) {
        String[] destinatarios = destinatariosArr();
        if (destinatarios.length == 0) {
            log.warn("Resumen diario sin destinatarios configurados; nada que enviar.");
            return;
        }

        OffsetDateTime desde = fecha.atStartOfDay(ZONA).toOffsetDateTime();
        OffsetDateTime hasta = fecha.plusDays(1).atStartOfDay(ZONA).toOffsetDateTime();

        StringBuilder htmlSedes = new StringBuilder();
        List<Sede> sedes = sedeRepository.findAll();
        for (Sede sede : sedes) {
            htmlSedes.append(bloqueSede(sede, desde, hasta));
        }

        String asunto = "Distrito Loft · Resumen del día " +
                fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String html = plantilla(fecha, htmlSedes.toString());

        emailService.enviarHtml(destinatarios, asunto, html);
    }

    private String bloqueSede(Sede sede, OffsetDateTime desde, OffsetDateTime hasta) {
        Long sedeId = sede.getId();
        List<Pedido> pedidos = pedidoRepository.consolidadoPorSedeEnRango(sedeId, desde, hasta);
        List<Pago> pagos = pagoRepository.findPagosEntre(sedeId, desde, hasta);

        // Metricas pedidos
        int cantidadPedidos = pedidos.size();
        int cancelados = 0;
        BigDecimal subtotalBruto = BigDecimal.ZERO;
        BigDecimal totalDescuentos = BigDecimal.ZERO;
        BigDecimal totalDomicilios = BigDecimal.ZERO;
        BigDecimal totalFacturado = BigDecimal.ZERO;
        Map<String, Integer> porPlan = new TreeMap<>();
        Map<String, DescuentoAgg> porDescuento = new LinkedHashMap<>();

        for (Pedido p : pedidos) {
            String planNombre = p.getPlan() != null ? p.getPlan().getNombre() : "—";
            porPlan.merge(planNombre, 1, Integer::sum);

            if (p.getEstado() == EstadoPedido.CANCELADO) {
                cancelados++;
                continue;
            }
            subtotalBruto = subtotalBruto.add(nz(p.getSubtotal()));
            totalDescuentos = totalDescuentos.add(nz(p.getMontoDescuento()));
            totalDomicilios = totalDomicilios.add(nz(p.getCostoDomicilio()));
            totalFacturado = totalFacturado.add(nz(p.getTotal()));

            if (p.getDescuento() != null) {
                String etiqueta = p.getDescuento().getEtiqueta();
                var agg = porDescuento.computeIfAbsent(etiqueta, k -> new DescuentoAgg());
                agg.cantidad++;
                agg.monto = agg.monto.add(nz(p.getMontoDescuento()));
            }
        }

        int lavadasVendidas = cantidadPedidos - cancelados;
        BigDecimal ticket = lavadasVendidas > 0
                ? totalFacturado.divide(BigDecimal.valueOf(lavadasVendidas), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Pagos por metodo
        Map<MetodoPago, Integer> ctPago = new EnumMap<>(MetodoPago.class);
        Map<MetodoPago, BigDecimal> sumPago = new EnumMap<>(MetodoPago.class);
        for (Pago pg : pagos) {
            ctPago.merge(pg.getMetodo(), 1, Integer::sum);
            sumPago.merge(pg.getMetodo(), pg.getMonto(), BigDecimal::add);
        }

        // Clientes nuevos del dia
        List<Pedido> nuevos = new ArrayList<>();
        Set<Long> clientesNuevosVistos = new java.util.HashSet<>();
        for (Pedido p : pedidos) {
            if (p.getCliente() == null) continue;
            OffsetDateTime creadoEn = p.getCliente().getCreadoEn();
            if (creadoEn != null && !creadoEn.isBefore(desde) && creadoEn.isBefore(hasta)) {
                if (clientesNuevosVistos.add(p.getCliente().getId())) {
                    nuevos.add(p);
                }
            }
        }

        // Insumos con stock bajo
        List<Insumo> stockBajo = insumoRepository.listarStockBajo(sedeId);

        StringBuilder b = new StringBuilder();
        b.append("<h2 style=\"color:#2B2926;margin:30px 0 10px;font-family:Arial,sans-serif;\">Sede ")
                .append(esc(sede.getNombre())).append("</h2>");

        // KPIs
        b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:20px;\">")
                .append("<tr>")
                .append(kpi("Pedidos", String.valueOf(cantidadPedidos), "#2B2926"))
                .append(kpi("Facturado", cop(totalFacturado), "#A88046"))
                .append(kpi("Ticket promedio", cop(ticket), "#2B2926"))
                .append(kpi("Cancelados", String.valueOf(cancelados), cancelados > 0 ? "#dc2626" : "#2B2926"))
                .append("</tr>")
                .append("<tr>")
                .append(kpi("Subtotal bruto", cop(subtotalBruto), "#2B2926"))
                .append(kpi("Descuentos", cop(totalDescuentos), totalDescuentos.signum() > 0 ? "#16a34a" : "#6b7280"))
                .append(kpi("Domicilios", cop(totalDomicilios), "#2B2926"))
                .append(kpi("Clientes nuevos", String.valueOf(nuevos.size()), nuevos.size() > 0 ? "#16a34a" : "#6b7280"))
                .append("</tr>")
                .append("</table>");

        if (cantidadPedidos == 0 && pagos.isEmpty()) {
            b.append("<p style=\"color:#6b7280;font-family:Arial,sans-serif;font-size:13px;\">Sin movimiento hoy.</p>");
            return b.toString();
        }

        // Pagos por metodo
        b.append(subt("Pagos por método"));
        b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:15px;\">");
        b.append(th("Método", "Cantidad", "Monto"));
        for (MetodoPago m : MetodoPago.values()) {
            b.append(tr(etiqMetodo(m),
                    String.valueOf(ctPago.getOrDefault(m, 0)),
                    cop(sumPago.getOrDefault(m, BigDecimal.ZERO))));
        }
        b.append("</table>");

        // Descuentos
        if (!porDescuento.isEmpty()) {
            b.append(subt("Descuentos aplicados"));
            b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:15px;\">");
            b.append(th("Tipo", "Cantidad", "Monto descontado"));
            for (var e : porDescuento.entrySet()) {
                b.append(tr(e.getKey(),
                        String.valueOf(e.getValue().cantidad),
                        cop(e.getValue().monto)));
            }
            b.append("</table>");
        }

        // Mix por plan
        if (!porPlan.isEmpty()) {
            b.append(subt("Servicios por plan"));
            b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:15px;\">");
            b.append(th("Plan", "Cantidad"));
            for (var e : porPlan.entrySet()) {
                b.append(tr(e.getKey(), String.valueOf(e.getValue())));
            }
            b.append("</table>");
        }

        // Clientes nuevos
        if (!nuevos.isEmpty()) {
            b.append(subt("Clientes nuevos del día"));
            b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:15px;\">");
            b.append(th("Hora", "Nombre", "Teléfono", "Plan"));
            for (Pedido p : nuevos) {
                String hora = p.getFechaRecepcion() != null
                        ? p.getFechaRecepcion().atZoneSameInstant(ZONA).format(HORA) : "";
                b.append(tr(hora,
                        esc(p.getCliente().getNombre()),
                        esc(nullTo(p.getCliente().getTelefono(), "—")),
                        esc(p.getPlan() != null ? p.getPlan().getNombre() : "—")));
            }
            b.append("</table>");
        }

        // Pedidos del dia
        if (!pedidos.isEmpty()) {
            b.append(subt("Detalle de pedidos (" + pedidos.size() + ")"));
            b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;margin-bottom:15px;\">");
            b.append(th("Hora", "Código", "Cliente", "Plan", "Total", "Estado"));
            // Mostrar maximo 25 para no inflar el correo.
            int limite = Math.min(pedidos.size(), 25);
            for (int i = 0; i < limite; i++) {
                Pedido p = pedidos.get(i);
                String hora = p.getFechaRecepcion() != null
                        ? p.getFechaRecepcion().atZoneSameInstant(ZONA).format(HORA) : "";
                b.append(tr(hora,
                        esc(p.getCodigoQr()),
                        esc(p.getCliente() != null ? p.getCliente().getNombre() : ""),
                        esc(p.getPlan() != null ? p.getPlan().getNombre() : ""),
                        cop(p.getTotal()),
                        etiqEstado(p.getEstado())));
            }
            b.append("</table>");
            if (pedidos.size() > limite) {
                b.append("<p style=\"color:#6b7280;font-family:Arial,sans-serif;font-size:11px;\">")
                        .append("… ").append(pedidos.size() - limite).append(" pedido(s) más en la app.</p>");
            }
        }

        // Alertas insumos
        if (!stockBajo.isEmpty()) {
            b.append(subt("⚠ Alertas de inventario"));
            b.append("<table style=\"width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin-bottom:15px;background:#fef3c7;\">");
            b.append(th("Insumo", "Stock actual", "Stock mínimo"));
            for (Insumo i : stockBajo) {
                b.append(tr(esc(i.getNombre()),
                        formatoCantidad(i.getStockActual()) + " " + i.getUnidad().name().toLowerCase(),
                        formatoCantidad(i.getStockMinimo()) + " " + i.getUnidad().name().toLowerCase()));
            }
            b.append("</table>");
        }

        return b.toString();
    }

    private String plantilla(LocalDate fecha, String contenido) {
        String titulo = capitalizar(fecha.format(FECHA_LARGA));
        return "<!DOCTYPE html><html><body style=\"background:#F4EFE6;padding:20px;margin:0;\">" +
                "<div style=\"max-width:700px;margin:0 auto;background:#fff;padding:30px;border-radius:12px;" +
                "box-shadow:0 2px 8px rgba(0,0,0,0.05);\">" +
                "<div style=\"border-bottom:3px solid #C9A96E;padding-bottom:15px;margin-bottom:20px;\">" +
                "<h1 style=\"color:#2B2926;font-family:Arial,sans-serif;margin:0;font-size:22px;\">Distrito Loft</h1>" +
                "<p style=\"color:#A88046;font-family:Arial,sans-serif;margin:4px 0 0;font-size:14px;\">Resumen operativo · " +
                esc(titulo) + "</p>" +
                "</div>" +
                contenido +
                "<p style=\"color:#9ca3af;font-family:Arial,sans-serif;font-size:11px;margin-top:30px;text-align:center;\">" +
                "Este correo se envía automáticamente todos los días a las 7:00 PM.<br>" +
                "Datos tomados de la plataforma operativa Distrito Loft." +
                "</p></div></body></html>";
    }

    // Helpers HTML -----------------------------------

    private String kpi(String label, String valor, String color) {
        return "<td style=\"width:25%;padding:10px;background:#F4EFE6;border:1px solid #e7e5e4;vertical-align:top;\">"
                + "<p style=\"margin:0;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;\">"
                + esc(label) + "</p>"
                + "<p style=\"margin:4px 0 0;color:" + color + ";font-size:16px;font-weight:bold;\">"
                + esc(valor) + "</p>"
                + "</td>";
    }

    private String subt(String texto) {
        return "<h3 style=\"color:#2B2926;font-family:Arial,sans-serif;font-size:14px;margin:20px 0 8px;" +
                "border-bottom:1px solid #e7e5e4;padding-bottom:5px;\">" + esc(texto) + "</h3>";
    }

    private String th(String... cols) {
        StringBuilder sb = new StringBuilder("<tr style=\"background:#2B2926;color:#F4EFE6;\">");
        for (String c : cols) {
            sb.append("<th style=\"padding:6px 10px;text-align:left;font-size:11px;text-transform:uppercase;\">")
                    .append(esc(c)).append("</th>");
        }
        return sb.append("</tr>").toString();
    }

    private String tr(String... cols) {
        StringBuilder sb = new StringBuilder("<tr>");
        for (String c : cols) {
            sb.append("<td style=\"padding:6px 10px;border-bottom:1px solid #e7e5e4;\">")
                    .append(c == null ? "" : c).append("</td>");
        }
        return sb.append("</tr>").toString();
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private static String nullTo(String v, String def) {
        return v == null || v.isBlank() ? def : v;
    }

    private static String cop(BigDecimal v) {
        if (v == null) v = BigDecimal.ZERO;
        return "$" + String.format(Locale.US, "%,.0f", v.doubleValue())
                .replace(',', '.');
    }

    private static String formatoCantidad(BigDecimal v) {
        if (v == null) return "0";
        return v.stripTrailingZeros().toPlainString();
    }

    private static String capitalizar(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private static String etiqMetodo(MetodoPago m) {
        return switch (m) {
            case EFECTIVO -> "Efectivo";
            case TRANSFERENCIA -> "Transferencia";
            case DATAFONO -> "Datáfono";
        };
    }

    private static String etiqEstado(EstadoPedido e) {
        return switch (e) {
            case RECIBIDO -> "Recibido";
            case LAVANDO -> "Lavando";
            case SECANDO -> "Secando";
            case DOBLANDO -> "Doblando";
            case LISTO -> "Listo";
            case ENTREGADO -> "Entregado";
            case CANCELADO -> "<span style=\"color:#dc2626;\">Cancelado</span>";
        };
    }

    private String[] destinatariosArr() {
        if (destinatariosCsv == null || destinatariosCsv.isBlank()) return new String[0];
        String[] parts = destinatariosCsv.split(",");
        List<String> limpio = new ArrayList<>();
        for (String p : parts) {
            String t = p.trim();
            if (!t.isEmpty()) limpio.add(t);
        }
        return limpio.toArray(new String[0]);
    }

    private static class DescuentoAgg {
        int cantidad = 0;
        BigDecimal monto = BigDecimal.ZERO;
    }
}
