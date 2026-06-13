package com.distritoloft.maquina;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMaquina;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.maquina.dto.MaquinaResponse;
import com.distritoloft.pedido.Pedido;
import com.distritoloft.pedido.PedidoRepository;
import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaquinaService {

    private final MaquinaRepository maquinaRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<MaquinaResponse> listarDeMiSede(CustomUserDetails principal, Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);
        Long sedeId = resolverSede(actual, sedeIdParam);

        List<Maquina> maquinas = maquinaRepository.findBySede(sedeId);

        Map<Long, MaquinaResponse.PedidoEnCurso> porLavadora = new HashMap<>();
        Map<Long, MaquinaResponse.PedidoEnCurso> porSecadora = new HashMap<>();
        for (Pedido p : pedidoRepository.buscarConMaquinaAsignada(sedeId)) {
            if (p.getLavadora() != null) {
                porLavadora.put(p.getLavadora().getId(),
                        new MaquinaResponse.PedidoEnCurso(p.getId(), p.getCodigoQr(), p.getCliente().getNombre()));
            }
            if (p.getSecadora() != null) {
                porSecadora.put(p.getSecadora().getId(),
                        new MaquinaResponse.PedidoEnCurso(p.getId(), p.getCodigoQr(), p.getCliente().getNombre()));
            }
        }

        return maquinas.stream().map(m -> new MaquinaResponse(
                m.getId(),
                m.getTipo(),
                m.getNumero(),
                m.getEstado(),
                m.getTipo() == TipoMaquina.LAVADORA
                        ? porLavadora.get(m.getId())
                        : porSecadora.get(m.getId())
        )).toList();
    }

    @Transactional
    public MaquinaResponse cambiarEstado(CustomUserDetails principal, Long maquinaId, EstadoMaquina nuevo) {
        Usuario actual = cargarUsuarioActual(principal);
        if (actual.getRol() != RolUsuario.GERENTE_SEDE && actual.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el gerente puede cambiar el estado de las máquinas.");
        }

        Maquina m = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Máquina no encontrada: " + maquinaId));

        if (actual.getRol() == RolUsuario.GERENTE_SEDE) {
            Sede sedeGerente = actual.getEmpleadoPerfil().getSede();
            if (!sedeGerente.getId().equals(m.getSede().getId())) {
                throw new ReglaNegocioException("No puedes operar máquinas de otra sede.");
            }
        }

        if (m.getEstado() == EstadoMaquina.OCUPADA && nuevo == EstadoMaquina.MANTENIMIENTO) {
            throw new ReglaNegocioException("No se puede mandar a mantenimiento una máquina ocupada.");
        }
        if (nuevo == EstadoMaquina.OCUPADA) {
            throw new ReglaNegocioException("El estado OCUPADA se asigna automáticamente al avanzar un pedido.");
        }

        m.setEstado(nuevo);
        return new MaquinaResponse(m.getId(), m.getTipo(), m.getNumero(), m.getEstado(), null);
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }

    private Long resolverSede(Usuario u, Long sedeIdParam) {
        if (u.getRol() == RolUsuario.EMPLEADO || u.getRol() == RolUsuario.GERENTE_SEDE) {
            if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
                throw new ReglaNegocioException("El usuario no tiene una sede asignada.");
            }
            return u.getEmpleadoPerfil().getSede().getId();
        }
        if (sedeIdParam == null) {
            throw new ReglaNegocioException("Debes indicar el parámetro 'sedeId'.");
        }
        return sedeIdParam;
    }
}
