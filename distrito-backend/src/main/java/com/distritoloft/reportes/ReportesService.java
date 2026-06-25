package com.distritoloft.reportes;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMovimientoInsumo;
import com.distritoloft.insumo.MovimientoInsumo;
import com.distritoloft.insumo.MovimientoInsumoRepository;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.Pago;
import com.distritoloft.pedido.PagoRepository;
import com.distritoloft.pedido.PedidoRepository;
import com.distritoloft.pedido.Pedido;
import com.distritoloft.reportes.dto.CierreCajaResponse;
import com.distritoloft.reportes.dto.ConsumoInsumosResponse;
import com.distritoloft.reportes.dto.VentasResponse;
import com.distritoloft.sede.Sede;
import com.distritoloft.sede.SedeRepository;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    private final PagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;
    private final SedeRepository sedeRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoInsumoRepository movimientoInsumoRepository;

    @Transactional(readOnly = true)
    public CierreCajaResponse cierreCaja(CustomUserDetails principal, LocalDate fecha, Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);

        if (actual.getRol() == RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("Los clientes no tienen acceso al cierre de caja.");
        }

        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now(ZONA_COLOMBIA);

        Long sedeId = resolverSede(actual, sedeIdParam);
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));

        OffsetDateTime desde = fechaConsulta.atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();
        OffsetDateTime hasta = fechaConsulta.plusDays(1).atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();

        List<Pago> pagos = pagoRepository.findPagosEntre(sedeId, desde, hasta);

        BigDecimal totalIngresos = BigDecimal.ZERO;
        Map<MetodoPago, CierreCajaResponse.TotalPorMetodo> porMetodo = new EnumMap<>(MetodoPago.class);
        Map<MetodoPago, BigDecimal> sumas = new EnumMap<>(MetodoPago.class);
        Map<MetodoPago, Integer> conteos = new EnumMap<>(MetodoPago.class);

        for (Pago p : pagos) {
            totalIngresos = totalIngresos.add(p.getMonto());
            sumas.merge(p.getMetodo(), p.getMonto(), BigDecimal::add);
            conteos.merge(p.getMetodo(), 1, Integer::sum);
        }
        for (MetodoPago m : MetodoPago.values()) {
            porMetodo.put(m, new CierreCajaResponse.TotalPorMetodo(
                    conteos.getOrDefault(m, 0),
                    sumas.getOrDefault(m, BigDecimal.ZERO)
            ));
        }

        Map<EstadoPedido, Long> pedidosPorEstado = new EnumMap<>(EstadoPedido.class);
        for (EstadoPedido estado : EstadoPedido.values()) {
            pedidosPorEstado.put(estado,
                    pedidoRepository.contarPorSedeEstadoYFechaRecepcion(sedeId, estado, desde, hasta));
        }

        long lavadosEntregados = pedidoRepository.contarPorEstadoYFechaEntregaReal(
                sedeId, EstadoPedido.ENTREGADO, desde, hasta);

        List<CierreCajaResponse.PagoDetalle> detalles = pagos.stream()
                .map(p -> new CierreCajaResponse.PagoDetalle(
                        p.getId(),
                        p.getFecha(),
                        p.getMetodo(),
                        p.getMonto(),
                        p.getReferencia(),
                        p.getEmpleado() != null ? p.getEmpleado().getNombre() : null,
                        p.getPedido().getCodigoQr(),
                        p.getPedido().getCliente().getNombre()
                ))
                .toList();

        return new CierreCajaResponse(
                fechaConsulta,
                new CierreCajaResponse.SedeResumen(sede.getId(), sede.getNombre()),
                totalIngresos,
                pagos.size(),
                porMetodo,
                pedidosPorEstado,
                lavadosEntregados,
                detalles
        );
    }

    @Transactional(readOnly = true)
    public ConsumoInsumosResponse consumoInsumos(CustomUserDetails principal,
                                                 LocalDate desde, LocalDate hasta,
                                                 Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);
        if (actual.getRol() != RolUsuario.GERENTE_SEDE && actual.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden ver este reporte.");
        }

        LocalDate desdeReal = desde != null ? desde : LocalDate.now(ZONA_COLOMBIA);
        LocalDate hastaReal = hasta != null ? hasta : LocalDate.now(ZONA_COLOMBIA);
        if (hastaReal.isBefore(desdeReal)) {
            throw new ReglaNegocioException("La fecha hasta no puede ser anterior a desde.");
        }

        Long sedeId = resolverSede(actual, sedeIdParam);
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));

        OffsetDateTime od = desdeReal.atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();
        OffsetDateTime oh = hastaReal.plusDays(1).atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();

        List<MovimientoInsumo> consumos = movimientoInsumoRepository.movimientosPorTipoEnRango(
                sedeId, TipoMovimientoInsumo.CONSUMO, od, oh);

        // Agrupar por insumo.
        java.util.Map<Long, java.util.List<MovimientoInsumo>> porInsumo = new java.util.LinkedHashMap<>();
        for (MovimientoInsumo m : consumos) {
            porInsumo.computeIfAbsent(m.getInsumo().getId(), k -> new java.util.ArrayList<>()).add(m);
        }

        BigDecimal costoTotal = BigDecimal.ZERO;
        java.util.Set<Long> pedidosUnicos = new java.util.HashSet<>();
        List<ConsumoInsumosResponse.LineaInsumo> lineas = new java.util.ArrayList<>();

        for (var entry : porInsumo.entrySet()) {
            var movs = entry.getValue();
            BigDecimal cantidad = BigDecimal.ZERO;
            BigDecimal costo = BigDecimal.ZERO;
            java.util.Set<Long> pedidosInsumo = new java.util.HashSet<>();
            for (MovimientoInsumo m : movs) {
                cantidad = cantidad.add(m.getCantidad());
                if (m.getCostoUnitario() != null) {
                    costo = costo.add(m.getCostoUnitario().multiply(m.getCantidad()));
                }
                if (m.getPedido() != null) {
                    pedidosInsumo.add(m.getPedido().getId());
                    pedidosUnicos.add(m.getPedido().getId());
                }
            }
            costoTotal = costoTotal.add(costo);
            var primero = movs.get(0).getInsumo();
            lineas.add(new ConsumoInsumosResponse.LineaInsumo(
                    primero.getId(), primero.getNombre(), primero.getUnidad(),
                    cantidad, costo, movs.size(), pedidosInsumo.size()
            ));
        }

        lineas.sort((a, b) -> b.costoTotal().compareTo(a.costoTotal()));

        return new ConsumoInsumosResponse(
                desdeReal, hastaReal, sede.getId(), sede.getNombre(),
                costoTotal, pedidosUnicos.size(), lineas
        );
    }

    @Transactional(readOnly = true)
    public VentasResponse ventas(CustomUserDetails principal,
                                 LocalDate desde, LocalDate hasta,
                                 Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);
        if (actual.getRol() != RolUsuario.GERENTE_SEDE && actual.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden ver este reporte.");
        }

        LocalDate desdeReal = desde != null ? desde : LocalDate.now(ZONA_COLOMBIA);
        LocalDate hastaReal = hasta != null ? hasta : LocalDate.now(ZONA_COLOMBIA);
        if (hastaReal.isBefore(desdeReal)) {
            throw new ReglaNegocioException("La fecha hasta no puede ser anterior a desde.");
        }

        Long sedeId = resolverSede(actual, sedeIdParam);
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));

        OffsetDateTime od = desdeReal.atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();
        OffsetDateTime oh = hastaReal.plusDays(1).atStartOfDay(ZONA_COLOMBIA).toOffsetDateTime();

        List<Pedido> pedidos = pedidoRepository.ventasPorSedeEnRango(sedeId, od, oh, EstadoPedido.CANCELADO);

        BigDecimal totalVentas = BigDecimal.ZERO;
        List<VentasResponse.LineaVenta> lineas = new java.util.ArrayList<>(pedidos.size());
        for (Pedido p : pedidos) {
            totalVentas = totalVentas.add(p.getTotal() != null ? p.getTotal() : BigDecimal.ZERO);
            lineas.add(new VentasResponse.LineaVenta(
                    p.getId(),
                    p.getCodigoQr(),
                    p.getFechaRecepcion(),
                    p.getCliente() != null ? p.getCliente().getNombre() : "",
                    p.getPlan() != null ? p.getPlan().getNombre() : "",
                    p.getTotal(),
                    p.getPagado(),
                    p.getEstado()
            ));
        }

        return new VentasResponse(
                desdeReal, hastaReal, sede.getId(), sede.getNombre(),
                totalVentas, pedidos.size(), lineas
        );
    }

    private Long resolverSede(Usuario actual, Long sedeIdParam) {
        // Gerente y empleado siempre operan sobre su propia sede; ignoran sedeId.
        if (actual.getRol() == RolUsuario.GERENTE_SEDE
                || actual.getRol() == RolUsuario.EMPLEADO) {
            if (actual.getEmpleadoPerfil() == null || actual.getEmpleadoPerfil().getSede() == null) {
                throw new ReglaNegocioException("El usuario no tiene sede asignada.");
            }
            return actual.getEmpleadoPerfil().getSede().getId();
        }
        if (sedeIdParam == null) {
            throw new ReglaNegocioException("Debes indicar el parámetro 'sedeId'.");
        }
        return sedeIdParam;
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }
}
