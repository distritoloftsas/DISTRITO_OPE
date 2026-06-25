package com.distritoloft.sede;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMaquina;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.maquina.Maquina;
import com.distritoloft.maquina.MaquinaRepository;
import com.distritoloft.pedido.Pago;
import com.distritoloft.pedido.PagoRepository;
import com.distritoloft.pedido.PedidoRepository;
import com.distritoloft.sede.SedeController.MiSedeResponse;
import com.distritoloft.sede.dto.CrearSedeRequest;
import com.distritoloft.sede.dto.SedeResumenAdminResponse;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SedeService {

    private static final ZoneId ZONA = ZoneId.of("America/Bogota");
    private static final List<EstadoPedido> ESTADOS_ACTIVOS = List.of(
            EstadoPedido.RECIBIDO, EstadoPedido.LAVANDO, EstadoPedido.SECANDO,
            EstadoPedido.DOBLANDO, EstadoPedido.LISTO
    );

    private final SedeRepository sedeRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final MaquinaRepository maquinaRepository;

    @Transactional(readOnly = true)
    public List<SedeResumenAdminResponse> listarConKpis(CustomUserDetails principal) {
        soloSuperAdmin(principal);

        LocalDate hoy = LocalDate.now(ZONA);
        OffsetDateTime desde = hoy.atStartOfDay(ZONA).toOffsetDateTime();
        OffsetDateTime hasta = hoy.plusDays(1).atStartOfDay(ZONA).toOffsetDateTime();

        return sedeRepository.findAll().stream().map(s -> {
            long activos = pedidoRepository.contarPorSedeYEstados(s.getId(), ESTADOS_ACTIVOS);
            long pedidosHoy = pedidoRepository.contarPorSedeEnRangoRecepcion(s.getId(), desde, hasta);

            List<Pago> pagosHoy = pagoRepository.findPagosEntre(s.getId(), desde, hasta);
            BigDecimal ingresosHoy = pagosHoy.stream().map(Pago::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long empleados = usuarioRepository.contarEmpleadosActivosPorSede(s.getId());
            List<Maquina> maquinas = maquinaRepository.findBySede(s.getId());

            long libres = maquinas.stream().filter(m -> m.getEstado() == EstadoMaquina.LIBRE).count();
            long ocupadas = maquinas.stream().filter(m -> m.getEstado() == EstadoMaquina.OCUPADA).count();
            long mant = maquinas.stream().filter(m -> m.getEstado() == EstadoMaquina.MANTENIMIENTO).count();

            return new SedeResumenAdminResponse(
                    s.getId(), s.getNombre(), s.getCiudad(), s.getActiva(),
                    activos, pedidosHoy, ingresosHoy, empleados, libres, ocupadas, mant
            );
        }).toList();
    }

    @Transactional
    public Sede crear(CustomUserDetails principal, CrearSedeRequest req) {
        soloSuperAdmin(principal);

        if (sedeRepository.findByNombre(req.nombre()).isPresent()) {
            throw new ReglaNegocioException("Ya existe una sede con ese nombre.");
        }

        Sede s = new Sede();
        s.setNombre(req.nombre());
        s.setDireccion(req.direccion());
        s.setCiudad(req.ciudad());
        s.setTelefono(req.telefono());
        s.setActiva(true);
        Sede guardada = sedeRepository.save(s);

        // Crear 3 lavadoras + 3 secadoras por defecto.
        for (short n = 1; n <= 3; n++) {
            crearMaquina(guardada, TipoMaquina.LAVADORA, n);
            crearMaquina(guardada, TipoMaquina.SECADORA, n);
        }
        return guardada;
    }

    @Transactional
    public Sede cambiarActiva(CustomUserDetails principal, Long sedeId, boolean activa) {
        soloSuperAdmin(principal);
        Sede s = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));
        s.setActiva(activa);
        return s;
    }

    @Transactional
    public MiSedeResponse actualizarTolerancia(CustomUserDetails principal, Long sedeId, int preMin, int postMin) {
        if (preMin < 0 || postMin < 0) {
            throw new ReglaNegocioException("La tolerancia no puede ser negativa.");
        }
        Usuario actual = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));

        if (actual.getRol() != RolUsuario.SUPER_ADMIN) {
            if (actual.getRol() != RolUsuario.GERENTE_SEDE
                    || actual.getEmpleadoPerfil() == null
                    || actual.getEmpleadoPerfil().getSede() == null
                    || !actual.getEmpleadoPerfil().getSede().getId().equals(sedeId)) {
                throw new ReglaNegocioException("No puede modificar la tolerancia de otra sede.");
            }
        }
        Sede s = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));
        s.setToleranciaPreLavadoMinutos(preMin);
        s.setToleranciaPostLavadoMinutos(postMin);
        return new MiSedeResponse(s.getId(), s.getNombre(),
                s.getToleranciaPreLavadoMinutos(), s.getToleranciaPostLavadoMinutos());
    }

    @Transactional(readOnly = true)
    public MiSedeResponse miSede(CustomUserDetails principal) {
        Usuario actual = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
        if (actual.getEmpleadoPerfil() == null || actual.getEmpleadoPerfil().getSede() == null) {
            throw new ReglaNegocioException("El usuario no tiene sede asignada.");
        }
        Long sedeId = actual.getEmpleadoPerfil().getSede().getId();
        Sede s = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));
        return new MiSedeResponse(s.getId(), s.getNombre(),
                s.getToleranciaPreLavadoMinutos(), s.getToleranciaPostLavadoMinutos());
    }

    private void crearMaquina(Sede sede, TipoMaquina tipo, short numero) {
        Maquina m = new Maquina();
        m.setSede(sede);
        m.setTipo(tipo);
        m.setNumero(numero);
        m.setEstado(EstadoMaquina.LIBRE);
        maquinaRepository.save(m);
    }

    private void soloSuperAdmin(CustomUserDetails principal) {
        Usuario actual = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
        if (actual.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el super admin puede operar sobre sedes.");
        }
    }
}
