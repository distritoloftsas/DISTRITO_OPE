package com.distritoloft.reportes;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.reportes.dto.CierreCajaResponse;
import com.distritoloft.reportes.dto.ConsolidadoResponse;
import com.distritoloft.reportes.dto.ConsumoInsumosResponse;
import com.distritoloft.reportes.dto.VentasResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExcelExportService {

    private static final ZoneId ZONA = ZoneId.of("America/Bogota");
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] cierreCajaXlsx(CierreCajaResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Estilos s = new Estilos(wb);
            Sheet sh = wb.createSheet("Cierre de caja");

            tituloPagina(sh, s, "Cierre de caja", 0, 7);

            int r = 2;
            r = par(sh, s, r, "Fecha", data.fecha().toString());
            r = par(sh, s, r, "Sede", data.sede().nombre());
            r = parCop(sh, s, r, "Total ingresos", data.totalIngresos());
            r = par(sh, s, r, "# Pagos", String.valueOf(data.totalPagos()));
            r = par(sh, s, r, "Lavados entregados", String.valueOf(data.lavadosEntregados()));

            r++;
            subtitulo(sh, s, r++, "Total por método");
            headerRow(sh, s, r++, "Método", "Cantidad", "Total");
            for (Map.Entry<MetodoPago, CierreCajaResponse.TotalPorMetodo> e : data.porMetodo().entrySet()) {
                Row row = sh.createRow(r++);
                celdaTexto(row, 0, etiqueta(e.getKey()), s.bordeIzq);
                celdaNumero(row, 1, e.getValue().cantidad(), s.bordeCentro);
                celdaCop(row, 2, e.getValue().total(), s.bordeMonedaDer);
            }

            r++;
            subtitulo(sh, s, r++, "Pedidos por estado");
            headerRow(sh, s, r++, "Estado", "Cantidad");
            for (Map.Entry<EstadoPedido, Long> e : data.pedidosPorEstado().entrySet()) {
                if (e.getValue() == 0) continue;
                Row row = sh.createRow(r++);
                celdaTexto(row, 0, etiqueta(e.getKey()), s.bordeIzq);
                celdaNumero(row, 1, e.getValue(), s.bordeCentro);
            }

            r++;
            subtitulo(sh, s, r++, "Detalle de pagos");
            headerRow(sh, s, r++, "Fecha", "Pedido", "Cliente", "Método", "Monto", "Referencia", "Empleado");
            for (var p : data.pagos()) {
                Row row = sh.createRow(r++);
                celdaTexto(row, 0, p.fecha() != null ? p.fecha().atZoneSameInstant(ZONA).format(FECHA_HORA) : "", s.bordeIzq);
                celdaTexto(row, 1, p.pedidoCodigo(), s.bordeCentro);
                celdaTexto(row, 2, p.clienteNombre(), s.bordeIzq);
                celdaTexto(row, 3, etiqueta(p.metodo()), s.bordeCentro);
                celdaCop(row, 4, p.monto(), s.bordeMonedaDer);
                celdaTexto(row, 5, p.referencia(), s.bordeIzq);
                celdaTexto(row, 6, p.empleadoNombre(), s.bordeIzq);
            }

            autosize(sh, 7);
            return aBytes(wb);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    public byte[] consumoInsumosXlsx(ConsumoInsumosResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Estilos s = new Estilos(wb);
            Sheet sh = wb.createSheet("Gasto en insumos");

            tituloPagina(sh, s, "Gasto en insumos", 0, 5);

            int r = 2;
            r = par(sh, s, r, "Desde", data.desde().toString());
            r = par(sh, s, r, "Hasta", data.hasta().toString());
            r = par(sh, s, r, "Sede", data.sedeNombre());
            r = parCop(sh, s, r, "Costo total", data.costoTotal());
            r = par(sh, s, r, "Pedidos con consumo", String.valueOf(data.pedidosAfectados()));

            r++;
            subtitulo(sh, s, r++, "Detalle por insumo");
            headerRow(sh, s, r++, "Insumo", "Cantidad", "Unidad", "Costo total", "Movimientos", "Pedidos");
            for (var l : data.lineas()) {
                Row row = sh.createRow(r++);
                celdaTexto(row, 0, l.insumoNombre(), s.bordeIzq);
                celdaNumero(row, 1, l.cantidadTotal(), s.bordeNumero3);
                celdaTexto(row, 2, l.unidad().name(), s.bordeCentro);
                celdaCop(row, 3, l.costoTotal(), s.bordeMonedaDer);
                celdaNumero(row, 4, l.movimientos(), s.bordeCentro);
                celdaNumero(row, 5, l.pedidosAfectados(), s.bordeCentro);
            }

            autosize(sh, 6);
            return aBytes(wb);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    public byte[] ventasXlsx(VentasResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Estilos s = new Estilos(wb);
            Sheet sh = wb.createSheet("Ventas de lavadas");

            tituloPagina(sh, s, "Ventas de lavadas", 0, 6);

            int r = 2;
            r = par(sh, s, r, "Desde", data.desde().toString());
            r = par(sh, s, r, "Hasta", data.hasta().toString());
            r = par(sh, s, r, "Sede", data.sedeNombre());
            r = parCop(sh, s, r, "Total ventas", data.totalVentas());
            r = par(sh, s, r, "# Lavadas", String.valueOf(data.totalLavadas()));

            r++;
            subtitulo(sh, s, r++, "Detalle por pedido");
            headerRow(sh, s, r++, "Fecha", "Pedido", "Cliente", "Plan", "Total", "Pagado", "Estado");
            for (var v : data.lineas()) {
                Row row = sh.createRow(r++);
                celdaTexto(row, 0, v.fechaRecepcion().atZoneSameInstant(ZONA).format(FECHA_HORA), s.bordeIzq);
                celdaTexto(row, 1, v.codigoQr(), s.bordeCentro);
                celdaTexto(row, 2, v.clienteNombre(), s.bordeIzq);
                celdaTexto(row, 3, v.planNombre(), s.bordeIzq);
                celdaCop(row, 4, v.total(), s.bordeMonedaDer);
                celdaTexto(row, 5, Boolean.TRUE.equals(v.pagado()) ? "Sí" : "No", s.bordeCentro);
                celdaTexto(row, 6, etiqueta(v.estado()), s.bordeCentro);
            }

            autosize(sh, 7);
            return aBytes(wb);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    public byte[] consolidadoXlsx(ConsolidadoResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Estilos s = new Estilos(wb);
            // Estilos derivados con color de fondo por plan/descuento/cancelado.
            Map<String, XSSFCellStyle> tintTextoIzq = new HashMap<>();
            Map<String, XSSFCellStyle> tintCentro   = new HashMap<>();
            Map<String, XSSFCellStyle> tintMoneda   = new HashMap<>();

            // -------- Hoja 1: Pedidos --------
            Sheet pedSh = wb.createSheet("Pedidos");
            tituloPagina(pedSh, s, "Pedidos consolidados", 0, 10);
            int r = 2;
            r = par(pedSh, s, r, "Sede", data.sedeNombre());
            r = par(pedSh, s, r, "Desde", data.desde().toString());
            r = par(pedSh, s, r, "Hasta", data.hasta().toString());
            r++;
            headerRow(pedSh, s, r++,
                    "Fecha", "Código", "Cliente", "Plan", "Estado",
                    "Subtotal", "Descuento", "-$ Desc", "Domicilio", "Total", "Pago");

            for (var l : data.pedidos()) {
                Row row = pedSh.createRow(r++);
                boolean cancelado = l.estado() == EstadoPedido.CANCELADO;
                String colorHex = cancelado ? "#fee2e2" : colorPlan(l.planNombre());

                XSSFCellStyle izq    = tintTextoIzq.computeIfAbsent(colorHex, c -> tint(wb, s.bordeIzq, c));
                XSSFCellStyle centro = tintCentro.computeIfAbsent(colorHex, c -> tint(wb, s.bordeCentro, c));
                XSSFCellStyle moneda = tintMoneda.computeIfAbsent(colorHex, c -> tint(wb, s.bordeMonedaDer, c));

                celdaTexto(row, 0, l.fechaRecepcion() != null ? l.fechaRecepcion().atZoneSameInstant(ZONA).format(FECHA_HORA) : "", izq);
                celdaTexto(row, 1, l.codigoQr(), centro);
                celdaTexto(row, 2, l.cliente(), izq);
                celdaTexto(row, 3, l.planNombre(), izq);
                celdaTexto(row, 4, etiqueta(l.estado()), centro);
                celdaCop(row, 5, l.subtotal(), moneda);

                if (l.descuentoCodigo() != null) {
                    XSSFCellStyle descStyle = tint(wb, s.bordeCentro, colorDescuento(l.descuentoCodigo()));
                    celdaTexto(row, 6, l.descuentoEtiqueta(), descStyle);
                } else {
                    celdaTexto(row, 6, "—", centro);
                }
                celdaCop(row, 7, l.montoDescuento(), moneda);
                celdaCop(row, 8, l.costoDomicilio(), moneda);
                celdaCop(row, 9, l.total(), moneda);
                celdaTexto(row, 10, etiquetaMetodo(l.metodoPago()), centro);
            }
            autosize(pedSh, 11);

            // -------- Hoja 2: Ventas (totales) --------
            Sheet totSh = wb.createSheet("Totales");
            tituloPagina(totSh, s, "Consolidado del período", 0, 3);
            var t = data.totales();
            int rr = 2;
            rr = par(totSh, s, rr, "Cantidad de pedidos", String.valueOf(t.cantidadPedidos()));
            rr = par(totSh, s, rr, "Cancelados", String.valueOf(t.cantidadPedidosCancelados()));
            rr = parCop(totSh, s, rr, "Subtotal bruto (sin descuentos)", t.subtotalBruto());
            rr = parCop(totSh, s, rr, "Total descuentos aplicados", t.totalDescuentos());
            rr = parCop(totSh, s, rr, "Total domicilios", t.totalDomicilios());
            rr = parCop(totSh, s, rr, "Total facturado", t.totalFacturado());
            rr = parCop(totSh, s, rr, "Ticket promedio", t.ticketPromedio());
            rr = parCop(totSh, s, rr, "Total reembolsos", t.totalReembolsos());
            autosize(totSh, 3);

            // -------- Hoja 3: Descuentos --------
            Sheet descSh = wb.createSheet("Descuentos");
            tituloPagina(descSh, s, "Descuentos aplicados", 0, 4);
            int rd = 2;
            headerRow(descSh, s, rd++, "Tipo", "Cantidad", "Total descontado");
            for (var d : data.descuentosPorTipo()) {
                Row row = descSh.createRow(rd++);
                XSSFCellStyle color = tint(wb, s.bordeIzq, colorDescuento(d.codigo()));
                celdaTexto(row, 0, d.etiqueta(), color);
                celdaNumero(row, 1, d.cantidadPedidos(), s.bordeCentro);
                celdaCop(row, 2, d.montoDescontado(), s.bordeMonedaDer);
            }
            autosize(descSh, 3);

            // -------- Hoja 4: Pagos por método --------
            Sheet payShaSh = wb.createSheet("Pagos por metodo");
            tituloPagina(payShaSh, s, "Pagos por método", 0, 4);
            int rp = 2;
            headerRow(payShaSh, s, rp++, "Método", "Cantidad", "Monto");
            for (var pm : data.pagosPorMetodo()) {
                Row row = payShaSh.createRow(rp++);
                XSSFCellStyle color = tint(wb, s.bordeIzq, colorMetodo(pm.metodo()));
                celdaTexto(row, 0, etiqueta(pm.metodo()), color);
                celdaNumero(row, 1, pm.cantidadPagos(), s.bordeCentro);
                celdaCop(row, 2, pm.monto(), s.bordeMonedaDer);
            }
            autosize(payShaSh, 3);

            // -------- Hoja 5: Reembolsos --------
            Sheet refSh = wb.createSheet("Reembolsos");
            tituloPagina(refSh, s, "Reembolsos (cancelados pagados)", 0, 5);
            int rf = 2;
            headerRow(refSh, s, rf++, "Fecha", "Código", "Cliente", "Plan", "Monto");
            for (var re : data.reembolsos()) {
                Row row = refSh.createRow(rf++);
                celdaTexto(row, 0, re.fechaCancelacion() != null ? re.fechaCancelacion().atZoneSameInstant(ZONA).format(FECHA_HORA) : "", s.bordeIzq);
                celdaTexto(row, 1, re.codigoQr(), s.bordeCentro);
                celdaTexto(row, 2, re.cliente(), s.bordeIzq);
                celdaTexto(row, 3, re.planNombre(), s.bordeIzq);
                celdaCop(row, 4, re.montoReembolsado(), s.bordeMonedaDer);
            }
            autosize(refSh, 5);

            return aBytes(wb);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    // ------- paleta -------

    private static String colorPlan(String planNombre) {
        if (planNombre == null) return "#ffffff";
        String n = planNombre.toLowerCase();
        if (n.contains("domicilio")) return "#fef3c7"; // ámbar suave
        if (n.contains("doblado")) return "#dcfce7";   // verde suave
        if (n.contains("lavado") && n.contains("secado")) return "#dbeafe"; // azul suave
        return "#f5f5f4"; // gris muy suave
    }

    private static String colorDescuento(String codigo) {
        if (codigo == null) return "#ffffff";
        return switch (codigo) {
            case "ESTUDIANTE" -> "#dbeafe";
            case "POLICIA" -> "#e0e7ff";
            case "SALUD" -> "#dcfce7";
            case "RESIDENCIAL" -> "#fef3c7";
            default -> "#f5f5f4";
        };
    }

    private static String colorMetodo(MetodoPago m) {
        return switch (m) {
            case EFECTIVO -> "#dcfce7";
            case TRANSFERENCIA -> "#dbeafe";
            case DATAFONO -> "#fef3c7";
        };
    }

    private String etiquetaMetodo(String codigo) {
        if (codigo == null) return "—";
        if ("MIXTO".equals(codigo)) return "Mixto";
        try { return etiqueta(MetodoPago.valueOf(codigo)); }
        catch (Exception e) { return codigo; }
    }

    /** Duplica el estilo base y le aplica color de fondo. Cachear afuera. */
    private static XSSFCellStyle tint(XSSFWorkbook wb, CellStyle base, String hex) {
        XSSFCellStyle nuevo = wb.createCellStyle();
        nuevo.cloneStyleFrom(base);
        nuevo.setFillForegroundColor(hexColor(hex));
        nuevo.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return nuevo;
    }

    private static XSSFColor hexColor(String hex) {
        String h = hex.startsWith("#") ? hex.substring(1) : hex;
        byte[] rgb = new byte[]{
                (byte) Integer.parseInt(h.substring(0, 2), 16),
                (byte) Integer.parseInt(h.substring(2, 4), 16),
                (byte) Integer.parseInt(h.substring(4, 6), 16)
        };
        return new XSSFColor(rgb, null);
    }

    // -------------------- helpers --------------------

    private void tituloPagina(Sheet sh, Estilos s, String texto, int row, int colMerge) {
        Row r = sh.createRow(row);
        Cell c = r.createCell(0);
        c.setCellValue(texto);
        c.setCellStyle(s.titulo);
        sh.addMergedRegion(new CellRangeAddress(row, row, 0, colMerge));
        r.setHeightInPoints(28);
    }

    private void subtitulo(Sheet sh, Estilos s, int row, String texto) {
        Row r = sh.createRow(row);
        Cell c = r.createCell(0);
        c.setCellValue(texto);
        c.setCellStyle(s.subtitulo);
    }

    private void headerRow(Sheet sh, Estilos s, int row, String... cols) {
        Row r = sh.createRow(row);
        for (int i = 0; i < cols.length; i++) {
            Cell c = r.createCell(i);
            c.setCellValue(cols[i]);
            c.setCellStyle(s.header);
        }
    }

    private int par(Sheet sh, Estilos s, int row, String etiqueta, String valor) {
        Row r = sh.createRow(row);
        Cell c1 = r.createCell(0);
        c1.setCellValue(etiqueta);
        c1.setCellStyle(s.parametroEtiqueta);
        Cell c2 = r.createCell(1);
        c2.setCellValue(valor != null ? valor : "");
        c2.setCellStyle(s.parametroValor);
        return row + 1;
    }

    private int parCop(Sheet sh, Estilos s, int row, String etiqueta, BigDecimal valor) {
        Row r = sh.createRow(row);
        Cell c1 = r.createCell(0);
        c1.setCellValue(etiqueta);
        c1.setCellStyle(s.parametroEtiqueta);
        Cell c2 = r.createCell(1);
        c2.setCellValue(valor != null ? valor.doubleValue() : 0d);
        c2.setCellStyle(s.parametroCop);
        return row + 1;
    }

    private void celdaTexto(Row r, int col, String v, CellStyle st) {
        Cell c = r.createCell(col);
        c.setCellValue(v != null ? v : "");
        c.setCellStyle(st);
    }

    private void celdaNumero(Row r, int col, Number v, CellStyle st) {
        Cell c = r.createCell(col);
        c.setCellValue(v != null ? v.doubleValue() : 0d);
        c.setCellStyle(st);
    }

    private void celdaCop(Row r, int col, BigDecimal v, CellStyle st) {
        Cell c = r.createCell(col);
        c.setCellValue(v != null ? v.doubleValue() : 0d);
        c.setCellStyle(st);
    }

    private void autosize(Sheet sh, int columns) {
        for (int i = 0; i < columns; i++) {
            sh.autoSizeColumn(i);
            int w = sh.getColumnWidth(i);
            sh.setColumnWidth(i, Math.min(w + 800, 12000));
        }
    }

    private byte[] aBytes(XSSFWorkbook wb) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        return out.toByteArray();
    }

    private String etiqueta(MetodoPago m) {
        return switch (m) {
            case EFECTIVO -> "Efectivo";
            case TRANSFERENCIA -> "Transferencia";
            case DATAFONO -> "Datáfono";
        };
    }

    private String etiqueta(EstadoPedido e) {
        return switch (e) {
            case RECIBIDO -> "Recibido";
            case LAVANDO -> "Lavando";
            case SECANDO -> "Secando";
            case DOBLANDO -> "Doblando";
            case LISTO -> "Listo";
            case ENTREGADO -> "Entregado";
            case CANCELADO -> "Cancelado";
        };
    }

    private static final class Estilos {
        final CellStyle titulo;
        final CellStyle subtitulo;
        final CellStyle header;
        final CellStyle parametroEtiqueta;
        final CellStyle parametroValor;
        final CellStyle parametroCop;
        final CellStyle bordeIzq;
        final CellStyle bordeCentro;
        final CellStyle bordeMonedaDer;
        final CellStyle bordeNumero3;

        Estilos(Workbook wb) {
            DataFormat df = wb.createDataFormat();

            Font fontTitulo = wb.createFont();
            fontTitulo.setBold(true);
            fontTitulo.setFontHeightInPoints((short) 14);

            Font fontHeader = wb.createFont();
            fontHeader.setBold(true);
            fontHeader.setColor(IndexedColors.WHITE.getIndex());

            Font fontEtiqueta = wb.createFont();
            fontEtiqueta.setBold(true);

            titulo = wb.createCellStyle();
            titulo.setFont(fontTitulo);
            titulo.setAlignment(HorizontalAlignment.LEFT);

            subtitulo = wb.createCellStyle();
            Font fontSub = wb.createFont();
            fontSub.setBold(true);
            fontSub.setFontHeightInPoints((short) 12);
            subtitulo.setFont(fontSub);

            header = wb.createCellStyle();
            header.setFont(fontHeader);
            header.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            header.setBorderBottom(BorderStyle.THIN);
            header.setAlignment(HorizontalAlignment.CENTER);

            parametroEtiqueta = wb.createCellStyle();
            parametroEtiqueta.setFont(fontEtiqueta);

            parametroValor = wb.createCellStyle();

            parametroCop = wb.createCellStyle();
            parametroCop.setDataFormat(df.getFormat("\"$\"#,##0"));

            bordeIzq = wb.createCellStyle();
            bordeIzq.setAlignment(HorizontalAlignment.LEFT);
            bordeIzq.setBorderBottom(BorderStyle.HAIR);

            bordeCentro = wb.createCellStyle();
            bordeCentro.setAlignment(HorizontalAlignment.CENTER);
            bordeCentro.setBorderBottom(BorderStyle.HAIR);

            bordeMonedaDer = wb.createCellStyle();
            bordeMonedaDer.setAlignment(HorizontalAlignment.RIGHT);
            bordeMonedaDer.setBorderBottom(BorderStyle.HAIR);
            bordeMonedaDer.setDataFormat(df.getFormat("\"$\"#,##0"));

            bordeNumero3 = wb.createCellStyle();
            bordeNumero3.setAlignment(HorizontalAlignment.RIGHT);
            bordeNumero3.setBorderBottom(BorderStyle.HAIR);
            bordeNumero3.setDataFormat(df.getFormat("#,##0.###"));
        }
    }
}
