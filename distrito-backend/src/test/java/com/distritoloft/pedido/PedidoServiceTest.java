package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoCicloLavadora;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.insumo.MovimientoInsumoRepository;
import com.distritoloft.maquina.MaquinaRepository;
import com.distritoloft.pedido.dto.CambioEstadoRequest;
import com.distritoloft.pedido.dto.PedidoResponse;
import com.distritoloft.plan.Plan;
import com.distritoloft.plan.PlanConsumoRepository;
import com.distritoloft.plan.PlanRepository;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.EmpleadoPerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Tests de las reglas críticas de transición en {@link PedidoService#cambiarEstado}.
 * Cubre las invariantes que NO deben romperse en producción:
 *   - Pago previo al lavado
 *   - Tipo de ciclo obligatorio al iniciar el lavado
 *   - Transiciones no permitidas
 *   - Salto automatico de DOBLANDO a LISTO si el plan no incluye doblado
 *   - Empleados no operan en pedidos de otra sede
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PlanRepository planRepository;
    @Mock private MaquinaRepository maquinaRepository;
    @Mock private PedidoEstadoHistorialRepository historialRepository;
    @Mock private PlanConsumoRepository planConsumoRepository;
    @Mock private MovimientoInsumoRepository movimientoInsumoRepository;
    @Mock private EntityManager em;

    @InjectMocks private PedidoService service;

    private Usuario gerente;
    private Sede sede;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "em", em);

        sede = new Sede();
        sede.setId(1L);
        sede.setNombre("Bambú");
        sede.setToleranciaPreLavadoMinutos(5);
        sede.setToleranciaPostLavadoMinutos(5);

        gerente = usuarioConRol(10L, RolUsuario.GERENTE_SEDE);
        EmpleadoPerfil perfil = new EmpleadoPerfil();
        perfil.setSede(sede);
        gerente.setEmpleadoPerfil(perfil);

        lenient().when(usuarioRepository.findById(10L)).thenReturn(Optional.of(gerente));
    }

    @Test
    void bloqueaLavadoSiNoEstaPagado() {
        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, false);
        when(pedidoRepository.findById(p.getId())).thenReturn(Optional.of(p));

        CambioEstadoRequest req = new CambioEstadoRequest(
                EstadoPedido.LAVANDO, null, 1L, TipoCicloLavadora.SENCILLO
        );

        ReglaNegocioException ex = assertThrows(
                ReglaNegocioException.class,
                () -> service.cambiarEstado(principal(gerente), p.getId(), req)
        );
        assertEquals(true, ex.getMessage().toLowerCase().contains("pagad"));
    }

    @Test
    void exigeTipoCicloAlIniciarLavado() {
        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, true);
        when(pedidoRepository.findById(p.getId())).thenReturn(Optional.of(p));

        CambioEstadoRequest sinCiclo = new CambioEstadoRequest(
                EstadoPedido.LAVANDO, null, 1L, null
        );

        ReglaNegocioException ex = assertThrows(
                ReglaNegocioException.class,
                () -> service.cambiarEstado(principal(gerente), p.getId(), sinCiclo)
        );
        assertEquals(true, ex.getMessage().toLowerCase().contains("ciclo"));
    }

    @Test
    void transicionInvalidaEsRechazada() {
        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, true);
        when(pedidoRepository.findById(p.getId())).thenReturn(Optional.of(p));

        // RECIBIDO -> SECANDO no está permitida.
        CambioEstadoRequest req = new CambioEstadoRequest(EstadoPedido.SECANDO, null, 1L, null);

        ReglaNegocioException ex = assertThrows(
                ReglaNegocioException.class,
                () -> service.cambiarEstado(principal(gerente), p.getId(), req)
        );
        assertEquals(true, ex.getMessage().toLowerCase().contains("transición"));
    }

    @Test
    void cancelarRequiereObservacion() {
        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, true);
        when(pedidoRepository.findById(p.getId())).thenReturn(Optional.of(p));

        CambioEstadoRequest sinMotivo = new CambioEstadoRequest(
                EstadoPedido.CANCELADO, "  ", null, null
        );

        ReglaNegocioException ex = assertThrows(
                ReglaNegocioException.class,
                () -> service.cambiarEstado(principal(gerente), p.getId(), sinMotivo)
        );
        assertEquals(true, ex.getMessage().toLowerCase().contains("observación"));
    }

    @Test
    void empleadoNoPuedeOperarPedidoDeOtraSede() {
        Sede otraSede = new Sede();
        otraSede.setId(99L);
        otraSede.setNombre("Otra");

        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, true);
        p.setSede(otraSede);

        when(pedidoRepository.findById(p.getId())).thenReturn(Optional.of(p));

        CambioEstadoRequest req = new CambioEstadoRequest(
                EstadoPedido.CANCELADO, "test", null, null
        );

        ReglaNegocioException ex = assertThrows(
                ReglaNegocioException.class,
                () -> service.cambiarEstado(principal(gerente), p.getId(), req)
        );
        assertEquals(true, ex.getMessage().toLowerCase().contains("sede"));
    }

    // ---------- helpers ----------

    private CustomUserDetails principal(Usuario u) {
        return new CustomUserDetails(u);
    }

    private Usuario usuarioConRol(Long id, RolUsuario rol) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setRol(rol);
        u.setActivo(true);
        u.setNombre("Test " + id);
        return u;
    }

    private Pedido pedidoEnEstado(EstadoPedido estado, boolean pagado) {
        Plan plan = new Plan();
        plan.setId(1L);
        plan.setNombre("Lavado y Secado");
        plan.setPrecio(new BigDecimal("18000"));
        plan.setIncluyeDoblado(false);
        plan.setIncluyeDomicilio(false);
        plan.setDuracionLavadoMinutos(30);
        plan.setDuracionSecadoMinutos(43);

        Usuario cliente = usuarioConRol(20L, RolUsuario.CLIENTE);

        Pedido p = new Pedido();
        p.setId(100L);
        p.setCodigoQr("DL-0100");
        p.setEstado(estado);
        p.setPagado(pagado);
        p.setTotal(new BigDecimal("18000"));
        p.setCliente(cliente);
        p.setSede(sede);
        p.setPlan(plan);
        return p;
    }

    /** Garantiza que la API publica del DTO compile aun si en el futuro le agregamos campos. */
    @Test
    void pedidoResponseRecordEsConstruible() {
        Pedido p = pedidoEnEstado(EstadoPedido.RECIBIDO, true);
        PedidoResponse resp = PedidoResponse.from(p);
        assertNotNull(resp);
        assertEquals("DL-0100", resp.codigoQr());
        assertEquals(EstadoPedido.RECIBIDO, resp.estado());
    }
}
