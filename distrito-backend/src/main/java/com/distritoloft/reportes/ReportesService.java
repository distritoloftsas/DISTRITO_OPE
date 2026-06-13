package com.distritoloft.reportes;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.Pago;
import com.distritoloft.pedido.PagoRepository;
import com.distritoloft.pedido.PedidoRepository;
import com.distritoloft.reportes.dto.CierreCajaResponse;
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

    @Transactional(readOnly = true)
    public CierreCajaResponse cierreCaja(CustomUserDetails principal, LocalDate fecha, Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);

        if (actual.getRol() != RolUsuario.GERENTE_SEDE && actual.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden ver el cierre de caja.");
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

    private Long resolverSede(Usuario actual, Long sedeIdParam) {
        if (actual.getRol() == RolUsuario.GERENTE_SEDE) {
            if (actual.getEmpleadoPerfil() == null || actual.getEmpleadoPerfil().getSede() == null) {
                throw new ReglaNegocioException("El gerente no tiene sede asignada.");
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
