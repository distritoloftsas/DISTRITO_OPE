package com.distritoloft.turno;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.MetodoPago;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.PagoRepository;
import com.distritoloft.sede.Sede;
import com.distritoloft.turno.dto.AbrirTurnoRequest;
import com.distritoloft.turno.dto.CerrarTurnoRequest;
import com.distritoloft.turno.dto.CrearGastoRequest;
import com.distritoloft.turno.dto.GastoResponse;
import com.distritoloft.turno.dto.TurnoResponse;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TurnoService {

    private static final OffsetDateTime FECHA_MAX =
            OffsetDateTime.parse("9999-12-31T23:59:59Z");

    private final TurnoCajaRepository turnoRepository;
    private final GastoCajaRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PagoRepository pagoRepository;

    @Transactional
    public TurnoResponse abrir(CustomUserDetails principal, AbrirTurnoRequest req) {
        Usuario empleado = cargarEmpleado(principal);
        Sede sede = sedeDelEmpleado(empleado);

        turnoRepository.findAbiertoPorEmpleado(empleado.getId()).ifPresent(t -> {
            throw new ReglaNegocioException("Ya tienes un turno abierto desde " + t.getFechaApertura() + ".");
        });

        TurnoCaja t = new TurnoCaja();
        t.setEmpleado(empleado);
        t.setSede(sede);
        t.setEfectivoApertura(req.efectivoApertura());
        t.setFechaApertura(OffsetDateTime.now());
        TurnoCaja guardado = turnoRepository.save(t);

        return aResponse(guardado);
    }

    @Transactional(readOnly = true)
    public Optional<TurnoResponse> turnoActual(CustomUserDetails principal) {
        Usuario empleado = cargarEmpleado(principal);
        return turnoRepository.findAbiertoPorEmpleado(empleado.getId())
                .map(this::aResponse);
    }

    @Transactional
    public TurnoResponse cerrar(CustomUserDetails principal, Long turnoId, CerrarTurnoRequest req) {
        Usuario empleado = cargarEmpleado(principal);
        TurnoCaja t = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado: " + turnoId));

        if (!t.getEmpleado().getId().equals(empleado.getId())
                && empleado.getRol() != RolUsuario.GERENTE_SEDE
                && empleado.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("No puedes cerrar el turno de otro empleado.");
        }
        if (!t.estaAbierto()) {
            throw new ReglaNegocioException("Este turno ya fue cerrado.");
        }

        OffsetDateTime ahora = OffsetDateTime.now();
        BigDecimal cobradoEfectivo = pagoRepository.sumarPorEmpleadoYMetodoEnRango(
                t.getEmpleado().getId(), MetodoPago.EFECTIVO, t.getFechaApertura(), ahora);
        BigDecimal gastos = gastoRepository.sumarPorTurno(t.getId());

        BigDecimal esperado = t.getEfectivoApertura()
                .add(cobradoEfectivo)
                .subtract(gastos);
        BigDecimal diferencia = req.efectivoCierreDeclarado().subtract(esperado);

        t.setFechaCierre(ahora);
        t.setEfectivoCierreDeclarado(req.efectivoCierreDeclarado());
        t.setEfectivoEsperado(esperado);
        t.setDiferencia(diferencia);
        t.setObservaciones(req.observaciones());

        return aResponse(t);
    }

    @Transactional
    public GastoResponse registrarGasto(CustomUserDetails principal, Long turnoId, CrearGastoRequest req) {
        Usuario empleado = cargarEmpleado(principal);
        TurnoCaja t = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado: " + turnoId));

        if (!t.estaAbierto()) {
            throw new ReglaNegocioException("El turno está cerrado, no se pueden agregar gastos.");
        }
        if (!t.getEmpleado().getId().equals(empleado.getId())
                && empleado.getRol() != RolUsuario.GERENTE_SEDE
                && empleado.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("No puedes registrar gastos en el turno de otro empleado.");
        }

        GastoCaja g = new GastoCaja();
        g.setTurno(t);
        g.setConcepto(req.concepto().trim());
        g.setMonto(req.monto());
        g.setEmpleado(empleado);
        g.setFecha(OffsetDateTime.now());
        return GastoResponse.from(gastoRepository.save(g));
    }

    @Transactional(readOnly = true)
    public List<TurnoResponse> listarPorSedeEnRango(CustomUserDetails principal,
                                                    Long sedeIdParam,
                                                    OffsetDateTime desde,
                                                    OffsetDateTime hasta) {
        Usuario empleado = cargarEmpleado(principal);
        if (empleado.getRol() != RolUsuario.GERENTE_SEDE
                && empleado.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo gerente o super admin pueden ver el listado de turnos.");
        }

        Long sedeId;
        if (empleado.getRol() == RolUsuario.SUPER_ADMIN) {
            if (sedeIdParam == null) {
                throw new ReglaNegocioException("Debes indicar el parámetro 'sedeId'.");
            }
            sedeId = sedeIdParam;
        } else {
            sedeId = sedeDelEmpleado(empleado).getId();
        }

        OffsetDateTime d = desde != null ? desde : OffsetDateTime.parse("1970-01-01T00:00:00Z");
        OffsetDateTime h = hasta != null ? hasta : FECHA_MAX;
        return turnoRepository.listarPorSede(sedeId, d, h).stream()
                .map(this::aResponse)
                .toList();
    }

    // ------- helpers -------

    private Usuario cargarEmpleado(CustomUserDetails principal) {
        Usuario u = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
        if (u.getRol() == RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("Los clientes no manejan turnos de caja.");
        }
        return u;
    }

    private Sede sedeDelEmpleado(Usuario u) {
        if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
            throw new ReglaNegocioException("El usuario no tiene sede asignada.");
        }
        return u.getEmpleadoPerfil().getSede();
    }

    private TurnoResponse aResponse(TurnoCaja t) {
        List<GastoResponse> gastos = gastoRepository.findByTurnoIdOrderByFechaAsc(t.getId()).stream()
                .map(GastoResponse::from)
                .toList();
        BigDecimal totalGastos = gastos.stream()
                .map(GastoResponse::monto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        OffsetDateTime hasta = t.estaAbierto() ? OffsetDateTime.now() : t.getFechaCierre();
        BigDecimal efectivoCobrado = pagoRepository.sumarPorEmpleadoYMetodoEnRango(
                t.getEmpleado().getId(), MetodoPago.EFECTIVO, t.getFechaApertura(), hasta);

        return TurnoResponse.from(t, efectivoCobrado, totalGastos, gastos);
    }
}
