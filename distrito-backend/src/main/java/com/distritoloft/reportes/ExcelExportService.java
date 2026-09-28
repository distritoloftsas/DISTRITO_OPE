package com.distritoloft.reportes;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.reportes.dto.CierreCajaResponse;
import com.distritoloft.reportes.dto.ConsolidadoResponse;
import com.distritoloft.reportes.dto.ConsumoInsumosResponse;
import com.distritoloft.reportes.dto.VentasResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xddf.usermodel.PresetColor;
import org.apache.poi.xddf.usermodel.XDDFColor;
import org.apache.poi.xddf.usermodel.XDDFSolidFillProperties;
import org.apache.poi.xddf.usermodel.chart.AxisPosition;
import org.apache.poi.xddf.usermodel.chart.BarDirection;
import org.apache.poi.xddf.usermodel.chart.ChartTypes;
import org.apache.poi.xddf.usermodel.chart.LegendPosition;
import org.apache.poi.xddf.usermodel.chart.XDDFBarChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryAxis;
import org.apache.poi.xddf.usermodel.chart.XDDFChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFChartLegend;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSourcesFactory;
import org.apache.poi.xddf.usermodel.chart.XDDFPieChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFValueAxis;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFDataValidationHelper;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFSheet;
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
            XSSFSheet pedSh = wb.createSheet("Pedidos");
            tituloPagina(pedSh, s, "Pedidos consolidados", 0, 10);
            int r = 2;
            r = par(pedSh, s, r, "Sede", data.sedeNombre());
            r = par(pedSh, s, r, "Desde", data.desde().toString());
            r = par(pedSh, s, r, "Hasta", data.hasta().toString());
            r++;

            // Nota para el usuario: la col "Descuento" tiene dropdown, y las
            // columnas -$ Desc y Total son formulas (F*0.1 si hay descuento).
            Row nota = pedSh.createRow(r++);
            Cell notaCell = nota.createCell(0);
            notaCell.setCellValue("Tip: puedes cambiar el descuento con el desplegable; el monto y el total se recalculan solos.");
            notaCell.setCellStyle(s.parametroValor);
            pedSh.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, 10));

            headerRow(pedSh, s, r++,
                    "Fecha", "Código", "Cliente", "Plan", "Estado",
                    "Subtotal", "Descuento", "-$ Desc", "Domicilio", "Total", "Pago");

            int primeraFilaDatos = r; // 0-indexed

            for (var l : data.pedidos()) {
                Row row = pedSh.createRow(r);
                int filaExcel = r + 1; // 1-indexed para formulas
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

                // Descuento: dropdown con las 4 opciones + "—".
                String etiquetaDesc = l.descuentoEtiqueta() != null ? l.descuentoEtiqueta() : "—";
                Cell cDesc = row.createCell(6);
                cDesc.setCellValue(etiquetaDesc);
                cDesc.setCellStyle(l.descuentoCodigo() != null
                        ? tint(wb, s.bordeCentro, colorDescuento(l.descuentoCodigo()))
                        : centro);

                // -$ Desc: formula IF(descuento vacio o "—"; 0; subtotal * 10%).
                // Todos los descuentos actuales son del 10%. Si en el futuro
                // varian por tipo, esto pasa a VLOOKUP a una hoja de tarifas.
                Cell cMontoDesc = row.createCell(7);
                cMontoDesc.setCellFormula("IF(OR(G" + filaExcel + "=\"—\",G" + filaExcel + "=\"\"),0,F" + filaExcel + "*0.1)");
                cMontoDesc.setCellStyle(moneda);

                celdaCop(row, 8, l.costoDomicilio(), moneda);

                // Total: F - H + I. Se recalcula si el usuario cambia el descuento.
                Cell cTotal = row.createCell(9);
                cTotal.setCellFormula("F" + filaExcel + "-H" + filaExcel + "+I" + filaExcel);
                cTotal.setCellStyle(moneda);

                celdaTexto(row, 10, etiquetaMetodo(l.metodoPago()), centro);
                r++;
            }

            // Fila de totales con SUM sobre las columnas de dinero.
            int ultimaFilaDatos = r; // exclusiva; ultima con datos es r-1
            if (ultimaFilaDatos > primeraFilaDatos) {
                Row totRow = pedSh.createRow(r++);
                Cell etiq = totRow.createCell(4);
                etiq.setCellValue("Totales");
                etiq.setCellStyle(s.parametroEtiqueta);
                int primeraExcel = primeraFilaDatos + 1;
                int ultimaExcel = ultimaFilaDatos; // 1-indexed
                for (int col : new int[]{5, 7, 8, 9}) {
                    char letra = (char) ('A' + col);
                    Cell c = totRow.createCell(col);
                    c.setCellFormula("SUM(" + letra + primeraExcel + ":" + letra + ultimaExcel + ")");
                    c.setCellStyle(s.parametroCop);
                }
            }

            // Dropdown en col G para toda la region de datos.
            if (ultimaFilaDatos > primeraFilaDatos) {
                XSSFDataValidationHelper dvh = new XSSFDataValidationHelper(pedSh);
                DataValidationConstraint constraint = dvh.createExplicitListConstraint(new String[]{
                        "—",
                        "Estudiante universitario",
                        "Policía",
                        "Sector salud (clínicas cercanas)",
                        "Sector residencial (Bambú, Multicentro, Los Tulipanes)"
                });
                CellRangeAddressList rango = new CellRangeAddressList(primeraFilaDatos, ultimaFilaDatos - 1, 6, 6);
                DataValidation dv = dvh.createValidation(constraint, rango);
                dv.setShowErrorBox(true);
                dv.setSuppressDropDownArrow(true);
                pedSh.addValidationData(dv);
            }

            // Recalcular formulas al abrir el Excel.
            wb.setForceFormulaRecalculation(true);
            autosize(pedSh, 11);

            // Rangos de la hoja Pedidos que usan las siguientes hojas.
            // Solo tienen sentido si hubo al menos una fila de datos.
            boolean hayDatos = ultimaFilaDatos > primeraFilaDatos;
            int primeraExcel = primeraFilaDatos + 1;
            int ultimaExcel = ultimaFilaDatos; // 1-indexed inclusiva
            String rangoEstado    = "Pedidos!$E$" + primeraExcel + ":$E$" + ultimaExcel;
            String rangoSubtotal  = "Pedidos!$F$" + primeraExcel + ":$F$" + ultimaExcel;
            String rangoDescLabel = "Pedidos!$G$" + primeraExcel + ":$G$" + ultimaExcel;
            String rangoMontoDesc = "Pedidos!$H$" + primeraExcel + ":$H$" + ultimaExcel;
            String rangoDomicilio = "Pedidos!$I$" + primeraExcel + ":$I$" + ultimaExcel;
            String rangoTotal     = "Pedidos!$J$" + primeraExcel + ":$J$" + ultimaExcel;

            // -------- Hoja 2: Totales --------
            // Todos los valores son formulas que apuntan a la hoja Pedidos,
            // asi cuando el usuario cambia un descuento en Pedidos, aqui se
            // actualiza automatico. Se excluye "Cancelado" del subtotal,
            // descuentos, domicilios y facturado.
            Sheet totSh = wb.createSheet("Totales");
            tituloPagina(totSh, s, "Consolidado del período", 0, 3);
            var t = data.totales();
            int rr = 2;
            if (hayDatos) {
                rr = parFormula(totSh, s, rr, "Cantidad de pedidos",
                        "COUNTA(Pedidos!$B$" + primeraExcel + ":$B$" + ultimaExcel + ")", false);
                rr = parFormula(totSh, s, rr, "Cancelados",
                        "COUNTIF(" + rangoEstado + ",\"Cancelado\")", false);
                rr = parFormula(totSh, s, rr, "Subtotal bruto (sin descuentos)",
                        "SUMIF(" + rangoEstado + ",\"<>Cancelado\"," + rangoSubtotal + ")", true);
                rr = parFormula(totSh, s, rr, "Total descuentos aplicados",
                        "SUMIF(" + rangoEstado + ",\"<>Cancelado\"," + rangoMontoDesc + ")", true);
                rr = parFormula(totSh, s, rr, "Total domicilios",
                        "SUMIF(" + rangoEstado + ",\"<>Cancelado\"," + rangoDomicilio + ")", true);
                rr = parFormula(totSh, s, rr, "Total facturado",
                        "SUMIF(" + rangoEstado + ",\"<>Cancelado\"," + rangoTotal + ")", true);
                rr = parFormula(totSh, s, rr, "Ticket promedio",
                        "IFERROR(SUMIF(" + rangoEstado + ",\"<>Cancelado\"," + rangoTotal + ")"
                                + "/COUNTIF(" + rangoEstado + ",\"<>Cancelado\"),0)", true);
            } else {
                rr = par(totSh, s, rr, "Cantidad de pedidos", "0");
                rr = par(totSh, s, rr, "Cancelados", "0");
                rr = parCop(totSh, s, rr, "Subtotal bruto (sin descuentos)", java.math.BigDecimal.ZERO);
                rr = parCop(totSh, s, rr, "Total descuentos aplicados", java.math.BigDecimal.ZERO);
                rr = parCop(totSh, s, rr, "Total domicilios", java.math.BigDecimal.ZERO);
                rr = parCop(totSh, s, rr, "Total facturado", java.math.BigDecimal.ZERO);
                rr = parCop(totSh, s, rr, "Ticket promedio", java.math.BigDecimal.ZERO);
            }
            // Reembolsos son pedidos cancelados: el usuario no los edita,
            // asi que se mantiene como valor calculado por backend.
            rr = parCop(totSh, s, rr, "Total reembolsos", t.totalReembolsos());
            autosize(totSh, 3);

            // -------- Hoja 3: Descuentos --------
            // Filas fijas para los 4 tipos, cada una con COUNTIFS/SUMIFS que
            // se actualizan cuando el usuario cambia descuentos en Pedidos.
            Sheet descSh = wb.createSheet("Descuentos");
            tituloPagina(descSh, s, "Descuentos aplicados", 0, 4);
            int rd = 2;
            headerRow(descSh, s, rd++, "Tipo", "Cantidad", "Total descontado");
            String[][] categorias = {
                    {"ESTUDIANTE",  "Estudiante universitario"},
                    {"POLICIA",     "Policía"},
                    {"SALUD",       "Sector salud (clínicas cercanas)"},
                    {"RESIDENCIAL", "Sector residencial (Bambú, Multicentro, Los Tulipanes)"}
            };
            for (String[] cat : categorias) {
                Row row = descSh.createRow(rd++);
                XSSFCellStyle color = tint(wb, s.bordeIzq, colorDescuento(cat[0]));
                celdaTexto(row, 0, cat[1], color);
                if (hayDatos) {
                    Cell cant = row.createCell(1);
                    cant.setCellFormula("COUNTIFS(" + rangoDescLabel + ",\"" + cat[1] + "\","
                            + rangoEstado + ",\"<>Cancelado\")");
                    cant.setCellStyle(s.bordeCentro);
                    Cell monto = row.createCell(2);
                    monto.setCellFormula("SUMIFS(" + rangoMontoDesc + ","
                            + rangoDescLabel + ",\"" + cat[1] + "\","
                            + rangoEstado + ",\"<>Cancelado\")");
                    monto.setCellStyle(s.bordeMonedaDer);
                } else {
                    celdaNumero(row, 1, 0, s.bordeCentro);
                    celdaCop(row, 2, java.math.BigDecimal.ZERO, s.bordeMonedaDer);
                }
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

            // -------- Hoja 6: Gráficas --------
            construirHojaGraficas(wb, s, data);

            return aBytes(wb);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private void construirHojaGraficas(XSSFWorkbook wb, Estilos s, ConsolidadoResponse data) {
        XSSFSheet sh = wb.createSheet("Gráficas");
        tituloPagina(sh, s, "Gráficas del período", 0, 6);

        // 1) Ventas por plan: agrupar pedidos no cancelados por nombre de plan.
        Map<String, java.math.BigDecimal> ventasPorPlan = new java.util.LinkedHashMap<>();
        for (var l : data.pedidos()) {
            if (l.estado() == EstadoPedido.CANCELADO) continue;
            ventasPorPlan.merge(l.planNombre(),
                    l.total() != null ? l.total() : java.math.BigDecimal.ZERO,
                    java.math.BigDecimal::add);
        }

        // Tabla de datos para el chart 1 (col A/B, filas 3..N).
        int rp = 2;
        subtitulo(sh, s, rp++, "Ventas por plan");
        headerRow(sh, s, rp++, "Plan", "Total");
        int filaInicioPlanes = rp;
        for (var e : ventasPorPlan.entrySet()) {
            Row row = sh.createRow(rp++);
            celdaTexto(row, 0, e.getKey(), s.bordeIzq);
            celdaCop(row, 1, e.getValue(), s.bordeMonedaDer);
        }
        int filaFinPlanes = rp - 1;

        // Tabla chart 2 (Descuentos por tipo) en col D/E.
        int rd = 2;
        Row rowSubDesc = sh.getRow(rd);
        if (rowSubDesc == null) rowSubDesc = sh.createRow(rd);
        Cell subDesc = rowSubDesc.createCell(3);
        subDesc.setCellValue("Descuentos por tipo");
        subDesc.setCellStyle(s.subtitulo);
        rd++;
        Row rowHeaderDesc = sh.getRow(rd);
        if (rowHeaderDesc == null) rowHeaderDesc = sh.createRow(rd);
        Cell hd1 = rowHeaderDesc.createCell(3);
        hd1.setCellValue("Tipo");
        hd1.setCellStyle(s.header);
        Cell hd2 = rowHeaderDesc.createCell(4);
        hd2.setCellValue("Monto");
        hd2.setCellStyle(s.header);
        rd++;
        int filaInicioDesc = rd;
        for (var d : data.descuentosPorTipo()) {
            Row row = sh.getRow(rd);
            if (row == null) row = sh.createRow(rd);
            Cell c1 = row.createCell(3);
            c1.setCellValue(d.etiqueta());
            c1.setCellStyle(s.bordeIzq);
            Cell c2 = row.createCell(4);
            c2.setCellValue(d.montoDescontado() != null ? d.montoDescontado().doubleValue() : 0d);
            c2.setCellStyle(s.bordeMonedaDer);
            rd++;
        }
        int filaFinDesc = rd - 1;

        // Tabla chart 3 (Pagos por método) en col G/H.
        int rm = 2;
        Row rowSubPag = sh.getRow(rm);
        if (rowSubPag == null) rowSubPag = sh.createRow(rm);
        Cell subPag = rowSubPag.createCell(6);
        subPag.setCellValue("Pagos por método");
        subPag.setCellStyle(s.subtitulo);
        rm++;
        Row rowHeaderPag = sh.getRow(rm);
        if (rowHeaderPag == null) rowHeaderPag = sh.createRow(rm);
        Cell hm1 = rowHeaderPag.createCell(6);
        hm1.setCellValue("Método");
        hm1.setCellStyle(s.header);
        Cell hm2 = rowHeaderPag.createCell(7);
        hm2.setCellValue("Monto");
        hm2.setCellStyle(s.header);
        rm++;
        int filaInicioPag = rm;
        for (var pm : data.pagosPorMetodo()) {
            Row row = sh.getRow(rm);
            if (row == null) row = sh.createRow(rm);
            Cell c1 = row.createCell(6);
            c1.setCellValue(etiqueta(pm.metodo()));
            c1.setCellStyle(s.bordeIzq);
            Cell c2 = row.createCell(7);
            c2.setCellValue(pm.monto() != null ? pm.monto().doubleValue() : 0d);
            c2.setCellStyle(s.bordeMonedaDer);
            rm++;
        }
        int filaFinPag = rm - 1;

        for (int i = 0; i < 8; i++) sh.setColumnWidth(i, 5000);

        XSSFDrawing drawing = sh.createDrawingPatriarch();

        // Zona debajo de las tablas para los charts.
        int filaAncla = Math.max(filaFinPlanes, Math.max(filaFinDesc, filaFinPag)) + 3;

        // --- Chart 1: Ventas por plan (barras) ---
        if (filaFinPlanes >= filaInicioPlanes) {
            XSSFClientAnchor anchor1 = drawing.createAnchor(0, 0, 0, 0,
                    0, filaAncla, 6, filaAncla + 18);
            XSSFChart chart1 = drawing.createChart(anchor1);
            chart1.setTitleText("Ventas por plan");
            chart1.setTitleOverlay(false);
            XDDFChartLegend leg1 = chart1.getOrAddLegend();
            leg1.setPosition(LegendPosition.BOTTOM);

            XDDFCategoryAxis cat = chart1.createCategoryAxis(AxisPosition.BOTTOM);
            XDDFValueAxis val = chart1.createValueAxis(AxisPosition.LEFT);
            val.setCrosses(org.apache.poi.xddf.usermodel.chart.AxisCrosses.AUTO_ZERO);

            var categorias = XDDFDataSourcesFactory.fromStringCellRange(sh,
                    new CellRangeAddress(filaInicioPlanes, filaFinPlanes, 0, 0));
            var valores = XDDFDataSourcesFactory.fromNumericCellRange(sh,
                    new CellRangeAddress(filaInicioPlanes, filaFinPlanes, 1, 1));

            XDDFBarChartData bar = (XDDFBarChartData) chart1.createData(ChartTypes.BAR, cat, val);
            bar.setBarDirection(BarDirection.COL);
            XDDFChartData.Series serie = bar.addSeries(categorias, valores);
            serie.setTitle("Total ($)", null);
            var fill = new XDDFSolidFillProperties(XDDFColor.from(PresetColor.STEEL_BLUE));
            ((XDDFBarChartData.Series) serie).setFillProperties(fill);
            chart1.plot(bar);
        }

        // --- Chart 2: Descuentos por tipo (pie) ---
        if (filaFinDesc >= filaInicioDesc) {
            XSSFClientAnchor anchor2 = drawing.createAnchor(0, 0, 0, 0,
                    7, filaAncla, 13, filaAncla + 18);
            XSSFChart chart2 = drawing.createChart(anchor2);
            chart2.setTitleText("Descuentos por tipo");
            chart2.setTitleOverlay(false);
            XDDFChartLegend leg2 = chart2.getOrAddLegend();
            leg2.setPosition(LegendPosition.RIGHT);

            var cats = XDDFDataSourcesFactory.fromStringCellRange(sh,
                    new CellRangeAddress(filaInicioDesc, filaFinDesc, 3, 3));
            var vals = XDDFDataSourcesFactory.fromNumericCellRange(sh,
                    new CellRangeAddress(filaInicioDesc, filaFinDesc, 4, 4));

            XDDFPieChartData pie = (XDDFPieChartData) chart2.createData(ChartTypes.PIE, null, null);
            pie.setVaryColors(true);
            pie.addSeries(cats, vals).setTitle("Descuentos", null);
            chart2.plot(pie);
        }

        // --- Chart 3: Pagos por método (pie) debajo del chart 1 ---
        if (filaFinPag >= filaInicioPag) {
            int anclaChart3 = filaAncla + 20;
            XSSFClientAnchor anchor3 = drawing.createAnchor(0, 0, 0, 0,
                    0, anclaChart3, 6, anclaChart3 + 18);
            XSSFChart chart3 = drawing.createChart(anchor3);
            chart3.setTitleText("Pagos por método");
            chart3.setTitleOverlay(false);
            XDDFChartLegend leg3 = chart3.getOrAddLegend();
            leg3.setPosition(LegendPosition.RIGHT);

            var cats = XDDFDataSourcesFactory.fromStringCellRange(sh,
                    new CellRangeAddress(filaInicioPag, filaFinPag, 6, 6));
            var vals = XDDFDataSourcesFactory.fromNumericCellRange(sh,
                    new CellRangeAddress(filaInicioPag, filaFinPag, 7, 7));

            XDDFPieChartData pie = (XDDFPieChartData) chart3.createData(ChartTypes.PIE, null, null);
            pie.setVaryColors(true);
            pie.addSeries(cats, vals).setTitle("Pagos", null);
            chart3.plot(pie);
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

    /** Etiqueta + formula. Si esCop pone formato monetario, si no numero simple. */
    private int parFormula(Sheet sh, Estilos s, int row, String etiqueta, String formula, boolean esCop) {
        Row r = sh.createRow(row);
        Cell c1 = r.createCell(0);
        c1.setCellValue(etiqueta);
        c1.setCellStyle(s.parametroEtiqueta);
        Cell c2 = r.createCell(1);
        c2.setCellFormula(formula);
        c2.setCellStyle(esCop ? s.parametroCop : s.parametroValor);
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
